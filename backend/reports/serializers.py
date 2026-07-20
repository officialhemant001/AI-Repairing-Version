from rest_framework import serializers
from .models import Report, ReportVersion


class ReportListSerializer(serializers.ModelSerializer):
    scan_issue = serializers.CharField(source='scan.issue', read_only=True)
    scan_device = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'report_uuid', 'scan_issue', 'scan_device',
            'version', 'is_public', 'generated_at',
        ]

    def get_scan_device(self, obj):
        if obj.scan.category:
            return obj.scan.category.name
        return obj.scan.appliance_category.replace('_', ' ').title()


class ReportDetailSerializer(serializers.ModelSerializer):
    scan_issue = serializers.CharField(source='scan.issue', read_only=True)
    scan_id = serializers.IntegerField(source='scan.id', read_only=True)
    versions = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'report_uuid', 'scan_id', 'scan_issue',
            'pdf_file', 'qr_code_image', 'version', 'report_data',
            'is_public', 'share_token', 'generated_at', 'versions',
        ]

    def get_versions(self, obj):
        return ReportVersionSerializer(
            obj.versions.all(), many=True
        ).data


class ReportVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportVersion
        fields = ['id', 'version_number', 'pdf_file', 'changes', 'created_at']
