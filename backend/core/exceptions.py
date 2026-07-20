"""
Custom DRF exception handler for structured, consistent error responses.
"""
import logging

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ValidationError as DjangoValidationError

logger = logging.getLogger('core.exceptions')


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler to return a consistent JSON structure:

    {
        "success": false,
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Human-readable summary",
            "details": { ... }  // optional field-level errors
        }
    }
    """
    # Let DRF handle it first
    response = exception_handler(exc, context)

    if response is not None:
        error_data = _format_error(exc, response)
        response.data = error_data
        return response

    # Handle exceptions DRF doesn't catch
    if isinstance(exc, DjangoValidationError):
        return Response(
            {
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Validation failed.',
                    'details': exc.message_dict if hasattr(exc, 'message_dict') else str(exc),
                },
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Log unexpected errors
    logger.exception('Unhandled exception in %s', context.get('view', 'unknown'))

    return Response(
        {
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An unexpected error occurred. Please try again later.',
            },
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _format_error(exc, response):
    """Format a DRF-handled exception into our standard structure."""
    error_code = _get_error_code(response.status_code)

    # Try to extract a single message
    if isinstance(response.data, dict):
        # DRF validation errors are often {field: [errors]}
        if 'detail' in response.data:
            message = str(response.data['detail'])
            details = None
        else:
            # Field-level validation errors
            message = 'Validation failed. Please check the submitted data.'
            details = response.data
    elif isinstance(response.data, list):
        message = ' '.join(str(item) for item in response.data)
        details = None
    else:
        message = str(response.data)
        details = None

    result = {
        'success': False,
        'error': {
            'code': error_code,
            'message': message,
        },
    }

    if details:
        result['error']['details'] = details

    return result


def _get_error_code(status_code):
    """Map HTTP status codes to human-readable error codes."""
    return {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        409: 'CONFLICT',
        429: 'RATE_LIMITED',
        500: 'INTERNAL_ERROR',
    }.get(status_code, f'HTTP_{status_code}')
