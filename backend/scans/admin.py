from django.contrib import admin
from .models import Scan, ScanImage, ScanDocument, Bookmark, ChatSession, ChatMessage


class ScanImageInline(admin.TabularInline):
    model = ScanImage
    extra = 0


class ScanDocumentInline(admin.TabularInline):
    model = ScanDocument
    extra = 0


@admin.register(Scan)
class ScanAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'report_id', 'user', 'issue', 'severity',
        'confidence_score', 'status', 'is_favorite', 'created_at',
    )
    list_filter = ('severity', 'status', 'input_type', 'is_favorite', 'category')
    search_fields = ('issue', 'device_name', 'description', 'user__email')
    readonly_fields = ('report_id', 'created_at', 'updated_at')
    inlines = [ScanImageInline, ScanDocumentInline]
    ordering = ('-created_at',)


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('user', 'scan', 'created_at')
    list_filter = ('created_at',)


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at', 'updated_at')
    search_fields = ('title', 'user__email')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'role', 'content_preview', 'created_at')
    list_filter = ('role',)

    def content_preview(self, obj):
        return obj.content[:80]
    content_preview.short_description = 'Content'
