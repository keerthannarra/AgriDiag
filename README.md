# AgriDiag 🌿

> **AI-Powered Plant Disease Diagnosis & Agricultural Knowledge Platform**

AgriDiag helps farmers, scientists, and agriculturists rapidly identify plant diseases from leaf images using a CNN-based machine learning model via Hugging Face. It provides treatment recommendations, prevention strategies, and a comprehensive plant/disease knowledge database.

---

## 🏗️ Architecture

```
React Frontend (Vite)
        │
        ▼ REST / HTTPS
FastAPI Backend (Python)  ←  Auth + Diagnosis API + ML Inference
        │
   ┌────┴────┐
   ▼         ▼
MongoDB    Hugging Face CNN Model
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6 |
| Styling | Vanilla CSS with design system |
| Backend | Python 3.11 + FastAPI |
| Database | MongoDB + Beanie ODM (async) |
| Auth | JWT (python-jose) + passlib[bcrypt] |
| ML Inference | Hugging Face Inference API |
| Image Processing | Pillow |

---

## 📁 Project Structure

```
agridiag-dev/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context (auth)
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API client (Axios)
│   ├── index.html
│   └── package.json
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── config.py       # Settings (pydantic-settings)
│   │   ├── database.py     # MongoDB / Beanie init
│   │   ├── models/         # Beanie document models
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic
│   │   ├── ml/             # ML inference + preprocessing
│   │   └── middleware/     # Auth dependencies
│   ├── seed.py             # Database seeding script
│   └── requirements.txt
├── README.md
└── CONTEXT.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)
- Hugging Face account (for API token)

### Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URL, JWT secret, HuggingFace token

# Seed the database with plant/disease data
python seed.py

# Run the development server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:5173

---

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **FARMER** | Diagnosis, History, Plant DB, FAQ, Feedback, Blog, Live Chat, Direct Model |
| **SCIENTIST** | All farmer features + Disease Insights panel |
| **AGRICULTURIST** | All farmer features + Recommendations panel |

---

## 🌿 Core Features

### MVP (Phase 1-3)
- ✅ Public home page with product introduction
- ✅ User registration & login (role-based)
- ✅ Leaf image upload & CNN disease diagnosis
- ✅ Diagnosis results with confidence score
- ✅ Treatment & prevention recommendations
- ✅ Diagnosis history (search, filter, delete)
- ✅ Interactive plant & disease database
- ✅ FAQ page
- ✅ Feedback system

### Advanced (Phase 4)
- ✅ Blog & educational resources
- ✅ Live chat support (FastAPI WebSocket)
- ✅ Direct model interaction

---

## 🤗 Hugging Face Model

By default, AgriDiag uses the HuggingFace Inference API. Configure your model in `.env`:

```env
HF_MODEL_NAME=linkanjarad/plant-disease-EfficientNet-B3
HF_API_TOKEN=hf_your_token_here
```

The model should be compatible with image classification and trained on PlantVillage dataset classes.

---

## 📊 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| POST | `/api/auth/logout` | Logout (client-side token deletion) |
| GET | `/api/auth/me` | Get current user info |

### Diagnosis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnosis/predict` | Upload image and get diagnosis |
| GET | `/api/diagnosis/{id}` | Get diagnosis by ID |
| DELETE | `/api/diagnosis/{id}` | Delete a diagnosis |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get user's diagnosis history |
| GET | `/api/history/search` | Search history |
| DELETE | `/api/history/{id}` | Delete history record |

### Plants & Diseases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plants` | List all plants |
| GET | `/api/plants/{id}` | Get plant details |
| GET | `/api/plants/search?q=` | Search plants |
| GET | `/api/diseases` | List all diseases |
| GET | `/api/diseases/{id}` | Get disease details |

### Feedback
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/feedback/my` | Get user's feedback |

---

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens with expiry (7 days default)
- Role-based access control (backend-enforced)
- CORS configured for allowed origins
- File upload validation (type, size)
- Input validation via Pydantic

---

## 🚀 Deployment

| Service | Provider |
|---------|---------|
| Frontend | Vercel |
| Backend (FastAPI) | Render |
| Database | MongoDB Atlas |

---

## ⚠️ Disclaimer

AI-assisted diagnosis: Results are generated using a machine learning model and are intended for informational and early-detection purposes only. For uncertain or severe cases, consult a qualified agricultural professional.

---

## 📄 License

MIT License — see LICENSE file for details.
