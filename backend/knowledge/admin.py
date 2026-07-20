from django.contrib import admin
from .models import KnowledgeArticle, KnowledgeEmbedding, AIPromptTemplate


@admin.register(KnowledgeArticle)
class KnowledgeArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'device_category', 'is_active', 'source', 'created_at')
    list_filter = ('is_active', 'device_category')
    search_fields = ('title', 'content', 'tags')
    list_editable = ('is_active',)


@admin.register(AIPromptTemplate)
class AIPromptTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'prompt_type', 'is_active', 'version', 'updated_at')
    list_filter = ('prompt_type', 'is_active')
    list_editable = ('is_active',)


@admin.register(KnowledgeEmbedding)
class KnowledgeEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('article', 'chunk_preview', 'created_at')
    search_fields = ('chunk_text',)

    def chunk_preview(self, obj):
        return obj.chunk_text[:80]
    chunk_preview.short_description = 'Chunk'
