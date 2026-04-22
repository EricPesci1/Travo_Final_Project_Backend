import os

from supabase import Client, create_client
from supabase.lib.client_options import ClientOptions


def get_supabase() -> Client:
    url = (os.environ.get("SUPABASE_URL") or "").strip()
    key = (os.environ.get("SUPABASE_ANON_KEY") or "").strip()
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.")

    # For backend JWT verification, we don't need to persist sessions locally.
    # We use get_claims(jwt=...) which verifies against Supabase JWKS.
    return create_client(url, key, options=ClientOptions(auth={"flow_type": "pkce"}))

