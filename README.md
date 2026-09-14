# Pharmacon (v2.0 Clean Rebuild)

> **Doctor-Adaptive Clinical Handwriting Digitization & Real-Time Formulary Synchronization Engine**  
> UCS503 Software Engineering Capstone Project

---

## 1. Project Overview

**Pharmacon** bridges the gap between physician handwritten prescriptions and pharmacy dispensing. It features:
1. **Doctor Handwriting Style Adaptation**: Few-shot writer calibration to resolve idiosyncratic medical cursive ligatures.
2. **AI-Assisted Structured Extraction**: OCR parsing of medicine names, strengths, dosage forms, routes, frequencies, and durations.
3. **Mandatory Human-in-the-Loop Review**: Safety thresholding (<90% confidence flagged with "Needs Verification").
4. **Formulary Inventory Matching**: Direct mapping to hospital pharmacy stock and SKUs without autonomous drug substitutions.
5. **Multi-Role Healthcare Dashboards**: Tailored workflows for Doctors, Clinic Staff, Pharmacists, Patients, and Course Instructors.
6. **Continuous Correction Learning & Immutable Audits**: Replay buffer recording verified corrections and full PostgreSQL audit logs.

---

## 2. Tech Stack

- **Frontend**: React 18, JavaScript (ES Modules), Vite 5
- **Styling**: Tailwind CSS (Custom tactile color tokens: `#FFF8E8` Canvas, `#351027` Dark Burgundy, `#FF6F89` Pink, `#F52F4F` Red, `#FECB66` Gold)
- **Icons**: Lucide React
- **Routing**: React Router 6 (`HashRouter` for GitHub Pages compatibility)
- **Backend & Cloud**: Supabase (PostgreSQL Database, Auth, Storage, Row Level Security)
- **Deployment**: GitHub Pages via GitHub Actions

---

## 3. Architecture & ML Boundary

```
React Frontend (Vite + Tailwind)
        │
        ├── Supabase JS Client
        │       ├── Supabase Auth (JWT & Roles)
        │       ├── PostgreSQL Database (RLS Enforced)
        │       └── Supabase Storage (Prescriptions, Decks, Assets)
        │
        └── Extraction Interface (src/lib/extractionEngine.js)
                └── [DEMO / PLANNED] Modular interface ready for PyTorch LoRA Model
```

> [!NOTE]
> **Current ML Model Limitation:** The deep-learning doctor adaptation model is currently in training/planning. The application uses an isolated dummy extraction harness returning structured demo tokens with confidence metrics. No fabricated benchmark data is claimed.

---

## 4. Supabase Database Schema & Storage

The database schema is defined in [`supabase_schema.sql`](./supabase_schema.sql).

### PostgreSQL Tables:
- `profiles`: Auth metadata and user roles (`admin`, `doctor`, `clinic-staff`, `pharmacist`, `patient`, `instructor`).
- `team_members`: 4 development team profiles with editable skills, focus, and avatar URLs.
- `inventory_items`: Formulary medicines, strength, dosage form, pack size, SKU, and non-negative stock levels.
- `prescriptions`: Uploaded prescription records and clinical statuses (`draft`, `confirmed`, `dispensed`).
- `prescription_fields`: Extracted field labels, values, confidence scores, and verification flags.
- `refill_requests`: Patient refill requests with pharmacy review status (`pending`, `approved`, `rejected`, `contacted`).
- `audit_events`: Comprehensive audit log tracking every data modification and confirmation.
- `versions`: Deliverable changelog and release history.
- `deliverables`: Academic project artifacts, reports, and downloadable files.
- `presentation_decks`: PowerPoint presentation decks and metadata.

### Storage Buckets:
- `team-assets`: Profile pictures uploaded by admins.
- `prescriptions`: Scanned and uploaded prescription images.
- `presentations`: Official PowerPoint pitch decks (`.pptx`).
- `deliverables`: Coursework documents and specification PDFs.

---

## 5. Local Setup & Running Locally

### Prerequisites
- Node.js 18+ installed

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chiraglamba27/pharmacon2.git
   cd pharmacon2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for Live Supabase):**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Supabase Project URL and Public Anon Key:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Note: If no Supabase credentials are provided, the application runs seamlessly in Evaluator Demo mode with offline fallback data).*

4. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 6. Building & GitHub Pages Deployment

### Build Command:
```bash
npm run build
```
Generates the production bundle in the `dist/` directory.

### Automated GitHub Pages Deployment:
The included `.github/workflows/deploy.yml` workflow automatically builds and deploys to GitHub Pages whenever changes are pushed to `main`.

---

## 7. Development Team (4 Members)

1. **Aryan Sharma** — Frontend Lead (UI/UX architecture, responsive design system, tactile component library)
2. **Aniket Raj** — Backend Lead (Supabase architecture, PostgreSQL persistence, storage integrations)
3. **Amitesh Kumar Singh** — AI / CV Engineer (Handwriting segmentation pipeline, CNN-Transformers, doctor-adaptive loops)
4. **Chirag Lamba** — Integration Lead (Formulary SKU matching, security audit controls, testing pipelines)
