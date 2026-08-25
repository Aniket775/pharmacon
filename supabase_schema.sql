-- ══════════════════════════════════════════════════════════════════════════
-- PHARMACON SUPABASE POSTGRESQL COMPLETE SCHEMA & POLICIES
-- Copy and run this in your Supabase SQL Editor (https://app.supabase.com)
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Create Versions Table
CREATE TABLE IF NOT EXISTS public.versions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  authors TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('current', 'archived', 'future', 'draft')),
  change_summary TEXT NOT NULL DEFAULT '',
  commit_ref TEXT DEFAULT '',
  deployment_url TEXT DEFAULT '',
  parent_version_id TEXT DEFAULT NULL,
  file_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Deliverables Table
CREATE TABLE IF NOT EXISTS public.deliverables (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  version_id TEXT REFERENCES public.versions(id) ON DELETE SET NULL,
  version_name TEXT DEFAULT '',
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'in-progress', 'published', 'archived')),
  description TEXT NOT NULL DEFAULT '',
  file_name TEXT DEFAULT NULL,
  file_url TEXT DEFAULT NULL,
  authors TEXT DEFAULT 'Team Pharmacon',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  focus TEXT NOT NULL,
  avatar TEXT NOT NULL,
  skills TEXT NOT NULL DEFAULT '',
  github_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id TEXT PRIMARY KEY,
  medicine TEXT NOT NULL,
  strength TEXT NOT NULL,
  dosage_form TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  pack_size TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'confirmed', 'dispensed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Prescription Fields Table
CREATE TABLE IF NOT EXISTS public.prescription_fields (
  id BIGSERIAL PRIMARY KEY,
  prescription_id TEXT REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  needs_verification INTEGER NOT NULL DEFAULT 0
);

-- 7. Create Refill Requests Table
CREATE TABLE IF NOT EXISTS public.refill_requests (
  id TEXT PRIMARY KEY,
  prescription_id TEXT REFERENCES public.prescriptions(id),
  patient_id TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  medicine TEXT NOT NULL,
  strength TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'info')),
  details TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Page Content Table (For live presentations & editable sections)
CREATE TABLE IF NOT EXISTS public.page_content (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(page, section)
);

-- 10. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE public.versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access for Versions" ON public.versions;
DROP POLICY IF EXISTS "Public Read Access for Deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Public Read Access for Team Members" ON public.team_members;
DROP POLICY IF EXISTS "Public Read Access for Inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Public Read Access for Prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Public Read Access for Refills" ON public.refill_requests;
DROP POLICY IF EXISTS "Public Read Access for Audit" ON public.audit_events;
DROP POLICY IF EXISTS "Public Read Access for Page Content" ON public.page_content;

DROP POLICY IF EXISTS "Allow All for Authenticated & Public Service" ON public.versions;
DROP POLICY IF EXISTS "Allow All for Deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Allow All for Team" ON public.team_members;
DROP POLICY IF EXISTS "Allow All for Inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Allow All for Prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Allow All for Refills" ON public.refill_requests;
DROP POLICY IF EXISTS "Allow All for Audit" ON public.audit_events;
DROP POLICY IF EXISTS "Allow All for Page Content" ON public.page_content;

CREATE POLICY "Public Read Access for Versions" ON public.versions FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Deliverables" ON public.deliverables FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Team Members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Inventory" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Prescriptions" ON public.prescriptions FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Refills" ON public.refill_requests FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Audit" ON public.audit_events FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Page Content" ON public.page_content FOR SELECT USING (true);

CREATE POLICY "Allow All for Authenticated & Public Service" ON public.versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Deliverables" ON public.deliverables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Team" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Inventory" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Refills" ON public.refill_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Audit" ON public.audit_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All for Page Content" ON public.page_content FOR ALL USING (true) WITH CHECK (true);

-- 11. Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('presentations', 'presentations', true),
  ('deliverables', 'deliverables', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload to Buckets" ON storage.objects;

CREATE POLICY "Public Access to Buckets" 
ON storage.objects FOR SELECT 
USING (bucket_id IN ('presentations', 'deliverables', 'avatars'));

CREATE POLICY "Allow Upload to Buckets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id IN ('presentations', 'deliverables', 'avatars'));

-- 12. Seed Core Team Members
INSERT INTO public.team_members (id, name, role, focus, avatar, skills, github_url, linkedin_url) VALUES
('T-001', 'Aryan Sharma', 'Frontend Lead', 'UI/UX architecture, responsive design system, tactile component library, and interactive presentations.', 'AS', 'React, Vite, TypeScript, Tailwind CSS, Recharts', 'https://github.com', 'https://linkedin.com'),
('T-002', 'Aniket Raj', 'Backend Lead', 'Express API development, database persistence, S3/Supabase storage integrations, and permanent version publishing engine.', 'AR', 'Node.js, Express, SQLite, PostgreSQL, Supabase, REST APIs', 'https://github.com', 'https://linkedin.com'),
('T-003', 'Amitesh Kumar Singh', 'AI / CV Engineer', 'Handwriting segmentation pipeline, CNN-Transformer feature models, and doctor-adaptive calibration loops.', 'AK', 'Python, PyTorch, Computer Vision, OCR, CNN-Transformers', 'https://github.com', 'https://linkedin.com'),
('T-004', 'Chirag Lamba', 'Integration Lead', 'Formulary SKU matching algorithms, security audit controls, end-to-end reliability verification, and CI/CD pipelines.', 'CL', 'CI/CD, GitHub Actions, System Integration, Testing, Security Audit', 'https://github.com', 'https://linkedin.com')
ON CONFLICT (id) DO UPDATE SET
  name = excluded.name,
  role = excluded.role,
  focus = excluded.focus,
  skills = excluded.skills;

-- 13. Seed Initial Deliverable Versions
INSERT INTO public.versions (id, name, date, authors, status, change_summary, commit_ref, deployment_url, file_url) VALUES
('v1.0.0', 'Planning Presentation v1', '2026-08-25', 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba', 'current', 'Initial project planning deliverable covering scope, intended users, system architecture, performance goals, technical risks, and interactive Gantt roadmap.', 'main@a89c42e', '#/presentation/v1', '/presentations/Pharmacon_Commitment_Pitch.pptx')
ON CONFLICT (id) DO NOTHING;

-- 14. Seed Initial Inventory Items
INSERT INTO public.inventory_items (id, medicine, strength, dosage_form, sku, pack_size, stock, reorder_level) VALUES
('INV-001', 'Amoxicillin', '500 mg', 'Capsule', 'AMX-500-CAP', '100 caps', 142, 25),
('INV-002', 'Metformin', '500 mg', 'Tablet', 'MET-500-TAB', '60 tabs', 18, 20),
('INV-003', 'Paracetamol', '650 mg', 'Tablet', 'PAR-650-TAB', '100 tabs', 240, 30),
('INV-004', 'Azithromycin', '500 mg', 'Tablet', 'AZI-500-TAB', '30 tabs', 8, 15)
ON CONFLICT (id) DO NOTHING;
