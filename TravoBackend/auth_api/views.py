from __future__ import annotations

from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from social.models import DimUser

from .authentication import SupabaseJWTAuthentication
from .supabase_client import get_supabase


def _default_username_from_email(email: str) -> str:
    email = (email or "").strip().lower()
    if not email or "@" not in email:
        return ""
    return email.split("@", 1)[0][:50]


def _session_to_tokens(session_obj):
    """
    Best-effort extraction across supabase-py versions.
    """
    if not session_obj:
        return ("", "")
    access = getattr(session_obj, "access_token", None) or getattr(session_obj, "accessToken", None)
    refresh = getattr(session_obj, "refresh_token", None) or getattr(session_obj, "refreshToken", None)
    if isinstance(session_obj, dict):
        access = access or session_obj.get("access_token") or session_obj.get("accessToken")
        refresh = refresh or session_obj.get("refresh_token") or session_obj.get("refreshToken")
    return (access or "", refresh or "")


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    """
    Frontend sends the Supabase access token after OAuth completes.

    Body:
      { "access_token": "<supabase jwt>" }
    """
    access_token = (request.data.get("access_token") or "").strip()
    if not access_token:
        return Response({"detail": "access_token is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        claims_resp = get_supabase().auth.get_claims(jwt=access_token)
    except Exception as e:
        return Response({"detail": f"Invalid Supabase token: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    claims = getattr(claims_resp, "claims", None) or getattr(claims_resp, "data", None) or claims_resp
    if not isinstance(claims, dict):
        return Response({"detail": "Could not read JWT claims."}, status=status.HTTP_401_UNAUTHORIZED)

    email = (claims.get("email") or "").strip()
    sub = (claims.get("sub") or "").strip()
    if not sub:
        return Response({"detail": "JWT missing sub claim."}, status=status.HTTP_401_UNAUTHORIZED)

    username = _default_username_from_email(email) or f"user_{sub[:12]}"
    user, _ = DimUser.objects.get_or_create(
        username=username,
        defaults={
            "first_name": (claims.get("user_metadata") or {}).get("full_name", "").split(" ")[0][:50] or "User",
            "last_name": "User",
            "email": email or f"{username}@example.com",
        },
    )
    # Keep email up to date if we have a real one.
    if email and user.email != email:
        user.email = email
        user.save(update_fields=["email"])

    return Response(
        {
            "access_token": access_token,
            "supabase": {"sub": sub, "email": email, "claims": claims},
            "user": {
                "user_key": user.user_key,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def password_login(request):
    """
    Backend-driven email/password sign-in with Supabase.

    Body:
      { "email": "...", "password": "..." }
    """
    email = (request.data.get("email") or "").strip()
    password = request.data.get("password") or ""
    if not email or not password:
        return Response(
            {"detail": "email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    supabase = get_supabase()
    try:
        resp = supabase.auth.sign_in_with_password({"email": email, "password": password})
    except Exception as e:
        return Response({"detail": f"Login failed: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

    session = getattr(resp, "session", None) or getattr(resp, "data", None) or None
    access_token, refresh_token = _session_to_tokens(session)

    # Some versions keep session on the client; fall back to get_session().
    if not access_token:
        try:
            s = supabase.auth.get_session()
            access_token, refresh_token = _session_to_tokens(s)
        except Exception:
            pass

    if not access_token:
        return Response(
            {"detail": "Login succeeded but no access token was returned."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    # Reuse the existing token-based login path to verify claims + sync DimUser.
    request.data["access_token"] = access_token
    result = login(request)
    if hasattr(result, "data") and isinstance(result.data, dict):
        result.data["refresh_token"] = refresh_token
    return result


@api_view(["GET"])
@authentication_classes([SupabaseJWTAuthentication])
@permission_classes([AllowAny])
def me(request):
    claims = getattr(request, "supabase_claims", None) or {}
    return Response({"supabase": claims}, status=status.HTTP_200_OK)

