"""
User views for authentication, profile, and password management.
"""
import logging

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

from .models import User, PasswordResetToken
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    EmailTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint. Accepts name, email, password."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'success': True,
                'message': 'Registration successful.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.full_name,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that accepts email + password instead of username."""

    serializer_class = EmailTokenObtainPairSerializer


class ProfileView(APIView):
    """Get or update the authenticated user's profile."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response({'success': True, 'data': serializer.data})

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'data': serializer.data})


class ChangePasswordView(APIView):
    """Change password for authenticated users."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        return Response({
            'success': True,
            'message': 'Password changed successfully.',
        })


class ForgotPasswordView(APIView):
    """
    Request a password reset. Sends a reset link via email.
    Always returns success to prevent email enumeration.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)

            # Invalidate any existing tokens
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

            # Create new token
            reset_token = PasswordResetToken.objects.create(user=user)

            # Build reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"

            # Send email
            try:
                send_mail(
                    subject=f'{settings.APP_NAME} — Password Reset',
                    message=f'Click the link to reset your password: {reset_url}\n\n'
                            f'This link expires in {settings.PASSWORD_RESET_TOKEN_EXPIRY} hours.\n\n'
                            f'If you did not request this, please ignore this email.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=True,
                )
                logger.info('Password reset email sent to %s', email)
            except Exception as e:
                logger.error('Failed to send password reset email: %s', e)

        except User.DoesNotExist:
            # Don't reveal whether the email exists
            logger.info('Password reset requested for non-existent email: %s', email)

        return Response({
            'success': True,
            'message': 'If an account with that email exists, a password reset link has been sent.',
        })


class ResetPasswordView(APIView):
    """Reset password using a valid reset token."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_uuid = serializer.validated_data['token']

        try:
            reset_token = PasswordResetToken.objects.get(token=token_uuid)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {'success': False, 'error': {'code': 'INVALID_TOKEN', 'message': 'Invalid or expired reset token.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reset_token.is_valid:
            return Response(
                {'success': False, 'error': {'code': 'EXPIRED_TOKEN', 'message': 'This reset token has expired.'}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reset the password
        user = reset_token.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Mark token as used
        reset_token.used = True
        reset_token.save()

        logger.info('Password reset successful for user %s', user.email)

        return Response({
            'success': True,
            'message': 'Password has been reset successfully. You can now log in.',
        })


class DeleteAccountView(APIView):
    """Permanently delete the authenticated user's account."""

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        email = user.email
        user.delete()
        logger.info('Account deleted: %s', email)
        return Response({
            'success': True,
            'message': 'Your account has been permanently deleted.',
        })