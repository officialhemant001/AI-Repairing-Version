from django.contrib import admin
from .models import DeviceCategory


@admin.register(DeviceCategory)
class DeviceCategoryAdmin(admin.ModelAdmin):
    list_display = ('icon', 'name', 'slug', 'is_active', 'display_order')
    list_filter = ('is_active',)
    list_editable = ('is_active', 'display_order')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('display_order',)
