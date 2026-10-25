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
PostgreSQL Hugging Face CNN Model
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6 |
| Styling | Vanilla CSS with design system |
| Backend | Python 3.11 + FastAPI |
| Database | PostgreSQL + SQLAlchemy (async) |
| Auth | JWT (python-jose) + passlib[bcrypt] |
| ML Inference | Hugging Face Transformers + PyTorch (local) |
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
├── server/                 # FastAPI application
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── config.py       # Settings (pydantic-settings)
│   │   ├── database.py     # PostgreSQL / SQLAlchemy init
│   │   ├── models/         # SQLAlchemy ORM models
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
- PostgreSQL 14+
- Hugging Face account (for API token)

### Backend Setup

Start the local PostgreSQL database from the repository root:

```bash
docker compose up -d db
```

The app's development database URL matches this container by default. To use a
different or hosted PostgreSQL instance, set `DATABASE_URL` in the repository-root `.env`.
The Compose credentials are for local development only.

```bash
cd server
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Create the repository-root .env and configure your PostgreSQL URL and JWT secret.
# Set HF_MODEL_NAME to the directory containing your locally installed model files.
# DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/agridiag

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

AgriDiag loads the Transformers model exclusively from a local directory. It
does not download model files at runtime. Set `HF_MODEL_NAME` in the
repository-root `.env` to the directory containing the model files:

```env
HF_MODEL_NAME=/absolute/path/to/your/local/model-directory
```

Replace the example with the actual model directory on your machine. The path
can be absolute or relative to `server/`. The directory must contain
`config.json`, `preprocessor_config.json`, and model weights (`model.safetensors`
or `pytorch_model.bin`). Safetensors are preferred. Hugging Face repository IDs
are not local paths and are rejected. Model weights are not included in this
repository; predictions will report the missing local directory or files until
you provide a complete model directory. With the current PyTorch 2.2 setup,
use `model.safetensors`; newer Transformers versions block loading legacy
`.bin` weights with older PyTorch versions.

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
| Database | PostgreSQL |

---

## ⚠️ Disclaimer

AI-assisted diagnosis: Results are generated using a machine learning model and are intended for informational and early-detection purposes only. For uncertain or severe cases, consult a qualified agricultural professional.

---

## 📄 License

MIT License — see LICENSE file for details.
