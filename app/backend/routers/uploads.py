from fastapi import APIRouter, Depends, File, UploadFile, HTTPException

from routers.auth import get_current_admin
from schemas import UploadResponse
from services.storage import storage

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024


@router.post("/uploads", response_model=UploadResponse)
async def upload_slab_photo(
    file: UploadFile = File(...),
    _: str = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="File must be JPEG, PNG, WebP, or GIF")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit")

    key, url = storage.upload(data, file.filename or "slab.jpg", file.content_type or "image/jpeg")
    return UploadResponse(key=key, url=url)
