"""
AI Engine — Electrical Appliance Troubleshooting Specialist

Provides three core functions:
1. analyze_image() — diagnose from appliance photo
2. analyze_text() — diagnose from text description
3. chat_response() — multi-turn troubleshooting chat
"""

import json
import re
import logging
from PIL import Image
from decouple import config
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
if GEMINI_API_KEY and GEMINI_API_KEY != 'your_gemini_api_key_here':
    genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-1.5-flash')

# ============================================================
# Shared prompt components
# ============================================================

APPLIANCE_LIST = (
    "Ceiling Fan, Cooler, AC, Refrigerator, Washing Machine, Water Pump, "
    "TV, Mixer Grinder, Microwave, Electric Iron, Geyser, "
    "or General Electrical Appliance"
)

RESPONSE_SCHEMA = '''{
  "appliance_category": "one of: ceiling_fan, cooler, ac, refrigerator, washing_machine, water_pump, tv, mixer_grinder, microwave, electric_iron, geyser, general",
  "issue": "Brief name of the detected issue",
  "severity": "low | medium | high | critical",
  "confidence_score": 0.85,
  "repair_steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "tools_required": ["Tool A", "Tool B"],
  "safety_warnings": [
    "Warning 1",
    "Warning 2"
  ],
  "technician_required": false,
  "repair_difficulty": "Easy | Moderate | Difficult | Professional Only",
  "estimated_cost": "₹200 - ₹500",
  "estimated_time": "30 minutes - 1 hour"
}'''

SYSTEM_CONTEXT = f"""You are an expert Electrical Appliance Repair Technician AI assistant.
You specialize in diagnosing and providing repair guidance for household electrical appliances
including: {APPLIANCE_LIST}.

Your target users are normal people with little technical knowledge. 
Always provide clear, simple, step-by-step instructions that a non-technical person can follow.

CRITICAL SAFETY RULES:
- Always warn about electrical safety (disconnect power before any repair)
- If the issue involves high voltage, gas, or refrigerant — recommend a professional technician
- Never suggest repairs that could cause electrical shock, fire, or injury to untrained persons
- Rate severity as 'critical' for any issue involving exposed wiring, burning smell, sparks, or water near electricity

Always respond with ONLY valid JSON matching this exact schema (no markdown, no extra text):
{RESPONSE_SCHEMA}
"""


# ============================================================
# JSON parsing utilities
# ============================================================

def _parse_ai_json(text):
    """Robustly extract JSON from AI response text."""
    if not text:
        return None

    cleaned = text.strip()

    # Remove markdown code fences
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object in text
    match = re.search(r'\{[\s\S]*\}', cleaned)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


def _fallback_response(error_msg='Analysis unavailable'):
    """Return a graceful fallback when AI fails."""
    return {
        'appliance_category': 'general',
        'issue': 'Unable to complete analysis. Please try again or describe the issue in more detail.',
        'severity': 'medium',
        'confidence_score': 0.0,
        'repair_steps': [
            'Ensure the appliance is unplugged from the power source.',
            'Check for any visible damage such as frayed wires, burn marks, or loose connections.',
            'If you notice any burning smell or sparks, do NOT attempt repair — call a qualified electrician.',
            'Try the appliance in a different power outlet to rule out outlet issues.',
            'If the problem persists, consult a professional technician.',
        ],
        'tools_required': [],
        'safety_warnings': [
            'Always disconnect the appliance from power before inspecting.',
            'Do not touch any internal components if you are unsure.',
            'Keep water away from electrical components.',
        ],
        'technician_required': True,
        'repair_difficulty': 'Professional Only',
        'estimated_cost': 'Varies — consult a technician',
        'estimated_time': 'Varies',
    }


def _validate_result(result):
    """Ensure all required fields exist with correct types."""
    defaults = _fallback_response()
    validated = {}

    validated['appliance_category'] = str(result.get('appliance_category', defaults['appliance_category']))
    validated['issue'] = str(result.get('issue', defaults['issue']))

    severity = str(result.get('severity', 'medium')).lower()
    if severity not in ('low', 'medium', 'high', 'critical'):
        severity = 'medium'
    validated['severity'] = severity

    try:
        validated['confidence_score'] = float(result.get('confidence_score', 0.0))
        if validated['confidence_score'] > 1:
            validated['confidence_score'] = validated['confidence_score'] / 100.0
    except (ValueError, TypeError):
        validated['confidence_score'] = 0.0

    validated['repair_steps'] = result.get('repair_steps', defaults['repair_steps'])
    if not isinstance(validated['repair_steps'], list):
        validated['repair_steps'] = [str(validated['repair_steps'])]

    validated['tools_required'] = result.get('tools_required', result.get('required_tools', []))
    if not isinstance(validated['tools_required'], list):
        validated['tools_required'] = []

    validated['safety_warnings'] = result.get('safety_warnings', result.get('safety_precautions', []))
    if not isinstance(validated['safety_warnings'], list):
        validated['safety_warnings'] = []

    validated['technician_required'] = bool(result.get('technician_required', False))
    validated['repair_difficulty'] = str(result.get('repair_difficulty', ''))
    validated['estimated_cost'] = str(result.get('estimated_cost', ''))
    validated['estimated_time'] = str(result.get('estimated_time', ''))

    return validated


