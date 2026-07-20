"""
RAG Retriever.
Finds the most relevant knowledge articles based on query vector similarity.
"""
import logging
import numpy as np
from knowledge.models import KnowledgeEmbedding
from .embeddings import generate_embedding

logger = logging.getLogger(__name__)


def retrieve_relevant_knowledge(query_text, category_slug=None, top_k=3):
    """
    Retrieves the most semantically relevant knowledge chunks for a query.
    Performs cosine similarity search using numpy.
    Optional category filtering.
    """
    query_vector = generate_embedding(query_text)
    if not query_vector:
        logger.warning('Could not generate query vector for RAG.')
        return []

    # Query all embeddings
    embeddings_qs = KnowledgeEmbedding.objects.select_related('article')

    if category_slug:
        embeddings_qs = embeddings_qs.filter(
            article__device_category__slug=category_slug
        )

    embeddings_list = list(embeddings_qs)
    if not embeddings_list:
        return []

    # Calculate cosine similarity
    query_arr = np.array(query_vector)
    query_norm = np.linalg.norm(query_arr)

    if query_norm == 0:
        return []

    scored_chunks = []
    for item in embeddings_list:
        if not item.embedding:
            continue
        try:
            item_arr = np.array(item.embedding)
            item_norm = np.linalg.norm(item_arr)
            if item_norm == 0:
                continue

            similarity = np.dot(query_arr, item_arr) / (query_norm * item_norm)
            scored_chunks.append((similarity, item))
        except Exception as e:
            logger.error('Error calculating similarity: %s', e)

    # Sort by similarity descending
    scored_chunks.sort(key=lambda x: x[0], reverse=True)

    # Select top k
    top_results = scored_chunks[:top_k]

    retrieved = []
    for score, item in top_results:
        # Only include if similarity score is reasonable (e.g. > 0.4)
        if score > 0.4:
            retrieved.append({
                'title': item.article.title,
                'content': item.chunk_text,
                'source': item.article.source,
                'score': float(score),
            })

    logger.info('RAG retrieved %d matching articles.', len(retrieved))
    return retrieved
