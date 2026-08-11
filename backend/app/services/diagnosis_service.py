from app.ml.inference import run_hf_inference, parse_prediction
from app.ml.preprocessing import preprocess_image, save_upload, validate_image
from app.models.diagnosis import Diagnosis
from app.models.disease import Disease
from app.config import settings


# Disease info database — fallback when MongoDB has no entry
DISEASE_INFO_DB: dict = {
    "Early Blight": {
        "description": "Early blight is a common fungal disease caused by Alternaria solani that affects tomatoes, potatoes, and other solanaceous crops.",
        "symptoms": ["Dark brown circular spots with concentric rings", "Yellowing of leaves around the lesions", "Premature leaf drop", "Cankers on stems"],
        "causes": ["Fungal pathogen Alternaria solani", "Warm humid conditions (24–29°C)", "Prolonged leaf wetness", "Dense planting reducing airflow"],
        "treatment": ["Apply copper-based fungicides", "Use mancozeb or chlorothalonil fungicides", "Remove and destroy infected leaves", "Improve drainage around plants"],
        "prevention": ["Rotate crops every 2–3 years", "Use certified disease-free seeds", "Avoid overhead irrigation", "Maintain proper plant spacing"],
        "management": "Monitor plants regularly. Apply fungicides at first sign of infection. Ensure good airflow through pruning.",
    },
    "Late Blight": {
        "description": "Late blight is a devastating disease caused by Phytophthora infestans, responsible for the Irish Potato Famine. It affects potatoes and tomatoes.",
        "symptoms": ["Water-soaked spots on leaves", "White mold on leaf undersides", "Dark brown lesions on stems", "Rapid plant collapse in wet conditions"],
        "causes": ["Oomycete Phytophthora infestans", "Cool, moist conditions (10–25°C)", "High relative humidity (>90%)", "Infected seed tubers or transplants"],
        "treatment": ["Apply systemic fungicides (metalaxyl, cymoxanil)", "Copper-based sprays for organic control", "Destroy all infected plant material", "Avoid watering from above"],
        "prevention": ["Use resistant varieties", "Plant certified disease-free tubers", "Ensure good drainage", "Avoid overhead irrigation"],
        "management": "Act fast — late blight spreads rapidly. Destroy infected plants immediately to prevent spread.",
    },
    "Bacterial Spot": {
        "description": "Bacterial spot is caused by Xanthomonas species and affects peppers and tomatoes, causing significant fruit and foliar damage.",
        "symptoms": ["Small, water-soaked spots on leaves", "Spots turn brown with yellow halos", "Raised, scab-like spots on fruits", "Defoliation in severe cases"],
        "causes": ["Xanthomonas bacteria", "Warm, wet weather", "Infected transplants or seeds", "Wounds from insects or tools"],
        "treatment": ["Copper-based bactericides", "Remove infected plant tissue", "Avoid working with wet plants", "Apply fixed copper sprays"],
        "prevention": ["Use disease-free seeds and transplants", "Rotate crops", "Avoid overhead irrigation", "Disinfect tools between plants"],
        "management": "No curative treatment available. Focus on prevention and suppression with copper sprays.",
    },
    "Powdery Mildew": {
        "description": "Powdery mildew is a fungal disease that appears as white powdery growth on plant surfaces, affecting many crops.",
        "symptoms": ["White powdery coating on leaves", "Distorted new growth", "Yellowing of infected tissue", "Premature leaf drop"],
        "causes": ["Various Erysiphales fungi", "Dry conditions with moderate temperatures", "High humidity at night", "Overcrowding reducing airflow"],
        "treatment": ["Sulfur-based fungicides", "Neem oil sprays", "Potassium bicarbonate", "Remove heavily infected leaves"],
        "prevention": ["Choose resistant varieties", "Proper spacing for airflow", "Avoid excess nitrogen", "Avoid wetting leaves when watering"],
        "management": "Start treatment early. Powdery mildew rarely kills plants but weakens them significantly.",
    },
    "Healthy": {
        "description": "The plant appears healthy with no detectable disease symptoms.",
        "symptoms": [],
        "causes": [],
        "treatment": ["Continue regular monitoring", "Maintain good agricultural practices"],
        "prevention": ["Regular inspection", "Proper irrigation and nutrition", "Crop rotation", "Use of disease-resistant varieties"],
        "management": "Maintain current care practices. Continue monitoring for early signs of disease.",
    },
}


