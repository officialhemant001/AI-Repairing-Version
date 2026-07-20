"""
Scan serializers for CRUD operations with enhanced filtering support.
"""
from rest_framework import serializers
from .models import Scan, ScanImage, ScanDocument, Bookmark, ChatSession, ChatMessage


class ScanImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanImage
        fields = ['id', 'image', 'image_type', 'caption', 'display_order']


class ScanDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanDocument
        fields = ['id', 'file', 'doc_type', 'original_filename', 'created_at']


class ScanCreateSerializer(serializers.Serializer):
    """Serializer for creating a new scan (image/text/pdf upload)."""

    image = serializers.ImageField(required=False)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    input_type = serializers.ChoiceField(
        choices=Scan.INPUT_TYPE_CHOICES, default='image'
    )
    category_slug = serializers.CharField(required=False, allow_blank=True, default='')
    device_name = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_image(self, value):
        if value:
            # Max 20MB
            if value.size > 20 * 1024 * 1024:
                raise serializers.ValidationError('Image must be smaller than 20MB.')
            allowed_types = [
                'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'
            ]
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    f'Unsupported image type. Allowed: {", ".join(allowed_types)}'
                )
        return value


class ScanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for scan history lists."""

    category_name = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Scan
        fields = [
            'id', 'report_id', 'device_name', 'issue', 'severity',
            'confidence_score', 'status', 'input_type', 'is_favorite',
            'category_name', 'category_icon', 'is_bookmarked',
            'repair_difficulty', 'created_at',
        ]

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return obj.appliance_category.replace('_', ' ').title()

    def get_category_icon(self, obj):
        if obj.category:
            return obj.category.icon
        return '⚡'

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarks.filter(user=request.user).exists()
        return False


class ScanDetailSerializer(serializers.ModelSerializer):
    """Full serializer for individual scan detail view."""

    category_name = serializers.SerializerMethodField()
    category_icon = serializers.SerializerMethodField()
    images = ScanImageSerializer(many=True, read_only=True)
    documents = ScanDocumentSerializer(many=True, read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Scan
        fields = [
            'id', 'report_id', 'device_name', 'issue', 'severity',
            'confidence_score', 'status', 'input_type', 'description',
            'result', 'root_cause', 'affected_components', 'possible_causes',
            'troubleshooting_steps', 'repair_steps', 'tools_required',
            'safety_warnings', 'preventive_maintenance',
            'repair_difficulty', 'estimated_cost', 'estimated_time',
            'technician_required', 'is_favorite', 'is_bookmarked',
            'category_name', 'category_icon',
            'image', 'images', 'documents',
            'appliance_category', 'created_at', 'updated_at',
        ]

    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return obj.appliance_category.replace('_', ' ').title()

    def get_category_icon(self, obj):
        if obj.category:
            return obj.category.icon
        return '⚡'

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.bookmarks.filter(user=request.user).exists()
        return False


class BookmarkSerializer(serializers.ModelSerializer):
    scan = ScanListSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'scan', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""

    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for chat sessions with message count."""

    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'message_count', 'last_message', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {
                'role': last.role,
                'content': last.content[:100],
                'created_at': last.created_at,
            }
        return None


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """Chat session with all messages."""

    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = ['id', 'title', 'scan', 'messages', 'created_at', 'updated_at']