# ============================================================
# Core analysis functions
# ============================================================

def analyze_image(image_file, appliance_hint=None):
    """Analyze an uploaded image for electrical appliance issues."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        return _fallback_response('Gemini API key not configured')

    try:
        img = Image.open(image_file)

        hint_text = ''
        if appliance_hint and appliance_hint != 'general':
            hint_text = f"\nThe user believes this is a: {appliance_hint}."

        prompt = f"""{SYSTEM_CONTEXT}

Analyze this image of an electrical appliance. Identify the appliance type, detect any damage, malfunction, or issue visible in the image.{hint_text}

If no damage is detected, describe the appliance condition and set severity to "low" with appropriate guidance.

Respond with ONLY valid JSON matching the schema above."""

        response = model.generate_content([prompt, img])
        result = _parse_ai_json(response.text)

        if result:
            return _validate_result(result)

        logger.warning('Failed to parse AI response for image analysis')
        return _fallback_response('Could not parse AI response')

    except Exception as e:
        logger.error(f'Image analysis error: {e}')
        return _fallback_response()


def analyze_text(description, appliance_category=None):
    """Analyze a text description of an appliance issue."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        return _fallback_response('Gemini API key not configured')

    try:
        category_hint = ''
        if appliance_category and appliance_category != 'general':
            category_hint = f"\nAppliance type: {appliance_category}."

        prompt = f"""{SYSTEM_CONTEXT}

A user has described the following issue with their electrical appliance:{category_hint}

User description: "{description}"

Based on this description, diagnose the probable issue and provide repair guidance.
Respond with ONLY valid JSON matching the schema above."""

        response = model.generate_content(prompt)
        result = _parse_ai_json(response.text)

        if result:
            return _validate_result(result)

        logger.warning('Failed to parse AI response for text analysis')
        return _fallback_response('Could not parse AI response')

    except Exception as e:
        logger.error(f'Text analysis error: {e}')
        return _fallback_response()


def chat_response(messages, context=None, appliance_category=None):
    """Generate a multi-turn chat response for troubleshooting."""
    if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_gemini_api_key_here':
        return ("I'm currently unable to connect to the AI service. "
                "Please ensure the Gemini API key is configured and try again.")

    try:
        context_text = ''
        if context:
            context_text = f"\nPrevious diagnosis context: {json.dumps(context)}"

        category_text = ''
        if appliance_category:
            category_text = f"\nThe user is asking about: {appliance_category}."

        system_prompt = f"""You are an expert Electrical Appliance Repair Assistant.
You help users troubleshoot and repair household electrical appliances including: {APPLIANCE_LIST}.

Your responses should be:
- Clear and easy for non-technical users to understand
- Safety-conscious — always warn about electrical hazards
- Practical with actionable steps
- Honest about when professional help is needed
{context_text}{category_text}

Respond in plain text (NOT JSON). Be conversational, helpful, and concise."""

        # Build conversation history for Gemini
        chat_history = [{'role': 'user', 'parts': [system_prompt]}]
        chat_history.append({'role': 'model', 'parts': [
            'I understand. I\'m your Electrical Appliance Repair Assistant. '
            'I\'ll help you diagnose and fix issues with your household appliances safely. '
            'What can I help you with?'
        ]})

        for msg in messages:
            role = 'user' if msg.get('role') == 'user' else 'model'
            content = msg.get('content', '')
            if content:
                chat_history.append({'role': role, 'parts': [content]})

        # Ensure last message is from user
        if chat_history[-1]['role'] != 'user':
            return "Could you please describe your appliance issue?"

        response = model.generate_content(chat_history)
        return response.text.strip()

    except Exception as e:
        logger.error(f'Chat response error: {e}')
        return ("I encountered an issue processing your request. "
                "Please try rephrasing your question or check your internet connection.")