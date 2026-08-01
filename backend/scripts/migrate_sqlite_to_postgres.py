"""Migrate the SQLite database to Supabase PostgreSQL and upload media to Supabase Storage.

Requirements before running:
  - DATABASE_URL environment variable points to the Supabase PostgreSQL database
  - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are set

Usage:
    cd backend
    python scripts/migrate_sqlite_to_postgres.py [--sqlite backend/community_donation.db]
"""
import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

import sqlite3

ROOT = Path(__file__).resolve().parent.parent.parent


def _parse_dt(value):
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return value
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _convert_row(row, table):
    data = {}
    for col in table.columns:
        value = row[col.name]
        if value is None:
            data[col.name] = None
            continue
        coltype = col.type.__class__.__name__
        if coltype == "Boolean":
            data[col.name] = bool(value)
        elif coltype in ("DateTime", "Date"):
            data[col.name] = _parse_dt(value)
        else:
            data[col.name] = value
    return data


def _copy_table(src, conn, table):
    sqlite_table = src.execute(f"PRAGMA table_info({table.name})").fetchall()
    if not sqlite_table:
        print(f"  {table.name}: table not present in SQLite -> skipped")
        return 0
    rows = src.execute(f"SELECT * FROM {table.name}").fetchall()
    if not rows:
        print(f"  {table.name}: 0 rows")
        return 0
    data = [_convert_row(r, table) for r in rows]
    conn.execute(table.insert(), data)
    print(f"  {table.name}: copied {len(data)} rows")
    return len(data)


def _migrate_media(pg_engine):
    from sqlalchemy import text as sa_text

    from app.core.config import settings
    from app.services.storage import (
        StorageError,
        content_type_for,
        ensure_buckets,
        storage_configured,
        upload_object,
    )

    if not storage_configured():
        print("\n[media] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set -> skipping media upload.")
        return

    ensure_buckets()
    print(f"\n[media] Uploading to buckets: '{settings.STORAGE_BUCKET_PHOTOS}' + '{settings.STORAGE_BUCKET_VIDEOS}'")

    with pg_engine.connect() as conn:
        items = conn.execute(
            sa_text("SELECT id, type, file_name, file_path FROM gallery_items WHERE file_path IS NOT NULL")
        ).fetchall()

    uploaded_gallery = 0
    skipped_gallery = 0
    for item in items:
        fp = item.file_path
        if not fp.startswith("/uploads/"):
            continue
        local = ROOT / "backend" / fp.lstrip("/")
        if not local.exists():
            print(f"  gallery #{item.id}: MISSING local file -> {local}")
            skipped_gallery += 1
            continue
        bucket = settings.STORAGE_BUCKET_VIDEOS if item.type == "Video" else settings.STORAGE_BUCKET_PHOTOS
        name = item.file_name or local.name
        try:
            url = upload_object(bucket, name, local.read_bytes(), content_type_for(local.suffix))
        except StorageError as exc:
            print(f"  gallery #{item.id}: upload FAILED -> {exc}")
            skipped_gallery += 1
            continue
        with pg_engine.begin() as conn:
            conn.execute(
                sa_text("UPDATE gallery_items SET file_path = :url WHERE id = :id"),
                {"url": url, "id": item.id},
            )
        print(f"  gallery #{item.id}: {name} -> {url}")
        uploaded_gallery += 1

    photos_dir = ROOT / "frontend" / "public" / "uploads" / "photos"
    photo_exts = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    uploaded_photos = 0
    if photos_dir.exists():
        for fp in sorted(photos_dir.iterdir()):
            if fp.suffix.lower() not in photo_exts or not fp.is_file():
                continue
            storage_path = f"profile/{fp.name}"
            try:
                url = upload_object(
                    settings.STORAGE_BUCKET_PHOTOS,
                    storage_path,
                    fp.read_bytes(),
                    content_type_for(fp.suffix),
                )
            except StorageError as exc:
                print(f"  profile photo: {fp.name} upload FAILED -> {exc}")
                continue
            print(f"  profile photo: {fp.name} -> {url}")
            uploaded_photos += 1

    print(f"\n[media] Uploaded {uploaded_gallery} gallery items, skipped {skipped_gallery}.")
    print(f"[media] Uploaded {uploaded_photos} profile photos.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--sqlite",
        default=str(ROOT / "backend" / "community_donation.db"),
        help="Path to the source SQLite database file",
    )
    args = parser.parse_args()

    from app.core.config import settings  # noqa: F401  (loads env)
    from app.database.database import Base
    from app.models import daily_report, donation, expense, gallery_item, message, task, user  # noqa: F401
    from sqlalchemy import create_engine

    db_url = settings.DATABASE_URL
    if not db_url or db_url.startswith("sqlite"):
        print("ERROR: DATABASE_URL must point to a PostgreSQL database. Set it before running.")
        sys.exit(1)
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

    sqlite_path = Path(args.sqlite)
    if not sqlite_path.exists():
        print(f"ERROR: SQLite file not found: {sqlite_path}")
        sys.exit(1)

    print(f"Source SQLite : {sqlite_path}")
    print(f"Target        : PostgreSQL via DATABASE_URL")
    print("Creating tables on PostgreSQL...")
    pg_engine = create_engine(db_url, pool_pre_ping=True)
    Base.metadata.create_all(pg_engine)

    src = sqlite3.connect(sqlite_path)
    src.row_factory = sqlite3.Row
    try:
        print("Copying data...")
        with pg_engine.begin() as conn:
            for table in Base.metadata.sorted_tables:
                _copy_table(src, conn, table)
    finally:
        src.close()

    print("\nVerifying row counts...")
    with pg_engine.connect() as conn:
        from sqlalchemy import text as sa_text

        ok = True
        for table in Base.metadata.sorted_tables:
            src_count = sqlite3.connect(sqlite_path).execute(f"SELECT COUNT(*) FROM {table.name}").fetchone()[0]
            pg_count = conn.execute(sa_text(f"SELECT COUNT(*) FROM {table.name}")).scalar()
            status = "OK" if src_count == pg_count else "MISMATCH"
            if status != "OK":
                ok = False
            print(f"  {table.name}: sqlite={src_count} postgres={pg_count} {status}")
    if not ok:
        print("\nERROR: Row counts differ between SQLite and PostgreSQL.")
        sys.exit(1)

    _migrate_media(pg_engine)

    print("\nMigration complete.")


if __name__ == "__main__":
    main()
