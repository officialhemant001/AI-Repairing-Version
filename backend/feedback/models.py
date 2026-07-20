"""
Feedback model — stores user ratings and comments on AI analysis quality.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Feedback(models.Model):
    """User feedback on a specific scan analysis."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedback_given',
    )
    scan = models.ForeignKey(
        'scans.Scan',
        on_delete=models.CASCADE,
        related_name='feedback',
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 (poor) to 5 (excellent)',
    )
    comment = models.TextField(blank=True, default='')
    is_helpful = models.BooleanField(
        null=True, blank=True,
        help_text='Was the AI analysis helpful?',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'scan')

    def __str__(self):
        return f'{self.user.email} → Scan #{self.scan_id} ({self.rating}★)'
