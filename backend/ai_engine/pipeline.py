"""
AI Analysis Pipeline.
Orchestrates image preprocessing, OCR, RAG retrieval, prompt building,
AI provider invocation, response validation, and parsing.
"""
import json
import logging
import re
from django.conf import settings

from .providers import get_ai_provider
from .prompts import get_prompt_template
from .preprocessing import preprocess_image
from .ocr import extract_text_from_image
from .rag.retriever import retrieve_relevant_knowledge

logger = logging.getLogger(__name__)


def _parse_and_validate_json(raw_text):
    """Robustly extracts and parses JSON from AI string response."""
    if not raw_text:
        return {}

    cleaned = raw_text.strip()

    # Remove markdown code fences if present
    cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    cleaned = cleaned.strip()

    # Try direct parsing
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try matching first { and last }
    match = re.search(r'\{[\s\S]*\}', cleaned)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    logger.warning('Failed to parse JSON from raw text: %s', raw_text[:200])
    return {}


def _fallback_result(category_slug='other', issue='General Fault'):
    """Fallback dict if AI fails or returns malformed response."""
    return {
        'device_name': 'Unknown Device',
        'appliance_category': category_slug,
        'issue': issue or 'Troubleshooting needed',
        'severity': 'medium',
        'confidence_score': 0.5,
        'root_cause': 'Hardware diagnostic required. Inspect power supply, cable connectivity, and internal components.',
        'affected_components': ['Power Input', 'Main Controller'],
        'possible_causes': ['Loose connections', 'Internal power fuse blown', 'Component degradation'],
        'troubleshooting_steps': [
            'Disconnect device from mains power supply before inspecting.',
            'Check if power indicator light turns on.',
            'Inspect power cable and plug for cracks or physical damage.'
        ],
        'repair_steps': [
            'Unplug the device completely.',
            'Open outer housing using safety-compliant tools.',
            'Locate and inspect the main fuse. If blown, replace with fuse of identical rating.',
            'Check internal cables for tight connections.'
        ],
        'tools_required': ['Screwdriver set', 'Multimeter', 'Safety gloves'],
        'safety_warnings': [
            'High voltage alert. Always unplug power before opening casing.',
            'Lithium-ion battery hazard. Do not puncture or apply excessive heat.'
        ],
        'technician_required': True,
        'repair_difficulty': 'Moderate',
        'estimated_cost': '₹300 - ₹1000',
        'estimated_time': '30 - 60 minutes',
        'preventive_maintenance': 'Keep vents clear of dust. Operate in a well-ventilated, dry environment.'
    }


