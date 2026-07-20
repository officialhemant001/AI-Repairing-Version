"""
Development settings — extends base.py for local development.
"""
from .base import *  # noqa: F401,F403

DEBUG = True

# SQLite for fast local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Switch to PostgreSQL locally if configured
if config('USE_POSTGRES', default=False, cast=bool):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='ai_repair_db'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default=''),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }

# Console email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS — allow all in dev
CORS_ALLOW_ALL_ORIGINS = True

# Disable throttling in development
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []  # noqa: F405

# Static files — simple storage in dev
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Cache — local memory in dev
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
