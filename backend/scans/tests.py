from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User
from scans.models import Scan
from devices.models import DeviceCategory


class ScanManagementTests(APITestCase):
    """
    Unit and integration API tests for scan uploads, retrieval, favorites,
    and history filtering.
    """

    def setUp(self):
        # Create user
        self.user = User.objects.create_user(
            username='tech_tester',
            email='tester@example.com',
            password='secure_tester_password_123',
        )

        # Create category
        self.category = DeviceCategory.objects.create(
            name='Smartphone',
            slug='mobile',
            icon='📱',
            is_active=True,
        )

        # Create sample scan
        self.scan = Scan.objects.create(
            user=self.user,
            category=self.category,
            device_name='iPhone 13',
            input_type='text',
            description='Screen is completely black after water drop',
            issue='Water Damage & Black Screen',
            severity='high',
            confidence_score=0.92,
            repair_difficulty='difficult',
        )

        self.history_url = reverse('scan-history')
        self.detail_url = reverse('scan-detail', kwargs={'pk': self.scan.id})
        self.favorite_url = reverse('scan-favorite', kwargs={'pk': self.scan.id})

    def test_scan_history_unauthenticated_blocked(self):
        """Test unauthenticated users cannot access history list."""
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_scan_history_authenticated_retrieved(self):
        """Test authenticated user can retrieve their scan history."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.history_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be paginated
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['device_name'], 'iPhone 13')

    def test_scan_detail_retrieval(self):
        """Test retrieving specific scan analysis details."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['device_name'], 'iPhone 13')
        self.assertEqual(response.data['severity'], 'high')

    def test_toggle_scan_favorite(self):
        """Test toggling is_favorite status of a scan."""
        self.client.force_authenticate(user=self.user)
        # Initial status is False
        self.assertFalse(self.scan.is_favorite)

        # Toggle to True
        response = self.client.post(self.favorite_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['data']['is_favorite'])

        # Toggle back to False
        response = self.client.post(self.favorite_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['data']['is_favorite'])
