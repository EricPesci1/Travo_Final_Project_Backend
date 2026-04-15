"""
Re-exports the shared API routes. Prefer `TravoBackend.api_urls` in root URLconf.
"""

from TravoBackend.api_urls import urlpatterns

__all__ = ["urlpatterns"]
