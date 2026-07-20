"""
Knowledge Base models — stores repair knowledge articles and
their vector embeddings for RAG retrieval.
"""
from django.db import models


class KnowledgeArticle(models.Model):
    """
    A repair knowledge article that can be retrieved during AI analysis.
    Used for RAG (Retrieval-Augmented Generation) to enhance AI responses.
    """

    title = models.CharField(max_length=300)
    device_category = models.ForeignKey(
        'devices.DeviceCategory',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='knowledge_articles',
    )
    content = models.TextField(help_text='Detailed repair knowledge, troubleshooting steps, etc.')
    tags = models.CharField(
        max_length=500, blank=True, default='',
        help_text='Comma-separated tags for search',
    )
    source = models.CharField(
        max_length=200, blank=True, default='',
        help_text='Source of the knowledge (e.g., manufacturer docs, expert input)',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']
        verbose_name = 'Knowledge Article'
        verbose_name_plural = 'Knowledge Articles'

    def __str__(self):
        return self.title


class KnowledgeEmbedding(models.Model):
    """
    Stores vector embeddings for knowledge article chunks.
    Used for semantic similarity search in the RAG pipeline.
    """

    article = models.ForeignKey(
        KnowledgeArticle, on_delete=models.CASCADE, related_name='embeddings'
    )
    chunk_text = models.TextField(help_text='The text chunk that was embedded')
    embedding = models.JSONField(
        default=list,
        help_text='Vector embedding as a list of floats',
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Embedding for: {self.article.title[:50]}'


class AIPromptTemplate(models.Model):
    """
    Admin-editable AI prompt templates.
    Allows customizing prompts without code changes.
    """

    PROMPT_TYPE_CHOICES = [
        ('image_analysis', 'Image Analysis'),
        ('text_analysis', 'Text Analysis'),
        ('chat_system', 'Chat System Prompt'),
        ('report_summary', 'Report Summary'),
    ]

    name = models.CharField(max_length=100)
    prompt_type = models.CharField(max_length=20, choices=PROMPT_TYPE_CHOICES, unique=True)
    template = models.TextField(help_text='Prompt template with {variable} placeholders')
    is_active = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['prompt_type']

    def __str__(self):
        return f'{self.name} (v{self.version})'
