import mimetypes

import httpx

from app.core.config import settings


class StorageError(Exception):
    pass


def storage_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY)


def _auth_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
    }


def _base_url() -> str:
    return settings.SUPABASE_URL.rstrip("/")


def _object_api(bucket: str, path: str) -> str:
    return f"{_base_url()}/storage/v1/object/{bucket}/{path}"


def public_url(bucket: str, path: str) -> str:
    return f"{_base_url()}/storage/v1/object/public/{bucket}/{path}"


def path_from_url(url: str, bucket: str) -> str | None:
    prefix = f"{_base_url()}/storage/v1/object/public/{bucket}/"
    if url.startswith(prefix):
        return url[len(prefix):]
    return None


def content_type_for(ext: str) -> str:
    return mimetypes.guess_type(f"x{ext}")[0] or "application/octet-stream"


def ensure_buckets() -> list[str]:
    if not storage_configured():
        return []
    created = []
    for bucket in (settings.STORAGE_BUCKET_PHOTOS, settings.STORAGE_BUCKET_VIDEOS):
        resp = httpx.post(
            f"{_base_url()}/storage/v1/bucket",
            headers=_auth_headers(),
            json={"id": bucket, "name": bucket, "public": True},
            timeout=60.0,
        )
        if resp.status_code in (200, 201):
            created.append(bucket)
        elif resp.status_code not in (400, 409):
            raise StorageError(
                f"Failed to create bucket '{bucket}' ({resp.status_code}): {resp.text}"
            )
    return created


def upload_object(bucket: str, path: str, content: bytes, content_type: str | None = None) -> str:
    if not storage_configured():
        raise StorageError("Supabase Storage is not configured")
    headers = _auth_headers()
    headers["x-upsert"] = "true"
    if content_type:
        headers["Content-Type"] = content_type
    resp = httpx.post(
        _object_api(bucket, path),
        headers=headers,
        content=content,
        timeout=120.0,
    )
    if resp.status_code not in (200, 201, 202):
        raise StorageError(f"Upload to storage failed ({resp.status_code}): {resp.text}")
    return public_url(bucket, path)


def delete_object(bucket: str, path: str) -> None:
    if not storage_configured():
        return
    resp = httpx.delete(_object_api(bucket, path), headers=_auth_headers(), timeout=60.0)
    if resp.status_code not in (200, 202, 404):
        raise StorageError(f"Storage delete failed ({resp.status_code}): {resp.text}")


def list_objects(bucket: str) -> list[dict]:
    if not storage_configured():
        return []
    resp = httpx.post(
        f"{_base_url()}/storage/v1/object/list/{bucket}",
        headers=_auth_headers(),
        json={"prefix": "", "limit": 1000, "offset": 0},
        timeout=60.0,
    )
    if resp.status_code != 200:
        raise StorageError(f"Storage list failed ({resp.status_code}): {resp.text}")
    return resp.json()
