import httpx
import base64
from typing import Optional
from app.config import settings


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
}


async def run_hf_inference(image_bytes: bytes) -> Optional[list]:
    """
    Call the Hugging Face Inference API for image classification.
    Returns list of {label, score} dicts sorted by score descending.
    """
    if not settings.HF_API_TOKEN:
        return None

    api_url = f"https://api-inference.huggingface.co/models/{settings.HF_MODEL_NAME}"
    headers = {"Authorization": f"Bearer {settings.HF_API_TOKEN}"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                api_url,
                headers=headers,
                content=image_bytes,
            )
            if response.status_code == 200:
                results = response.json()
                # Sort by score descending
                results.sort(key=lambda x: x.get("score", 0), reverse=True)
                return results
            else:
                print(f"HuggingFace API error: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        print(f"HuggingFace inference error: {e}")
        return None


def parse_prediction(predictions: list) -> dict:
    """
    Parse the top prediction from HuggingFace output.
    Returns normalized prediction dict.
    """
    if not predictions:
        return _get_mock_prediction()

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


def _get_mock_prediction() -> dict:
    """Mock prediction when HuggingFace API is unavailable (dev/testing)."""
    return {
        "label": "Tomato___Early_blight",
        "plant": "Tomato",
        "disease": "Early Blight",
        "confidence": 0.9247,
        "is_healthy": False,
        "is_low_confidence": False,
        "raw_predictions": [
            {"label": "Tomato___Early_blight", "score": 0.9247},
            {"label": "Tomato___Late_blight", "score": 0.0513},
            {"label": "Tomato___healthy", "score": 0.0240},
        ],
        "_mock": True,
    }
