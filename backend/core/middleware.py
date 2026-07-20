"""
Custom middleware for request logging, timing, and API monitoring.
"""
import logging
import time

logger = logging.getLogger('core.middleware')


class RequestLoggingMiddleware:
    """
    Logs incoming API requests with method, path, user, and status code.
    Useful for debugging and audit trails.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Only log API requests, skip static/media/admin
        if request.path.startswith('/api/'):
            user = getattr(request, 'user', None)
            user_str = user.email if user and user.is_authenticated else 'anonymous'

            logger.info(
                '%s %s [%s] → %d',
                request.method,
                request.path,
                user_str,
                response.status_code,
            )

        return response


class RequestTimingMiddleware:
    """
    Adds X-Request-Time header to every response showing processing time in ms.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start) * 1000

        response['X-Request-Time'] = f'{duration_ms:.2f}ms'

        # Log slow requests (> 5 seconds)
        if duration_ms > 5000:
            logger.warning(
                'Slow request: %s %s took %.2fms',
                request.method,
                request.path,
                duration_ms,
            )

        return response
