from PIL import Image
from PIL import UnidentifiedImageError
import io

from app.errors import InvalidImageError, UnsupportedImageError


# Standard preprocessing config matching PlantVillage CNN training
INPUT_SIZE = (224, 224)
SUPPORTED_FORMATS = {"JPEG", "PNG", "JPG"}


def validate_image(image_bytes: bytes) -> Image.Image:
    """
    Validate that image_bytes is a real, readable image.
    Raises a safe AgriDiag image error if the file is invalid or unsupported.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        image_format = img.format
        img.verify()
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
        raise InvalidImageError() from exc

    if image_format not in SUPPORTED_FORMATS:
        raise UnsupportedImageError()

    try:
        return Image.open(io.BytesIO(image_bytes))
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
        raise InvalidImageError() from exc


def preprocess_image(image_bytes: bytes) -> bytes:
    """
    Preprocess the image for CNN inference:
    1. Validate and open
    2. Convert to RGB (handles RGBA, palette, etc.)
    3. Resize to INPUT_SIZE
    4. Return as JPEG bytes (for API submission)
    """
    img = validate_image(image_bytes)
    img = img.convert("RGB")
    img = img.resize(INPUT_SIZE, Image.LANCZOS)

    output = io.BytesIO()
    img.save(output, format="JPEG", quality=95)
    return output.getvalue()


def save_upload(image_bytes: bytes, upload_dir: str, filename: str) -> str:
    """
    Save the original (unprocessed) upload to disk.
    Returns the relative path.
    """
    import os
    import uuid

    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(filename)[-1].lower() or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(upload_dir, unique_name)

    with open(filepath, "wb") as f:
        f.write(image_bytes)

    return f"/uploads/{unique_name}"
