import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError

from config import settings


class StorageService:
    def __init__(self) -> None:
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def upload(self, file_bytes: bytes, filename: str, content_type: str) -> tuple[str, str]:
        ext = Path(filename).suffix or ".jpg"
        key = f"slabs/{uuid.uuid4().hex}{ext}"

        if settings.s3_enabled:
            url = self._upload_s3(file_bytes, key, content_type)
        else:
            url = self._upload_local(file_bytes, key)

        return key, url

    def _upload_local(self, file_bytes: bytes, key: str) -> str:
        path = self.upload_dir / key.replace("slabs/", "slabs/")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(file_bytes)
        return f"/uploads/{key}"

    def _upload_s3(self, file_bytes: bytes, key: str, content_type: str) -> str:
        client_kwargs: dict = {
            "service_name": "s3",
            "region_name": settings.s3_region,
            "aws_access_key_id": settings.s3_access_key_id,
            "aws_secret_access_key": settings.s3_secret_access_key,
        }
        if settings.s3_endpoint_url:
            client_kwargs["endpoint_url"] = settings.s3_endpoint_url

        client = boto3.client(**client_kwargs)
        client.put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=file_bytes,
            ContentType=content_type,
        )

        if settings.s3_public_base_url:
            return f"{settings.s3_public_base_url.rstrip('/')}/{key}"
        return f"https://{settings.s3_bucket}.s3.amazonaws.com/{key}"

    def delete(self, key: str | None) -> None:
        if not key:
            return
        if settings.s3_enabled:
            try:
                client_kwargs: dict = {
                    "service_name": "s3",
                    "region_name": settings.s3_region,
                    "aws_access_key_id": settings.s3_access_key_id,
                    "aws_secret_access_key": settings.s3_secret_access_key,
                }
                if settings.s3_endpoint_url:
                    client_kwargs["endpoint_url"] = settings.s3_endpoint_url
                client = boto3.client(**client_kwargs)
                client.delete_object(Bucket=settings.s3_bucket, Key=key)
            except ClientError:
                pass
        else:
            path = self.upload_dir / key.replace("slabs/", "slabs/")
            if path.exists():
                path.unlink()


storage = StorageService()
