import asyncio
import io
from functools import lru_cache
from pathlib import Path
import threading
from typing import Any

from app.config import settings
from app.errors import ModelUnavailableError

_model_load_lock = threading.Lock()
BACKEND_DIR = Path(__file__).resolve().parents[2]


# PlantVillage class label mapping — maps model output to (plant, disease, is_healthy)
DISEASE_CLASS_MAP = {
    "Apple___Apple_scab": ("Apple", "Apple Scab", False),
    "Apple___Black_rot": ("Apple", "Black Rot", False),
    "Apple___Cedar_apple_rust": ("Apple", "Cedar Apple Rust", False),
    "Apple___healthy": ("Apple", "Healthy", True),
    "Blueberry___healthy": ("Blueberry", "Healthy", True),
    "Cherry_(including_sour)___Powdery_mildew": ("Cherry", "Powdery Mildew", False),
    "Cherry_(including_sour)___healthy": ("Cherry", "Healthy", True),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("Corn", "Gray Leaf Spot", False),
    "Corn_(maize)___Common_rust_": ("Corn", "Common Rust", False),
    "Corn_(maize)___Northern_Leaf_Blight": ("Corn", "Northern Leaf Blight", False),
    "Corn_(maize)___healthy": ("Corn", "Healthy", True),
    "Grape___Black_rot": ("Grape", "Black Rot", False),
    "Grape___Esca_(Black_Measles)": ("Grape", "Esca (Black Measles)", False),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ("Grape", "Leaf Blight", False),
    "Grape___healthy": ("Grape", "Healthy", True),
    "Orange___Haunglongbing_(Citrus_greening)": ("Orange", "Huanglongbing (Citrus Greening)", False),
    "Peach___Bacterial_spot": ("Peach", "Bacterial Spot", False),
    "Peach___healthy": ("Peach", "Healthy", True),
    "Pepper,_bell___Bacterial_spot": ("Bell Pepper", "Bacterial Spot", False),
    "Pepper,_bell___healthy": ("Bell Pepper", "Healthy", True),
    "Potato___Early_blight": ("Potato", "Early Blight", False),
    "Potato___Late_blight": ("Potato", "Late Blight", False),
    "Potato___healthy": ("Potato", "Healthy", True),
    "Raspberry___healthy": ("Raspberry", "Healthy", True),
    "Soybean___healthy": ("Soybean", "Healthy", True),
    "Squash___Powdery_mildew": ("Squash", "Powdery Mildew", False),
    "Strawberry___Leaf_scorch": ("Strawberry", "Leaf Scorch", False),
    "Strawberry___healthy": ("Strawberry", "Healthy", True),
    "Tomato___Bacterial_spot": ("Tomato", "Bacterial Spot", False),
    "Tomato___Early_blight": ("Tomato", "Early Blight", False),
    "Tomato___Late_blight": ("Tomato", "Late Blight", False),
    "Tomato___Leaf_Mold": ("Tomato", "Leaf Mold", False),
    "Tomato___Septoria_leaf_spot": ("Tomato", "Septoria Leaf Spot", False),
    "Tomato___Spider_mites Two-spotted_spider_mite": ("Tomato", "Spider Mites", False),
    "Tomato___Target_Spot": ("Tomato", "Target Spot", False),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ("Tomato", "Yellow Leaf Curl Virus", False),
    "Tomato___Tomato_mosaic_virus": ("Tomato", "Mosaic Virus", False),
    "Tomato___healthy": ("Tomato", "Healthy", True),
    "Apple Scab": ("Apple", "Apple Scab", False),
    "Apple with Black Rot": ("Apple", "Black Rot", False),
    "Cedar Apple Rust": ("Apple", "Cedar Apple Rust", False),
    "Healthy Apple": ("Apple", "Healthy", True),
    "Healthy Blueberry Plant": ("Blueberry", "Healthy", True),
    "Cherry with Powdery Mildew": ("Cherry", "Powdery Mildew", False),
    "Healthy Cherry Plant": ("Cherry", "Healthy", True),
    "Corn (Maize) with Cercospora and Gray Leaf Spot": ("Corn", "Gray Leaf Spot", False),
    "Corn (Maize) with Common Rust": ("Corn", "Common Rust", False),
    "Corn (Maize) with Northern Leaf Blight": ("Corn", "Northern Leaf Blight", False),
    "Healthy Corn (Maize) Plant": ("Corn", "Healthy", True),
    "Grape with Black Rot": ("Grape", "Black Rot", False),
    "Grape with Esca (Black Measles)": ("Grape", "Esca (Black Measles)", False),
    "Grape with Isariopsis Leaf Spot": ("Grape", "Leaf Blight", False),
    "Healthy Grape Plant": ("Grape", "Healthy", True),
    "Orange with Citrus Greening": ("Orange", "Huanglongbing (Citrus Greening)", False),
    "Peach with Bacterial Spot": ("Peach", "Bacterial Spot", False),
    "Healthy Peach Plant": ("Peach", "Healthy", True),
    "Bell Pepper with Bacterial Spot": ("Bell Pepper", "Bacterial Spot", False),
    "Healthy Bell Pepper Plant": ("Bell Pepper", "Healthy", True),
    "Potato with Early Blight": ("Potato", "Early Blight", False),
    "Potato with Late Blight": ("Potato", "Late Blight", False),
    "Healthy Potato Plant": ("Potato", "Healthy", True),
    "Healthy Raspberry Plant": ("Raspberry", "Healthy", True),
    "Healthy Soybean Plant": ("Soybean", "Healthy", True),
    "Squash with Powdery Mildew": ("Squash", "Powdery Mildew", False),
    "Strawberry with Leaf Scorch": ("Strawberry", "Leaf Scorch", False),
    "Healthy Strawberry Plant": ("Strawberry", "Healthy", True),
    "Tomato with Bacterial Spot": ("Tomato", "Bacterial Spot", False),
    "Tomato with Early Blight": ("Tomato", "Early Blight", False),
    "Tomato with Late Blight": ("Tomato", "Late Blight", False),
    "Tomato with Leaf Mold": ("Tomato", "Leaf Mold", False),
    "Tomato with Septoria Leaf Spot": ("Tomato", "Septoria Leaf Spot", False),
    "Tomato with Spider Mites or Two-spotted Spider Mite": ("Tomato", "Spider Mites", False),
    "Tomato with Target Spot": ("Tomato", "Target Spot", False),
    "Tomato Yellow Leaf Curl Virus": ("Tomato", "Yellow Leaf Curl Virus", False),
    "Tomato Mosaic Virus": ("Tomato", "Mosaic Virus", False),
    "Healthy Tomato Plant": ("Tomato", "Healthy", True),
}


