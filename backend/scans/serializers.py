from rest_framework import serializers
from .models import Scan, ChatMessage


class ScanCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new scan (image upload)."""

    class Meta:
        model = Scan
        fields = ['image', 'description', 'input_type', 'appliance_category']
        extra_kwargs = {
            'image': {'required': False},
            'description': {'required': False},
            'appliance_category': {'required': False},
        }

    def validate_image(self, value):
        if value:
            # Max 10MB
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError('Image must be smaller than 10MB.')
            # Allowed types
            allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    f'Unsupported image type. Allowed: {", ".join(allowed_types)}'
                )
        return value


class ScanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for scan history lists."""

    class Meta:
        model = Scan
        fields = [
            'id', 'appliance_category', 'issue', 'severity',
            'confidence_score', 'status', 'input_type',
            'created_at',
        ]


class ScanDetailSerializer(serializers.ModelSerializer):
    """Full serializer for individual scan detail view."""

    class Meta:
        model = Scan
        fields = [
            'id', 'appliance_category', 'issue', 'severity',
            'confidence_score', 'status', 'input_type',
            'description', 'result',
            'repair_difficulty', 'estimated_cost', 'estimated_time',
            'technician_required', 'safety_warning',
            'image', 'created_at', 'updated_at',
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages."""

    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']
