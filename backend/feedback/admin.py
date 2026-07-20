from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'scan', 'rating', 'is_helpful', 'created_at')
    list_filter = ('rating', 'is_helpful', 'created_at')
    search_fields = ('user__email', 'comment')
    readonly_fields = ('created_at',)
