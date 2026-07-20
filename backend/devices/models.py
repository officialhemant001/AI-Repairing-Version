"""
Device category model — replaces hardcoded appliance choices with
a database-driven, admin-manageable category system.
"""
from django.db import models


class DeviceCategory(models.Model):
    """
    Electronic device categories that users can select during analysis.
    Admin-managed for easy addition of new device types.
    """

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(
        max_length=10,
        blank=True,
        default='⚡',
        help_text='Emoji icon for display',
    )
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = 'Device Category'
        verbose_name_plural = 'Device Categories'

    def __str__(self):
        return f'{self.icon} {self.name}'
