from rest_framework import serializers
from .models import KnowledgeArticle, AIPromptTemplate


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='device_category.name', read_only=True, default='')

    class Meta:
        model = KnowledgeArticle
        fields = [
            'id', 'title', 'device_category', 'category_name',
            'content', 'tags', 'source', 'is_active',
            'created_at', 'updated_at',
        ]


class AIPromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPromptTemplate
        fields = ['id', 'name', 'prompt_type', 'template', 'is_active', 'version', 'updated_at']
