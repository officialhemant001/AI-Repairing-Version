"""
Abstract base class for AI providers.
"""
from abc import ABC, abstractmethod


class BaseAIProvider(ABC):
    """
    Interface that all AI providers (Gemini, OpenAI) must implement.
    """

    @abstractmethod
    def analyze_image(self, image_file, prompt, system_instruction=None):
        """Analyze an image with a prompt and optional system instructions."""
        pass

    @abstractmethod
    def analyze_text(self, prompt, system_instruction=None):
        """Analyze text with a prompt and optional system instructions."""
        pass

    @abstractmethod
    def chat_response(self, chat_history, system_instruction=None):
        """Generate a response for a multi-turn chat history."""
        pass

    @abstractmethod
    def generate_embeddings(self, text):
        """Generate vector embeddings for a given text."""
        pass
