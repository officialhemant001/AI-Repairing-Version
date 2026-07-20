# 🔧 AI Repair Vision

**Enterprise AI-Powered Electronic Device Analysis & Repair Platform**

A production-grade full-stack SaaS application that uses AI Vision (Gemini / OpenAI) with Retrieval-Augmented Generation (RAG) to diagnose electronic device failures, generate step-by-step repair guides, and produce professional PDF reports.

---

## ✨ Key Features

### 🔍 Multi-Modal Device Diagnosis
- **Camera Capture** — Scan devices directly from your phone or laptop webcam
- **Image Upload** — Upload photos of damaged devices, labels, or schematics
- **Text Description** — Describe the issue in natural language
- **Voice Input** — Dictate device issues using browser speech recognition
- **PDF Manual Attachment** — Upload device manuals for context-enhanced analysis

### 🤖 AI-Powered Analysis Pipeline
- **Image Preprocessing** — EXIF correction, resizing, contrast enhancement
- **OCR Extraction** — Reads model numbers, specs, and ratings from device labels
- **RAG Knowledge Retrieval** — Cosine similarity search against repair knowledge base
- **Dual AI Providers** — Supports both Google Gemini and OpenAI GPT-4o
- **Structured JSON Output** — Validated diagnosis with confidence scores
- **Safety Warnings** — Critical voltage/battery hazard detection

### 📊 Professional Reports
- **PDF Generation** — Branded diagnostic reports with ReportLab
- **QR Verification Codes** — Scannable codes linking to public report pages
- **Report Versioning** — Track changes across multiple diagnoses
- **Public Sharing** — Share reports via secure UUID-based links

### 💬 AI Chat Assistant
- **Multi-Turn Conversations** — Context-aware troubleshooting sessions
- **Scan-Linked Chats** — Chat sessions tied to specific diagnosis results
- **Session History** — Persistent chat history for authenticated users

### 👥 User Management
- **JWT Authentication** — Secure token-based auth with refresh rotation
- **Profile Management** — Avatar uploads, phone, bio fields
- **Password Recovery** — Email-based forgot/reset password flow
- **Role-Based Access** — Customer, Technician, and Admin roles

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, TypeScript, Vite, Tailwind CSS |
| **Backend** | Python 3.12+, Django 4.2, Django REST Framework |
| **Database** | PostgreSQL 16 (SQLite for development) |
| **AI Engine** | Google Gemini API, OpenAI API (GPT-4o) |
| **RAG** | NumPy cosine similarity, custom vector store |
| **PDF** | ReportLab, QRCode |
| **Auth** | SimpleJWT (access + refresh tokens) |
| **DevOps** | Docker, Docker Compose, Gunicorn, WhiteNoise |
| **Cache** | Redis 7 |

---

## 📁 Project Architecture

```
ai-repair-vision/
├── backend/
│   ├── backend/                  # Django project settings
│   │   ├── settings/
│   │   │   ├── base.py           # Shared settings
│   │   │   ├── development.py    # SQLite, DEBUG=True
│   │   │   └── production.py     # PostgreSQL, Gunicorn, Redis
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/                     # Shared middleware, exceptions, pagination
│   ├── users/                    # Authentication & profile management
│   ├── devices/                  # Device categories (DB-driven)
│   ├── scans/                    # Scan analysis, history, favorites, chat
│   ├── ai_engine/                # AI pipeline orchestrator
│   │   ├── providers/            # Gemini & OpenAI provider classes
│   │   ├── rag/                  # Embeddings & vector retriever
│   │   ├── pipeline.py           # Main orchestration flow
│   │   ├── preprocessing.py      # Image optimization
│   │   ├── ocr.py                # Label/spec text extraction
│   │   └── prompts.py            # Template management
│   ├── reports/                  # PDF generation & sharing
│   ├── feedback/                 # User ratings & reviews
│   ├── knowledge/                # Knowledge base articles & embeddings
│   ├── analytics/                # Admin dashboard metrics
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── types/                # TypeScript interfaces
│   │   ├── services/             # API client & service modules
│   │   ├── context/              # React context (auth, theme, toasts)
│   │   ├── hooks/                # useCamera, useVoiceInput
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route-level page components
│   │   └── utils/                # Constants & helpers
│   ├── tsconfig.json
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL 16 (optional — SQLite works for dev)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-repair-vision.git
cd ai-repair-vision
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your API keys:
#   GEMINI_API_KEY=your_gemini_api_key
#   OPENAI_API_KEY=your_openai_api_key
#   AI_PROVIDER=gemini   (or openai)

# Run migrations
python manage.py migrate

# Seed device categories
python manage.py seed_categories

# Seed knowledge base articles
python manage.py seed_knowledge

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Run development server
npm run dev
```

### 4. Docker Setup (Production)
```bash
# From project root
docker compose up --build -d

# Run migrations inside container
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_categories
docker compose exec backend python manage.py createsuperuser
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | Yes (if using Gemini) |
| `OPENAI_API_KEY` | OpenAI API key | Yes (if using OpenAI) |
| `AI_PROVIDER` | `gemini` or `openai` | No (defaults to `gemini`) |
| `SECRET_KEY` | Django secret key | Yes (production) |
| `DB_NAME` | PostgreSQL database name | Yes (production) |
| `DB_USER` | PostgreSQL user | Yes (production) |
| `DB_PASSWORD` | PostgreSQL password | Yes (production) |
| `DB_HOST` | PostgreSQL host | Yes (production) |
| `REDIS_URL` | Redis connection URL | No |
| `VITE_API_URL` | Backend API URL for frontend | Yes |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |
| GET/PATCH | `/api/auth/profile/` | Get/update user profile |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/auth/forgot-password/` | Request password reset |
| POST | `/api/auth/reset-password/` | Reset password with token |
| DELETE | `/api/auth/delete-account/` | Delete user account |

### Device Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scan/analyze/` | Analyze device image |
| POST | `/api/scan/analyze-text/` | Analyze text description |
| GET | `/api/scan/` | Get scan history (paginated) |
| GET | `/api/scan/:id/` | Get scan details |
| DELETE | `/api/scan/:id/delete/` | Delete a scan |
| POST | `/api/scan/:id/favorite/` | Toggle favorite |
| POST | `/api/scan/:id/bookmark/` | Toggle bookmark |
| GET | `/api/scan/bookmarks/` | Get all bookmarks |

### AI Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scan/chat/` | Send chat message |
| GET | `/api/scan/chat/sessions/` | List chat sessions |
| GET | `/api/scan/chat/sessions/:id/` | Get session messages |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reports/generate/:scan_id/` | Generate PDF report |
| GET | `/api/reports/` | List all reports |
| GET | `/api/reports/:id/` | Get report details |
| GET | `/api/reports/:id/download/` | Download PDF |
| POST | `/api/reports/:id/share/` | Toggle public sharing |
| GET | `/api/reports/share/:token/` | View shared report |

### Admin Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard/` | Admin dashboard data |
| GET | `/api/analytics/users/` | User management list |
| GET | `/api/analytics/feedback/` | Feedback overview |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend build verification
cd frontend
npm run build
```

---

## 📄 License

This project is for portfolio demonstration purposes.

---

## 👨‍💻 Author

Built by **Hemant** as a flagship portfolio project demonstrating enterprise-level Full Stack Engineering, AI Engineering, and System Design skills.
