from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User


class UserAuthenticationTests(APITestCase):
    """
    Unit and integration tests for User Registration, Login, Profile updates,
    and password management.
    """

    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.profile_url = reverse('auth-profile')
        self.change_password_url = reverse('auth-change-password')

        self.user_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'test_secure_password_123',
        }

    def test_user_registration_successful(self):
        """Test user can register with valid details."""
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['email'], self.user_data['email'])
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())

    def test_user_registration_missing_fields(self):
        """Test registration fails when fields are missing."""
        incomplete_data = {'name': 'Incomplete', 'email': 'incomplete@example.com'}
        response = self.client.post(self.register_url, incomplete_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        self.assertIn('password', response.data['error']['details'])

    def test_user_login_successful(self):
        """Test user can log in with valid credentials and receive JWT."""
        # First register user
        self.client.post(self.register_url, self.user_data)

        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password'],
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_profile_retrieval_and_update(self):
        """Test profile retrieval and partial updates with authentication."""
        # Register and log in
        self.client.post(self.register_url, self.user_data)
        login_data = {
            'email': self.user_data['email'],
            'password': self.user_data['password'],
        }
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data['access']

        # Authorize client
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # Get Profile
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['data']['email'], self.user_data['email'])

        # Update Profile
        update_data = {
            'first_name': 'UpdatedName',
            'phone': '+919999999999',
            'bio': 'Self-taught electrical technician.',
        }
        patch_response = self.client.patch(self.profile_url, update_data)
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_response.data['data']['first_name'], 'UpdatedName')
        self.assertEqual(patch_response.data['data']['phone'], '+919999999999')
        self.assertEqual(patch_response.data['data']['bio'], 'Self-taught electrical technician.')
