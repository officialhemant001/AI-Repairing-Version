"""
Gemini AI Provider implementation.
"""
import logging
import json
from PIL import Image
import google.generativeai as genai
from django.conf import settings

from .base import BaseAIProvider

logger = logging.getLogger(__name__)


class GeminiProvider(BaseAIProvider):
    """
    Integrates with Google's Gemini API for vision, text generation, and embeddings.
    """

    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning('Gemini API Key is missing in settings.')

    def _get_model(self, model_name='gemini-1.5-flash', system_instruction=None):
        config = {}
        if system_instruction:
            config['system_instruction'] = system_instruction
        return genai.GenerativeModel(model_name, **config)

    def analyze_image(self, image_file, prompt, system_instruction=None):
        try:
            img = Image.open(image_file)
            model = self._get_model('gemini-1.5-flash', system_instruction)
            response = model.generate_content([prompt, img])
            return response.text.strip()
        except Exception as e:
            logger.error('Gemini image analysis failed: %s', e)
            raise e

    def analyze_text(self, prompt, system_instruction=None):
        try:
            model = self._get_model('gemini-1.5-flash', system_instruction)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error('Gemini text analysis failed: %s', e)
            raise e

    def chat_response(self, chat_history, system_instruction=None):
        """
        Expects chat_history to be a list of dicts:
        [{'role': 'user'|'model', 'parts': [content]}]
        """
        try:
            model = self._get_model('gemini-1.5-flash', system_instruction)
            # Find history and final prompt
            gemini_history = []
            for msg in chat_history[:-1]:
                gemini_history.append({
                    'role': 'user' if msg['role'] == 'user' else 'model',
                    'parts': msg['parts']
                })
            chat = model.start_chat(history=gemini_history)
            last_msg = chat_history[-1]['parts'][0]
            response = chat.send_message(last_msg)
            return response.text.strip()
        except Exception as e:
            logger.error('Gemini chat failed: %s', e)
            raise e

    def generate_embeddings(self, text):
        try:
            result = genai.embed_content(
                model='models/embedding-001',
                content=text,
                task_type='retrieval_document'
            )
            return result['embedding']
        except Exception as e:
            logger.error('Gemini embedding generation failed: %s', e)
            return []
