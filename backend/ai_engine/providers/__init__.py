"""
AI Engine providers module.
"""
from django.conf import settings
from .gemini import GeminiProvider
from .openai_provider import OpenAIProvider


def get_ai_provider():
    """
    Returns the configured AI provider based on settings.AI_PROVIDER.
    Defaults to Gemini if not set or invalid.
    """
    provider_name = getattr(settings, 'AI_PROVIDER', 'gemini').lower()

    if provider_name == 'openai':
        return OpenAIProvider()

    return GeminiProvider()
