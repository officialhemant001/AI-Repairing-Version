"""
User serializers for registration, profile, and password management.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Registration serializer that accepts name, email, password."""

    name = serializers.CharField(max_length=150, write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['name', 'email', 'password']

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        name_parts = name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # Use email prefix as username (must be unique)
        email = validated_data['email']
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base_username}{counter}'
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile read/update operations."""

    name = serializers.SerializerMethodField()
    scans_count = serializers.SerializerMethodField()
    reports_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'first_name', 'last_name',
            'phone', 'bio', 'avatar', 'date_joined',
            'scans_count', 'reports_count',
        ]
        read_only_fields = ['id', 'email', 'date_joined']

    def get_name(self, obj):
        return obj.full_name

    def get_scans_count(self, obj):
        return obj.scan_set.count()

    def get_reports_count(self, obj):
        return obj.report_set.count() if hasattr(obj, 'report_set') else 0

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.bio = validated_data.get('bio', instance.bio)
        if 'avatar' in validated_data:
            instance.avatar = validated_data['avatar']
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password while authenticated."""

    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for requesting a password reset email."""

    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password with a token."""

    token = serializers.UUIDField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that uses email as the login field."""

    username_field = 'email'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['name'] = user.full_name
        token['is_staff'] = user.is_staff
        return token