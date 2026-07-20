"""
OpenAI Provider implementation.
"""
import logging
import base64
from openai import OpenAI
from django.conf import settings

from .base import BaseAIProvider

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseAIProvider):
    """
    Integrates with OpenAI's API (GPT-4o, GPT-4o-mini) for text, vision, and embeddings.
    """

    def __init__(self):
        self.api_key = getattr(settings, 'OPENAI_API_KEY', '')
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            self.client = None
            logger.warning('OpenAI API Key is missing in settings.')

    def _encode_image(self, image_file):
        """Encode the uploaded file to a base64 string."""
        try:
            image_file.seek(0)
            return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error('Failed to encode image for OpenAI: %s', e)
            raise e

    def analyze_image(self, image_file, prompt, system_instruction=None):
        if not self.client:
            raise ValueError('OpenAI Client is not initialized.')

        try:
            base64_image = self._encode_image(image_file)
            messages = []
            if system_instruction:
                messages.append({'role': 'system', 'content': system_instruction})

            messages.append({
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': prompt},
                    {
                        'type': 'image_url',
                        'image_url': {
                            'url': f'data:image/jpeg;base64,{base64_image}',
                        },
                    },
                ],
            })

            response = self.client.chat.completions.create(
                model='gpt-4o-mini',
                messages=messages,
                max_tokens=1000,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error('OpenAI image analysis failed: %s', e)
            raise e

    def analyze_text(self, prompt, system_instruction=None):
        if not self.client:
            raise ValueError('OpenAI Client is not initialized.')

        try:
            messages = []
            if system_instruction:
                messages.append({'role': 'system', 'content': system_instruction})

            messages.append({'role': 'user', 'content': prompt})

            response = self.client.chat.completions.create(
                model='gpt-4o-mini',
                messages=messages,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error('OpenAI text analysis failed: %s', e)
            raise e

    def chat_response(self, chat_history, system_instruction=None):
        if not self.client:
            raise ValueError('OpenAI Client is not initialized.')

        try:
            messages = []
            if system_instruction:
                messages.append({'role': 'system', 'content': system_instruction})

            for msg in chat_history:
                # Map roles correctly to 'user' or 'assistant'
                role = 'assistant' if msg['role'] == 'model' else msg['role']
                messages.append({'role': role, 'content': msg['parts'][0]})

            response = self.client.chat.completions.create(
                model='gpt-4o-mini',
                messages=messages,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error('OpenAI chat failed: %s', e)
            raise e

    def generate_embeddings(self, text):
        if not self.client:
            return []

        try:
            response = self.client.embeddings.create(
                input=[text],
                model='text-embedding-3-small',
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error('OpenAI embedding generation failed: %s', e)
            return []
