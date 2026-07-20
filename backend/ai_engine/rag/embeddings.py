"""
RAG Embeddings utility.
Generates embeddings for knowledge base chunks.
"""
import logging
from ai_engine.providers import get_ai_provider

logger = logging.getLogger(__name__)


def generate_embedding(text):
    """
    Generate vector embedding list of floats for a given text
    using the configured AI provider.
    """
    try:
        provider = get_ai_provider()
        return provider.generate_embeddings(text)
    except Exception as e:
        logger.error('Failed to generate embedding: %s', e)
        return []
