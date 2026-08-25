# 🌿 Pharmacon — UCS503 Software Engineering Project

> **Connecting Handwritten Prescriptions to Connected Care with Doctor-Specific Adaptation**  
> *Course: UCS503 · Thapar Institute of Engineering & Technology (TIET)*  
> *Supervisor: Sukhpal Singh (Computer Science Department)*

---

## 🎨 Design & Aesthetic Theme
The web application is designed following the **Pomegranate Health** (Awwwards / Wondermake) editorial aesthetic:
- **Palette**: Warm cream canvas (`#FAF8F5`, `#F5EFE6`), rich terracotta & pomegranate accents (`#E04828`), herbal sage highlights (`#3B6E55`), and deep charcoal typography.
- **Components**: Pill-shaped badges, rounded card containers, tactile micro-animations, slide deck presentation mode, and interactive Gantt scheduling.

---

## 🚀 Live Demonstration Flow (UCS503 Compliance)

During your evaluation presentation, perform the following 7 steps directly from the browser:

1. **Step 1: Open Website in a Clean Browser Session**
   - Open your hosted URL (or `http://localhost:4173` locally).
2. **Step 2: Homepage & Planning Presentation v1**
   - Review the **Homepage**: Team introduction, members & assigned roles, project scope, and end-to-end workflow.
   - Click **"Launch Planning Presentation v1"** (`/#/presentation/v1`).
   - Deliver your presentation directly from the web browser using slide mode or full document view.
   - Show the **8 required sections** including the interactive **Gantt Chart**.
3. **Step 3: Sign In to Instructor/Admin Interface**
   - Click **"Admin Upload"** or **"Sign In"** (`/#/login`).
   - Sign in using `instructor` (password: `demo`) or `admin` (password: `demo`).
4. **Step 4: Upload File/Folder Attachment**
   - Navigate to the **Admin Upload & Publish Portal** (`/#/admin/publish`).
   - Drag and drop a presentation file (`.pptx`, `.pdf`, `.zip`, etc.) into the dropzone.
5. **Step 5: Enter Metadata**
   - Enter **Deliverable Title** (e.g. `Planning Presentation v2 - Revised Scope`).
   - Enter **Presentation Version** (e.g. `Planning V2.0`).
   - Enter **Date**, **Authors**, and **Change Summary**.
6. **Step 6: Publish to Permanent Page**
   - Click **"Publish Deliverable to Permanent Page"**.
   - Click **"Open Permanent Deliverable Page"** to show the live permanent URL (`/#/deliverable/...`).
7. **Step 7: Verify Historical Version Accessibility**
   - Navigate to **Version History** (`/#/versions`) and **Planning Presentation v1** (`/#/presentation/v1`).
   - Confirm that older versions are intact and have not been removed or overwritten.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite SPA.
- **Hosting / Deployment**: GitHub Pages (`.github/workflows/deploy.yml` included).
- **Backend & Database**: Supabase PostgreSQL (or local Express API).
- **Object Storage**: Supabase S3-Compatible Storage Bucket (`presentations`).

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev:client
```
Visit `http://localhost:4173` (or port specified in terminal).

### 3. Build & Preview Production Bundle
```bash
npm run build
npm run preview
```

---

## ☁️ Deployment Instructions

### 1. GitHub Pages (Frontend)
1. Push your repository to GitHub (`main` or `master` branch).
2. Go to your GitHub repository **Settings** → **Pages**.
3. Under **Build and deployment**, select **Source: GitHub Actions**.
4. The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) will automatically build and deploy the website to your public `https://<username>.github.io/<repo>` URL.

### 2. Supabase Setup (Backend & S3 Storage)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase project dashboard.
3. Open and run the contents of [`supabase_schema.sql`](supabase_schema.sql). This will create:
   - `versions` table
   - `deliverables` table
   - `team_members` table
   - `presentations` public storage bucket and access policies
4. In your GitHub repository **Settings** → **Secrets and variables** → **Actions**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anonymous API key
*(Note: If no Supabase keys are provided, Pharmacon runs in resilient client-side storage mode with local persistence).*

---

## 👥 Team & Roles

| Member | Role | Focus Area |
| :--- | :--- | :--- |
| **Aryan Sharma** | Frontend Lead & UI/UX | Pomegranate design system, React component architecture, and patient experience. |
| **Aniket Raj** | Backend & Storage Lead | API microservices, Supabase integration, S3 object storage, and version history. |
| **Amitesh Kumar Singh** | AI / CV Engineer | Doctor handwriting adaptation, character recognition model, and confidence thresholds. |
| **Chirag Lamba** | Integration & QA Lead | End-to-end testing, GitHub Actions deployment pipelines, and formulary sync. |
