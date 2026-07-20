"""
Extended User model with profile fields and password reset support.
"""
import uuid
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from core.utils import user_avatar_upload_path


class User(AbstractUser):
    """Custom user model with email-based authentication and profile fields."""

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    avatar = models.ImageField(upload_to=user_avatar_upload_path, null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True, default='')

    # Use email as the login identifier instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        name = f'{self.first_name} {self.last_name}'.strip()
        return name if name else self.username


class PasswordResetToken(models.Model):
    """Stores password reset tokens with expiry."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Reset token for {self.user.email}'

    @property
    def is_expired(self):
        from django.conf import settings
        expiry_hours = getattr(settings, 'PASSWORD_RESET_TOKEN_EXPIRY', 24)
        return timezone.now() > self.created_at + timedelta(hours=expiry_hours)

    @property
    def is_valid(self):
        return not self.used and not self.is_expired