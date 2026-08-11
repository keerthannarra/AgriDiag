from PIL import Image
import io


# Standard preprocessing config matching PlantVillage CNN training
INPUT_SIZE = (224, 224)
SUPPORTED_FORMATS = {"JPEG", "PNG", "JPG"}


def validate_image(image_bytes: bytes) -> Image.Image:
    """
    Validate that image_bytes is a real, readable image.
    Raises ValueError if invalid.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()  # Verify integrity
        # Re-open (verify closes the file)
        img = Image.open(io.BytesIO(image_bytes))
        if img.format not in SUPPORTED_FORMATS:
            raise ValueError(f"Unsupported format: {img.format}. Supported: {SUPPORTED_FORMATS}")
        return img
    except Exception as e:
        raise ValueError(f"Invalid or corrupted image: {e}")


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
