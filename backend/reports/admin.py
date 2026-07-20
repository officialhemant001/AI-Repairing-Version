from django.contrib import admin
from .models import Report, ReportVersion


class ReportVersionInline(admin.TabularInline):
    model = ReportVersion
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_uuid', 'user', 'scan', 'version', 'is_public', 'generated_at')
    list_filter = ('is_public', 'generated_at')
    search_fields = ('report_uuid', 'user__email')
    readonly_fields = ('report_uuid', 'share_token', 'generated_at')
    inlines = [ReportVersionInline]