async def process_diagnosis(
    image_bytes: bytes, filename: str, user_id: str
) -> dict:
    """
    Full diagnosis pipeline:
    1. Validate image
    2. Save original upload
    3. Preprocess for inference
    4. Run HuggingFace inference
    5. Parse prediction
    6. Enrich with disease info from DB or fallback
    7. Save to MongoDB
    8. Return result
    """
    # Step 1: Validate
    validate_image(image_bytes)

    # Step 2: Save original
    image_url = save_upload(image_bytes, settings.UPLOAD_DIR, filename)

    # Step 3: Preprocess
    processed = preprocess_image(image_bytes)

    # Step 4: Run inference
    raw_predictions = await run_hf_inference(processed)

    # Step 5: Parse
    prediction = parse_prediction(raw_predictions)

    # Step 6: Enrich with disease info
    disease_info = await _get_disease_info(prediction["disease"])

    # Step 7: Save to DB
    diagnosis = Diagnosis(
        user_id=user_id,
        image_url=image_url,
        plant=prediction["plant"],
        disease=prediction["disease"],
        confidence=prediction["confidence"],
        is_healthy=prediction["is_healthy"],
        is_low_confidence=prediction["is_low_confidence"],
        description=disease_info.get("description"),
        symptoms=disease_info.get("symptoms", []),
        causes=disease_info.get("causes", []),
        treatment=disease_info.get("treatment", []),
        prevention=disease_info.get("prevention", []),
        management=disease_info.get("management"),
        raw_predictions=prediction.get("raw_predictions"),
    )
    await diagnosis.insert()

    # Step 8: Return
    return {
        "id": str(diagnosis.id),
        "image_url": image_url,
        "plant": prediction["plant"],
        "disease": prediction["disease"],
        "confidence": prediction["confidence"],
        "confidence_pct": f"{prediction['confidence'] * 100:.1f}%",
        "is_healthy": prediction["is_healthy"],
        "is_low_confidence": prediction["is_low_confidence"],
        "low_confidence_warning": (
            "The AI model is not sufficiently confident in this prediction. "
            "Please upload a clearer image or consult an agricultural expert."
        ) if prediction["is_low_confidence"] else None,
        "description": disease_info.get("description"),
        "symptoms": disease_info.get("symptoms", []),
        "causes": disease_info.get("causes", []),
        "treatment": disease_info.get("treatment", []),
        "prevention": disease_info.get("prevention", []),
        "management": disease_info.get("management"),
        "raw_predictions": prediction.get("raw_predictions"),
        "_mock": prediction.get("_mock", False),
    }


async def _get_disease_info(disease_name: str) -> dict:
    """Look up disease info from DB first, then fallback to hardcoded map."""
    try:
        disease = await Disease.find_one(
            {"name": {"$regex": disease_name, "$options": "i"}}
        )
        if disease:
            return {
                "description": disease.description,
                "symptoms": disease.symptoms,
                "causes": disease.causes,
                "treatment": disease.treatment,
                "prevention": disease.prevention,
                "management": disease.management,
            }
    except Exception:
        pass

    # Fallback to hardcoded info
    for key, info in DISEASE_INFO_DB.items():
        if key.lower() in disease_name.lower() or disease_name.lower() in key.lower():
            return info

    return {
        "description": f"Information about {disease_name} is being compiled.",
        "symptoms": [],
        "causes": [],
        "treatment": ["Consult an agricultural expert for treatment advice."],
        "prevention": ["Consult an agricultural expert for prevention advice."],
        "management": None,
    }
