from io import BytesIO

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from PIL import Image

from routers.auth import get_current_admin
from schemas import UploadResponse
from services.storage import storage

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024
MIN_WIDTH = 800
MIN_HEIGHT = 1120
IDEAL_RATIO = 5 / 7


def _photography_tips(width: int, height: int) -> list[str]:
    tips: list[str] = []
    if width < MIN_WIDTH or height < MIN_HEIGHT:
        tips.append(f"Resolution low ({width}×{height}). Target at least 1200×1680 for sharp slab detail.")
    ratio = width / height if height else 1
    if abs(ratio - IDEAL_RATIO) > 0.15 and abs(ratio - 0.75) > 0.15:
        tips.append("Crop to 5:7 (card) or 3:4 (full slab with cert label) for best presentation.")
    if not tips:
        tips.append("Resolution looks good. Ensure cert label is readable and glare-free.")
    return tips


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

    width, height = 0, 0
    try:
        with Image.open(BytesIO(data)) as img:
            width, height = img.size
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image file") from exc

    key, url = storage.upload(data, file.filename or "slab.jpg", file.content_type or "image/jpeg")
    return UploadResponse(
        key=key,
        url=url,
        width=width,
        height=height,
        photography_tips=_photography_tips(width, height),
    )
