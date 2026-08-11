"""
AgriDiag — Database Seed Script
Run: python seed.py
Populates MongoDB with plant and disease data from PlantVillage dataset classes.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.config import settings
from app.models.plant import Plant
from app.models.disease import Disease


PLANTS_DATA = [
    {
        "name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "description": "Tomato is one of the most widely grown vegetable crops in the world. It is susceptible to numerous diseases that can significantly reduce yield.",
        "diseases": ["Early Blight", "Late Blight", "Bacterial Spot", "Leaf Mold", "Septoria Leaf Spot", "Spider Mites", "Target Spot", "Yellow Leaf Curl Virus", "Mosaic Virus"],
        "symptoms": ["Wilting", "Yellowing leaves", "Dark spots on fruit", "Stunted growth"],
        "treatment": ["Rotate crops annually", "Use certified seeds", "Apply appropriate fungicides"],
        "prevention": ["Use resistant varieties", "Practice good sanitation", "Monitor plants regularly"],
        "management": "Tomato plants require regular monitoring and timely intervention.",
    },
    {
        "name": "Potato",
        "scientific_name": "Solanum tuberosum",
        "description": "Potato is a staple crop vulnerable to devastating diseases including late blight, the pathogen responsible for the Irish Famine.",
        "diseases": ["Early Blight", "Late Blight"],
        "symptoms": ["Wilting", "Dark spots on tubers", "Foliage collapse"],
        "treatment": ["Apply fungicides at first sign", "Destroy infected plants"],
        "prevention": ["Use certified seed tubers", "Avoid overhead irrigation", "Crop rotation"],
        "management": "Scout fields regularly, especially during wet and cool conditions.",
    },
    {
        "name": "Apple",
        "scientific_name": "Malus domestica",
        "description": "Apple trees are susceptible to several fungal and bacterial diseases that affect both foliage and fruit quality.",
        "diseases": ["Apple Scab", "Black Rot", "Cedar Apple Rust"],
        "symptoms": ["Dark scabby lesions on fruit", "Leaf spots", "Orange rust spots"],
        "treatment": ["Apply fungicides during bloom", "Prune infected branches"],
        "prevention": ["Plant resistant varieties", "Rake and destroy fallen leaves", "Proper tree spacing"],
        "management": "Apply a fungicide spray program starting at green tip stage.",
    },
    {
        "name": "Corn",
        "scientific_name": "Zea mays",
        "description": "Corn (maize) is a major cereal crop affected by several foliar diseases that can significantly reduce grain yield.",
        "diseases": ["Gray Leaf Spot", "Common Rust", "Northern Leaf Blight"],
        "symptoms": ["Gray leaf lesions", "Orange/red rust pustules", "Large cigar-shaped lesions"],
        "treatment": ["Apply fungicides at VT/R1 stage", "Use resistant hybrids"],
        "prevention": ["Rotate with non-host crops", "Use resistant varieties", "Proper spacing"],
        "management": "Monitor for disease pressure from silking through grain fill.",
    },
    {
        "name": "Grape",
        "scientific_name": "Vitis vinifera",
        "description": "Grapes are susceptible to several serious fungal diseases that affect both yield and fruit quality.",
        "diseases": ["Black Rot", "Esca (Black Measles)", "Leaf Blight"],
        "symptoms": ["Brown lesions with dark borders", "Internal wood discoloration", "Leaf scorching"],
        "treatment": ["Apply protective fungicides", "Prune out infected wood", "Remove mummified berries"],
        "prevention": ["Use disease-resistant rootstocks", "Proper canopy management", "Avoid wound during wet conditions"],
        "management": "Establish a comprehensive spray program starting at budbreak.",
    },
    {
        "name": "Bell Pepper",
        "scientific_name": "Capsicum annuum",
        "description": "Bell peppers are susceptible to bacterial spot, which can severely damage both foliage and fruit.",
        "diseases": ["Bacterial Spot"],
        "symptoms": ["Water-soaked spots", "Yellow halos around spots", "Premature fruit drop"],
        "treatment": ["Copper-based bactericides", "Remove infected tissue"],
        "prevention": ["Use disease-free seeds", "Avoid wet conditions when handling plants"],
        "management": "Apply copper sprays preventively before wet periods.",
    },
    {
        "name": "Strawberry",
        "scientific_name": "Fragaria × ananassa",
        "description": "Strawberries are affected by several diseases, with leaf scorch being a common foliar disease.",
        "diseases": ["Leaf Scorch"],
        "symptoms": ["Small purple spots on leaves", "Irregular brown lesions", "Leaf browning at margins"],
        "treatment": ["Apply fungicides", "Remove and destroy infected leaves"],
        "prevention": ["Use certified planting material", "Proper plant spacing", "Avoid overhead irrigation"],
        "management": "Manage irrigation to keep foliage dry. Remove infected plant debris.",
    },
    {
        "name": "Peach",
        "scientific_name": "Prunus persica",
        "description": "Peaches are susceptible to bacterial spot, which affects both foliage and fruit.",
        "diseases": ["Bacterial Spot"],
        "symptoms": ["Angular water-soaked spots", "Defoliation", "Sunken lesions on fruit"],
        "treatment": ["Apply copper hydroxide", "Oxytetracycline sprays"],
        "prevention": ["Plant resistant varieties", "Avoid low-lying areas with poor air drainage"],
        "management": "Apply preventive copper sprays from petal fall through harvest.",
    },
    {
        "name": "Orange",
        "scientific_name": "Citrus sinensis",
        "description": "Oranges can be severely affected by Huanglongbing (citrus greening), one of the most devastating citrus diseases.",
        "diseases": ["Huanglongbing (Citrus Greening)"],
        "symptoms": ["Blotchy mottling of leaves", "Yellow shoots", "Small misshapen fruit", "Bitter taste"],
        "treatment": ["No cure — remove infected trees", "Control psyllid vector"],
        "prevention": ["Use certified disease-free planting material", "Control Asian citrus psyllid", "Quarantine new plants"],
        "management": "There is no cure. Focus on preventing spread by controlling the insect vector.",
    },
    {
        "name": "Squash",
        "scientific_name": "Cucurbita pepo",
        "description": "Squash is commonly affected by powdery mildew, especially in warm dry conditions.",
        "diseases": ["Powdery Mildew"],
        "symptoms": ["White powdery coating on leaves", "Yellowing of older leaves", "Reduced fruit quality"],
        "treatment": ["Sulfur or neem oil sprays", "Potassium bicarbonate"],
        "prevention": ["Plant resistant varieties", "Ensure good air circulation", "Avoid excess nitrogen"],
        "management": "Start treatment at first sign. Powdery mildew rarely kills plants but reduces yield.",
    },
    {
        "name": "Cherry",
        "scientific_name": "Prunus avium",
        "description": "Cherries can be affected by powdery mildew, which reduces fruit quality and weakens trees.",
        "diseases": ["Powdery Mildew"],
        "symptoms": ["White powdery growth on new leaves", "Distorted shoot tips", "Stunted growth"],
        "treatment": ["Sulfur-based fungicides", "Myclobutanil", "Remove infected tissue"],
        "prevention": ["Plant in areas with good air circulation", "Avoid excessive nitrogen fertilization"],
        "management": "Apply protective fungicides at early sign of infection.",
    },
    {
        "name": "Blueberry",
        "scientific_name": "Vaccinium corymbosum",
        "description": "Blueberries are generally hardy but should be monitored for common diseases.",
        "diseases": [],
        "symptoms": [],
        "treatment": ["Regular monitoring", "Good cultural practices"],
        "prevention": ["Use certified planting stock", "Proper soil pH (4.5–5.5)", "Good drainage"],
        "management": "Maintain optimal soil conditions and monitor for pest pressure.",
    },
    {
        "name": "Raspberry",
        "scientific_name": "Rubus idaeus",
        "description": "Raspberries require regular monitoring for diseases. Healthy plants are highly productive.",
        "diseases": [],
        "symptoms": [],
        "treatment": ["Regular pruning", "Good sanitation"],
        "prevention": ["Remove old canes after harvest", "Avoid overhead irrigation"],
        "management": "Prune annually, remove spent canes, and monitor for disease.",
    },
    {
        "name": "Soybean",
        "scientific_name": "Glycine max",
        "description": "Soybean is a major oilseed crop. Healthy management practices are essential for high yield.",
        "diseases": [],
        "symptoms": [],
        "treatment": ["Crop rotation", "Proper fertilization"],
        "prevention": ["Use resistant varieties", "Crop rotation with non-legumes"],
        "management": "Monitor for sudden death syndrome and white mold under wet conditions.",
    },
]


DISEASES_DATA = [
    {
        "name": "Early Blight",
        "affected_plants": ["Tomato", "Potato"],
        "description": "Early blight is a common fungal disease caused by Alternaria solani affecting solanaceous crops.",
        "symptoms": ["Dark brown circular spots with concentric rings (target pattern)", "Yellowing of leaves around lesions", "Premature leaf drop", "Cankers on stems near soil"],
        "causes": ["Alternaria solani fungus", "Warm humid conditions (24–29°C)", "Prolonged leaf wetness", "Dense planting reducing airflow", "Infected plant debris in soil"],
        "treatment": ["Apply copper-based fungicides every 7–10 days", "Use mancozeb or chlorothalonil", "Remove and destroy infected leaves immediately", "Improve drainage around plants", "Reduce plant density"],
        "prevention": ["Rotate crops every 2–3 years", "Use certified disease-free seeds", "Avoid overhead irrigation", "Maintain proper plant spacing (45–60 cm)", "Mulch soil to prevent splash dispersal"],
        "management": "Monitor plants regularly starting from early vegetative stage. Apply fungicides at first sign of infection and continue on a preventive schedule during wet periods.",
        "severity": "Medium",
    },
    {
        "name": "Late Blight",
        "affected_plants": ["Tomato", "Potato"],
        "description": "Late blight caused by Phytophthora infestans is one of the most destructive plant diseases, responsible for the 1840s Irish Potato Famine.",
        "symptoms": ["Water-soaked, irregular spots on leaves", "White/gray mold on leaf undersides in humid conditions", "Dark brown lesions on stems", "Rapid plant collapse in wet weather", "Firm brown rot of tubers with red-brown discoloration"],
        "causes": ["Oomycete Phytophthora infestans", "Cool, moist conditions (10–25°C, >90% RH)", "Infected seed tubers or transplants", "Wind-dispersed spores from nearby fields"],
        "treatment": ["Apply systemic fungicides (metalaxyl, cymoxanil, mandipropamid)", "Copper-based sprays for organic control", "Destroy ALL infected plant material immediately", "Avoid watering from above", "Harvest tubers promptly under dry conditions"],
        "prevention": ["Use certified disease-free seed potatoes", "Plant resistant varieties", "Ensure good field drainage", "Avoid overhead irrigation", "Monitor disease forecasting services"],
        "management": "Act fast — late blight can destroy a field in days under ideal conditions. Preventive fungicide programs starting before first expected infection are essential.",
        "severity": "High",
    },
    {
        "name": "Bacterial Spot",
        "affected_plants": ["Tomato", "Bell Pepper", "Peach"],
        "description": "Bacterial spot caused by Xanthomonas species is a serious disease affecting peppers, tomatoes, and stone fruits.",
        "symptoms": ["Small, dark, water-soaked spots on leaves", "Spots turn brown with yellow halos", "Raised, scab-like spots on fruit", "Defoliation in severe cases", "Fruit cracking and rotting"],
        "causes": ["Xanthomonas bacteria species", "Warm, wet weather (24–30°C)", "Infected transplants or seeds", "Wounds from insects, tools, or hail", "Splash dispersal by rain"],
        "treatment": ["Apply copper-based bactericides preventively", "Remove infected plant tissue", "Avoid working with wet plants", "Apply fixed copper with mancozeb"],
        "prevention": ["Use disease-free certified seeds and transplants", "Rotate crops 2–3 years", "Avoid overhead irrigation", "Disinfect tools between plants", "Use resistant varieties where available"],
        "management": "No curative treatment is fully effective. Focus on preventive copper applications before and during rainy periods. Remove and destroy severely infected plants.",
        "severity": "Medium",
    },
    {
        "name": "Apple Scab",
        "affected_plants": ["Apple"],
        "description": "Apple scab caused by Venturia inaequalis is the most common and economically important disease of apples worldwide.",
        "symptoms": ["Olive-green to brown scabby lesions on leaves", "Similar lesions on fruit surface", "Premature leaf drop", "Distorted, cracked fruit", "Black velvety spots on leaves"],
        "causes": ["Venturia inaequalis fungus", "Cool, wet spring weather", "Spores released from infected leaf litter", "Extended leaf wetness periods"],
        "treatment": ["Apply fungicides starting at green tip", "Use captan, myclobutanil, or sulfur sprays", "Prune for good air circulation", "Remove and destroy fallen leaves"],
        "prevention": ["Plant scab-resistant apple varieties", "Rake and destroy fallen leaves in autumn", "Apply lime sulfur sprays during dormancy", "Proper tree spacing for airflow"],
        "management": "A well-timed fungicide program from green tip through petal fall is essential. Monitor for infection periods (Mills periods) using temperature and leaf wetness data.",
        "severity": "High",
    },
    {
        "name": "Powdery Mildew",
        "affected_plants": ["Squash", "Cherry", "Grape", "Apple"],
        "description": "Powdery mildew encompasses various fungal diseases of the order Erysiphales, appearing as distinctive white powdery growth.",
        "symptoms": ["White powdery coating on leaf surfaces", "Distorted, stunted new growth", "Yellowing and browning of infected tissue", "Premature leaf drop", "Reduced fruit quality and size"],
        "causes": ["Various Erysiphales fungi (species-specific)", "Dry conditions with moderate temperatures (15–25°C)", "High humidity at night with dry days", "Overcrowding reducing airflow", "Excessive nitrogen fertilization"],
        "treatment": ["Sulfur-based fungicides", "Neem oil or potassium bicarbonate (organic)", "Myclobutanil or triadimefon (systemic)", "Remove heavily infected leaves", "Avoid touching infected plants"],
        "prevention": ["Choose resistant varieties", "Proper spacing for airflow", "Avoid excess nitrogen fertilization", "Avoid wetting leaves when watering", "Monitor plants from early in season"],
        "management": "Start treatment early as powdery mildew spreads rapidly. While rarely fatal, it significantly weakens plants and reduces crop quality. Maintain a consistent spray schedule.",
        "severity": "Medium",
    },
    {
        "name": "Gray Leaf Spot",
        "affected_plants": ["Corn"],
        "description": "Gray leaf spot caused by Cercospora zeae-maydis is a major foliar disease of corn that can cause significant yield loss.",
        "symptoms": ["Rectangular gray to tan lesions parallel to leaf veins", "Lesions limited by leaf veins", "Premature leaf death", "Yield reduction from reduced photosynthesis"],
        "causes": ["Cercospora zeae-maydis fungus", "Warm humid conditions (25–30°C)", "Corn debris left in field", "Extended periods of high humidity"],
        "treatment": ["Apply foliar fungicides (strobilurins, triazoles) at VT/R1", "Use resistant hybrids"],
        "prevention": ["Plant resistant corn hybrids", "Rotate with non-host crops", "Reduce corn residue", "Improve field drainage and airflow"],
        "management": "Fungicide application is most effective when applied at or before tasseling (VT stage) under high disease pressure conditions.",
        "severity": "High",
    },
    {
        "name": "Common Rust",
        "affected_plants": ["Corn"],
        "description": "Common rust caused by Puccinia sorghi produces distinctive orange-red pustules on corn leaves.",
        "symptoms": ["Oval to elongated orange-red pustules on both leaf surfaces", "Pustules turn dark brown as they mature", "Severe infections cause premature leaf death", "Yield loss in susceptible hybrids"],
        "causes": ["Puccinia sorghi fungus", "Cool temperatures (15–25°C)", "High humidity", "Wind-dispersed spores from southern regions"],
        "treatment": ["Apply fungicides (strobilurins, triazoles) at first sign", "Most effective before tasseling"],
        "prevention": ["Plant rust-resistant hybrids", "Plant early to avoid peak rust pressure", "Monitor fields from V5 through tasseling"],
        "management": "Most modern commercial hybrids have good resistance. Fungicide application is economically justified only in highly susceptible hybrids under high disease pressure.",
        "severity": "Medium",
    },
    {
        "name": "Leaf Scorch",
        "affected_plants": ["Strawberry"],
        "description": "Strawberry leaf scorch caused by Diplocarpon earliana is a widespread fungal disease that weakens strawberry plants.",
        "symptoms": ["Small purple spots on upper leaf surface", "Spots become irregular brown lesions", "Leaf browning and death at margins", "Reduced vigor and fruit size"],
        "causes": ["Diplocarpon earliana fungus", "Cool, wet spring conditions", "Infected plant debris", "Dense planting"],
        "treatment": ["Apply captan or myclobutanil fungicides", "Remove and destroy infected leaves", "Improve air circulation by thinning plants"],
        "prevention": ["Use certified, disease-free transplants", "Avoid overhead irrigation", "Proper plant spacing", "Remove old leaves after harvest"],
        "management": "Apply fungicides early in the season. Remove old foliage after renovation in summer to reduce inoculum.",
        "severity": "Low",
    },
    {
        "name": "Huanglongbing (Citrus Greening)",
        "affected_plants": ["Orange"],
        "description": "Huanglongbing (HLB), also called citrus greening, is the most devastating citrus disease worldwide, caused by Candidatus Liberibacter species spread by the Asian citrus psyllid.",
        "symptoms": ["Blotchy mottling of leaves (asymmetric, across mid-vein)", "Yellow shoots (green islands)", "Small, misshapen, bitter fruit", "Fruit drop", "Tree decline and death"],
        "causes": ["Candidatus Liberibacter asiaticus bacteria", "Spread by Asian citrus psyllid (Diaphorina citri)", "Graft transmission", "No known cure"],
        "treatment": ["Remove and destroy infected trees immediately", "Control psyllid population with insecticides", "Apply nutritional sprays to slow decline in mildly infected trees"],
        "prevention": ["Use only certified disease-free nursery stock", "Control Asian citrus psyllid rigorously", "Quarantine new plant material", "Regular grove inspection"],
        "management": "There is NO cure for HLB. Infected trees should be removed promptly to prevent spread. The only effective strategy is prevention through psyllid control and use of disease-free material.",
        "severity": "High",
    },
    {
        "name": "Black Rot",
        "affected_plants": ["Apple", "Grape"],
        "description": "Black rot caused by Botryosphaeria obtusa (apple) or Guignardia bidwellii (grape) causes fruit rot, leaf spots, and cankers.",
        "symptoms": ["Circular leaf spots with purple margins", "Mummified, shriveled black fruit", "Cankers on branches", "Fruit rot starting at calyx end (apple)"],
        "causes": ["Fungal pathogens (Botryosphaeria / Guignardia)", "Warm, wet conditions", "Dead wood in orchard/vineyard providing inoculum", "Insect or hail wounds"],
        "treatment": ["Apply captan, mancozeb, or DMI fungicides", "Prune out cankers", "Remove mummified fruit from trees", "Destroy pruned material"],
        "prevention": ["Prune out dead wood annually", "Remove mummified fruit", "Apply dormant copper spray", "Proper orchard/vineyard sanitation"],
        "management": "Sanitation is the most important management tool. Remove all mummified fruit and dead wood before disease season begins.",
        "severity": "Medium",
    },
]


async def seed_database():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DB_NAME],
        document_models=[Plant, Disease],
    )

    # Seed plants
    existing_plants = await Plant.count()
    if existing_plants == 0:
        print("🌿 Seeding plants...")
        for plant_data in PLANTS_DATA:
            plant = Plant(**plant_data)
            await plant.insert()
        print(f"   ✅ Inserted {len(PLANTS_DATA)} plants")
    else:
        print(f"   ⚠️  Plants already seeded ({existing_plants} records)")

    # Seed diseases
    existing_diseases = await Disease.count()
    if existing_diseases == 0:
        print("🦠 Seeding diseases...")
        for disease_data in DISEASES_DATA:
            disease = Disease(**disease_data)
            await disease.insert()
        print(f"   ✅ Inserted {len(DISEASES_DATA)} diseases")
    else:
        print(f"   ⚠️  Diseases already seeded ({existing_diseases} records)")

    print("\n✅ Database seeding complete!")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
