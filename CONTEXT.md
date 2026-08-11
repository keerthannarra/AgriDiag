# AgriDiag — Project Context

This file is updated after each development session to track project state, decisions made, and what was built.

---

## Project Summary

**AgriDiag** is an AI-powered plant disease diagnosis and agricultural knowledge platform.

- **Stack:** React (Vite) + FastAPI (Python) + MongoDB (Beanie ODM) + Hugging Face CNN
- **Auth:** JWT (python-jose) + bcrypt
- **ML:** HuggingFace Inference API (image classification)
- **Roles:** FARMER, SCIENTIST, AGRICULTURIST

---

## Session Log

### Session 1 — 2026-08-11

**Completed:**
- PRD reviewed and analyzed (AgriDiag_PRD.docx)
- Implementation plan created and approved
- Architecture finalized: FastAPI replaces Express for backend, unifying API + ML in one Python service
- Full project scaffolded:
  - Backend: FastAPI app with Beanie ODM, JWT auth, all routers, ML inference service
  - Frontend: React + Vite with premium dark nature-themed design system
  - README.md and CONTEXT.md created

**Key Decisions:**
- FastAPI chosen over Express/Node.js (user preference) — enables Python-native ML integration
- Beanie ODM chosen for MongoDB (async, Pydantic-based)
- HuggingFace Inference API used (HTTP-based, no local model download needed)
- JWT stored in localStorage (frontend); Axios interceptor handles auth headers
- Confidence threshold: 0.60 (configurable in .env)
- Low-confidence predictions show a warning and recommend expert consultation
- Live chat will use FastAPI native WebSockets (no Socket.IO needed)

**Files Created:**
```
backend/
├── requirements.txt
├── .env.example
├── seed.py
└── app/
    ├── main.py
    ├── config.py
    ├── database.py
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── diagnosis.py
    │   ├── plant.py
    │   ├── disease.py
    │   └── feedback.py
    ├── routers/
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── diagnosis.py
    │   ├── history.py
    │   ├── plants.py
    │   └── feedback.py
    ├── services/
    │   ├── __init__.py
    │   ├── auth_service.py
    │   └── diagnosis_service.py
    ├── ml/
    │   ├── __init__.py
    │   ├── inference.py
    │   └── preprocessing.py
    └── middleware/
        ├── __init__.py
        └── auth.py

frontend/
├── package.json
├── index.html
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css           ← Design system
    ├── context/
    │   └── AuthContext.jsx
    ├── hooks/
    │   └── useAuth.js
    ├── services/
    │   └── api.js
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── ProtectedRoute.jsx
    │   └── LoadingSpinner.jsx
    └── pages/
        ├── Home.jsx
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── Diagnose.jsx
        ├── Results.jsx
        ├── History.jsx
        ├── PlantDatabase.jsx
        ├── FAQ.jsx
        ├── Feedback.jsx
        ├── Blog.jsx
        ├── LiveChat.jsx
        └── DirectModel.jsx

README.md
CONTEXT.md
```

---

## Current Phase: Phase 1 (Foundation) ✅ + Phase 2 (AI) 🚧 + Phase 3 (Core) ✅ + Phase 4 (Advanced) ✅

## Next Steps (Session 2)

1. Install dependencies and test the backend (uvicorn app.main:app --reload)
2. Run seed.py to populate plant/disease data
3. Install frontend deps and run (npm run dev)
4. Configure HuggingFace API token in .env
5. Test end-to-end: upload image → diagnosis → history

---

## Environment Setup Checklist

- [ ] MongoDB running locally or Atlas URI configured in `.env`
- [ ] HuggingFace API token added to `.env`
- [ ] Backend venv activated and dependencies installed
- [ ] Frontend node_modules installed (`npm install`)
- [ ] Seed data loaded (`python seed.py`)

---

## Known Open Questions

1. **HuggingFace model**: Currently using `linkanjarad/plant-disease-EfficientNet-B3` as default — confirm or change in `.env`
2. **Image storage**: Using local disk for dev; Cloudinary integration needed for production
3. **Live Chat**: Currently AI-assisted (pattern matching); real expert integration is a future phase

---

## Design System

**Colors:**
- Background: `#060d08` (deep forest dark)
- Surface: `#0d1a0f`
- Primary: `#22c55e` (vibrant green)
- Accent: `#f59e0b` (warm amber)
- Text: `#f0fdf4`

**Fonts:**
- Headings: Outfit (Google Fonts)
- Body: Inter (Google Fonts)

**UI Style:** Dark glassmorphism with green glow effects, smooth micro-animations
