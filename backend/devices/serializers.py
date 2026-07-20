from rest_framework import serializers
from .models import DeviceCategory


class DeviceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceCategory
        fields = ['id', 'name', 'slug', 'icon', 'description', 'display_order']