async def run_hf_inference(image_bytes: bytes) -> list[dict[str, str | float]]:
    """Run image classification with the locally loaded Hugging Face model."""
    return await asyncio.to_thread(_run_local_hf_inference, image_bytes)


@lru_cache(maxsize=1)
def _load_local_model(model_name: str) -> tuple[Any, Any]:
    if not model_name.strip():
        raise ModelUnavailableError() from ValueError("HF_MODEL_NAME is not configured")

    model_dir = Path(model_name).expanduser()
    if not model_dir.is_absolute():
        model_dir = BACKEND_DIR / model_dir
    model_dir = model_dir.resolve()

    if not model_dir.is_dir():
        raise ModelUnavailableError() from FileNotFoundError(
            f"Local model directory does not exist: {model_dir}"
        )

    required_files = ["config.json", "preprocessor_config.json"]
    missing_files = [name for name in required_files if not (model_dir / name).is_file()]
    has_safetensors = any(
        (model_dir / filename).is_file()
        for filename in ("model.safetensors", "model.safetensors.index.json")
    )
    has_pytorch_weights = any(
        (model_dir / filename).is_file()
        for filename in ("pytorch_model.bin", "pytorch_model.bin.index.json")
    )

    if not has_safetensors and not has_pytorch_weights:
        missing_files.append("model.safetensors or pytorch_model.bin")
    if missing_files:
        raise ModelUnavailableError() from FileNotFoundError(
            f"Local model directory {model_dir} is missing: {', '.join(missing_files)}"
        )

    try:
        from transformers import AutoConfig, AutoImageProcessor, AutoModelForImageClassification

        model_path = str(model_dir)
        processor = AutoImageProcessor.from_pretrained(
            model_path,
            local_files_only=True,
            use_fast=False,
        )
        config = AutoConfig.from_pretrained(model_path, local_files_only=True)
        model = AutoModelForImageClassification.from_pretrained(
            model_path,
            config=config,
            local_files_only=True,
            use_safetensors=has_safetensors,
        )
        model.eval()
        return processor, model
    except Exception as exc:
        raise ModelUnavailableError() from exc


def _run_local_hf_inference(image_bytes: bytes) -> list[dict[str, str | float]]:
    import torch
    from PIL import Image

    with _model_load_lock:
        processor, model = _load_local_model(settings.HF_MODEL_NAME)

    with Image.open(io.BytesIO(image_bytes)) as image:
        inputs = processor(images=image.convert("RGB"), return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
    top_probabilities, top_indices = torch.topk(
        probabilities,
        min(3, probabilities.shape[-1]),
        dim=-1,
    )

    return [
        {
            "label": model.config.id2label[index.item()],
            "score": probability.item(),
        }
        for probability, index in zip(top_probabilities[0], top_indices[0])
    ]


def parse_prediction(predictions: list) -> dict:
    """
    Parse the top prediction from local model output.
    Returns normalized prediction dict.
    """
    if not predictions:
        raise ValueError("The model returned no predictions.")

    top = predictions[0]
    label = top.get("label", "")
    confidence = float(top.get("score", 0))

    # Map label to structured output
    mapped = DISEASE_CLASS_MAP.get(label)
    if mapped:
        plant, disease, is_healthy = mapped
    else:
        # Fallback: parse the label string
        parts = label.replace("___", " — ").replace("_", " ").split(" — ")
        plant = parts[0] if parts else "Unknown"
        disease = parts[1] if len(parts) > 1 else label
        is_healthy = "healthy" in label.lower()

    return {
        "label": label,
        "plant": plant,
        "disease": disease,
        "confidence": round(confidence, 4),
        "is_healthy": is_healthy,
        "is_low_confidence": confidence < settings.CONFIDENCE_THRESHOLD,
        "raw_predictions": predictions[:5],  # Top-5 only
    }
