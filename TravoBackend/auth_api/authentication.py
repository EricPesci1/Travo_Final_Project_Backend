from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Tuple

from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from .supabase_client import get_supabase


@dataclass(frozen=True)
class SupabasePrincipal:
    """
    Minimal "user-like" object for DRF.
    We keep Django's auth user system out of scope for this project.
    """

    sub: str
    email: str | None = None

    @property
    def is_authenticated(self) -> bool:  # DRF expects this
        return True


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    Accepts: Authorization: Bearer <supabase_access_token>
    Verifies JWT with Supabase JWKS and exposes claims on request.supabase_claims.
    """

    keyword = b"bearer"

    def authenticate(self, request) -> Optional[Tuple[SupabasePrincipal, None]]:
        auth = get_authorization_header(request).split()
        if not auth:
            return None

        if auth[0].lower() != self.keyword:
            return None

        if len(auth) != 2:
            raise AuthenticationFailed("Invalid Authorization header.")

        token = auth[1].decode("utf-8", errors="ignore").strip()
        if not token:
            raise AuthenticationFailed("Empty bearer token.")

        try:
            claims_resp = get_supabase().auth.get_claims(jwt=token)
        except Exception as e:
            raise AuthenticationFailed(f"Invalid Supabase token: {e}") from e

        claims = getattr(claims_resp, "claims", None) or getattr(claims_resp, "data", None) or claims_resp
        if not isinstance(claims, dict):
            raise AuthenticationFailed("Could not read JWT claims.")

        sub = claims.get("sub")
        if not sub:
            raise AuthenticationFailed("JWT missing sub claim.")

        request.supabase_claims = claims
        return (SupabasePrincipal(sub=sub, email=claims.get("email")), None)

