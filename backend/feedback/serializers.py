from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    scan_issue = serializers.CharField(source='scan.issue', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'scan', 'rating', 'comment', 'is_helpful', 'user_email', 'scan_issue', 'created_at']
        read_only_fields = ['id', 'user_email', 'scan_issue', 'created_at']


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['scan', 'rating', 'comment', 'is_helpful']
