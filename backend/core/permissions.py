"""
Custom permission classes for DRF views.
"""
from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Allow access only to admin/staff users."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission: allow access to the object's owner or admin users.
    Requires the object to have a 'user' attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user


class IsOwner(BasePermission):
    """Object-level permission: allow access only to the object's owner."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
