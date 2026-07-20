"""
Settings package initializer.

Loads environment-specific settings based on DJANGO_ENV:
  - 'production' → production.py
  - everything else → development.py (default)
"""
import os

env = os.environ.get('DJANGO_ENV', 'development')

if env == 'production':
    from .production import *  # noqa: F401,F403
else:
    from .development import *  # noqa: F401,F403
