"""
WSGI config for project_config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# ZMIANA: 'backend.settings' -> 'project_config.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project_config.settings')

application = get_wsgi_application()