def analyze_device(image=None, category=None, description='', device_name=''):
    """
    Complete AI orchestration pipeline for device image diagnosis.
    1. Preprocess image
    2. Extract specifications via OCR
    3. Retrieve repair knowledge from RAG
    4. Compile prompt
    5. Query AI
    6. Validate and parse response
    """
    category_name = category.name if category else 'Other'
    category_slug = category.slug if category else 'other'

    preprocessed_img = None
    ocr_context = ''

    # 1. Preprocess & 2. OCR
    if image:
        try:
            preprocessed_img = preprocess_image(image)
            ocr_context = extract_text_from_image(preprocessed_img)
        except Exception as e:
            logger.error('Image preprocessing or OCR failed: %s', e)

    # 3. Retrieve Knowledge via RAG
    search_query = f'{device_name} {description}'.strip()
    rag_articles = []
    if search_query:
        rag_articles = retrieve_relevant_knowledge(
            query_text=search_query,
            category_slug=category_slug,
            top_k=2,
        )

    # Format RAG context
    rag_context = ''
    if rag_articles:
        rag_context = '\n\nRelevant Repair Guide Context:\n' + '\n'.join(
            f"--- {art['title']} ---\n{art['content']}" for art in rag_articles
        )

    # Format OCR context
    formatted_ocr = ''
    if ocr_context and ocr_context != 'No text detected.':
        formatted_ocr = f'\n\nExtracted Label/Manual Text via OCR:\n{ocr_context}'

    # 4. Get Prompt Template & Build Final Prompt
    template = get_prompt_template('image_analysis')
    prompt = template.format(
        category=category_name,
        category_slug=category_slug,
        description=description or 'Visual inspection requested.',
    )

    if rag_context:
        prompt += rag_context
    if formatted_ocr:
        prompt += formatted_ocr

    # 5. Query AI
    try:
        provider = get_ai_provider()
        system_instruction = 'You are an expert Electronic Device Repair Assistant.'

        raw_response = ''
        if preprocessed_img:
            # Re-seek image before reading
            preprocessed_img.seek(0)
            raw_response = provider.analyze_image(
                image_file=preprocessed_img,
                prompt=prompt,
                system_instruction=system_instruction,
            )
        else:
            raw_response = provider.analyze_text(
                prompt=prompt,
                system_instruction=system_instruction,
            )

        # 6. Parse and Validate
        result = _parse_and_validate_json(raw_response)
        if result:
            # Ensure critical keys exist
            defaults = _fallback_result(category_slug, description[:50])
            for key, val in defaults.items():
                if key not in result:
                    result[key] = val
            return result

        logger.warning('AI returned invalid JSON structure, falling back.')
        return _fallback_result(category_slug, 'Diagnosis Failed')

    except Exception as e:
        logger.error('Device analysis pipeline failed: %s', e)
        return _fallback_result(category_slug, 'System Error')


def analyze_text_description(description, category=None, appliance_category=''):
    """
    AI diagnostic pipeline for text-only descriptions.
    """
    category_name = category.name if category else (appliance_category or 'Other').replace('_', ' ').title()
    category_slug = category.slug if category else (appliance_category or 'other')

    # RAG search
    rag_articles = retrieve_relevant_knowledge(
        query_text=description,
        category_slug=category_slug,
        top_k=2,
    )

    rag_context = ''
    if rag_articles:
        rag_context = '\n\nRelevant Repair Guide Context:\n' + '\n'.join(
            f"--- {art['title']} ---\n{art['content']}" for art in rag_articles
        )

    template = get_prompt_template('text_analysis')
    prompt = template.format(
        category=category_name,
        category_slug=category_slug,
        description=description,
    )

    if rag_context:
        prompt += rag_context

    try:
        provider = get_ai_provider()
        system_instruction = 'You are an expert Electronic Device Repair Assistant.'

        raw_response = provider.analyze_text(
            prompt=prompt,
            system_instruction=system_instruction,
        )

        result = _parse_and_validate_json(raw_response)
        if result:
            defaults = _fallback_result(category_slug, description[:50])
            for key, val in defaults.items():
                if key not in result:
                    result[key] = val
            return result

        return _fallback_result(category_slug, 'Diagnosis Failed')

    except Exception as e:
        logger.error('Text analysis pipeline failed: %s', e)
        return _fallback_result(category_slug, 'System Error')


def chat_with_ai(messages, context=None, appliance_category=''):
    """
    Translates chat history and context to prompt and obtains AI reply.
    """
    # Format previous context if available
    context_str = 'None'
    if context:
        context_str = json.dumps(context)

    system_instruction = get_prompt_template('chat_system').format(
        context=context_str,
        category=appliance_category or 'General Electronic Devices',
    )

    try:
        provider = get_ai_provider()
        # Build chat history parts compatible with providers
        chat_history = []
        for msg in messages:
            chat_history.append({
                'role': 'user' if msg.get('role') == 'user' else 'model',
                'parts': [msg.get('content', '')]
            })

        return provider.chat_response(
            chat_history=chat_history,
            system_instruction=system_instruction,
        )
    except Exception as e:
        logger.error('Chat view pipeline failed: %s', e)
        return 'I encountered an error trying to process this question. Please try again.'
