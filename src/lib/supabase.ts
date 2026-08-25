import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { api } from '../api/client';

// Environment variables for Supabase (optional; graceful fallback provided)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface PresentationVersion {
  id: string;
  name: string;
  date: string;
  authors: string;
  status: 'current' | 'archived' | 'future' | 'draft';
  change_summary: string;
  commit_ref?: string;
  deployment_url?: string;
  parent_version_id?: string | null;
  file_url?: string;
  created_at?: string;
}

export interface DeliverableItem {
  id: string;
  title: string;
  type: string;
  version_id?: string;
  version_name?: string;
  date: string;
  status: 'draft' | 'in-progress' | 'published' | 'archived';
  description: string;
  file_name?: string | null;
  file_url?: string | null;
  authors?: string;
  created_at?: string;
}

// ─── Default Initial Seed Data ──────────────────────────────────────────

const INITIAL_VERSIONS: PresentationVersion[] = [
  {
    id: 'v1.0.0',
    name: 'Planning Presentation v1',
    date: '2026-08-25',
    authors: 'Aryan Sharma, Aniket Raj, Amitesh Kumar Singh, Chirag Lamba',
    status: 'current',
    change_summary: 'Initial project planning deliverable covering scope, intended users, system architecture, performance goals, technical risks, and interactive Gantt roadmap.',
    commit_ref: 'main@a89c42e',
    deployment_url: '#/presentation/v1',
    file_url: '/presentations/Pharmacon_Commitment_Pitch.pptx',
    created_at: new Date('2026-08-25T00:00:00Z').toISOString(),
  },
  {
    id: 'v2.0.0',
    name: 'Planning Presentation v2',
    date: '2026-09-10',
    authors: 'Team Pharmacon',
    status: 'future',
    change_summary: 'Refined scope addressing writer recruitment milestones, real clinic calibration workflows, and Supabase integration.',
    commit_ref: 'dev@f190b21',
    deployment_url: '#/presentation/v2',
    parent_version_id: 'v1.0.0',
    created_at: new Date('2026-09-10T00:00:00Z').toISOString(),
  },
];

const INITIAL_DELIVERABLES: DeliverableItem[] = [
  {
    id: 'deliv-v1-deck',
    title: 'Planning Presentation v1 (Interactive Web Deck)',
    type: 'Interactive Presentation',
    version_id: 'v1.0.0',
    version_name: 'Planning Presentation v1',
    date: '2026-08-25',
    status: 'published',
    description: 'Direct browser-delivered planning presentation satisfying all UCS503 requirements.',
    file_name: 'Pharmacon_Commitment_Pitch.pptx',
    file_url: '/presentations/Pharmacon_Commitment_Pitch.pptx',
    authors: 'Team Pharmacon (Aryan, Aniket, Amitesh, Chirag)',
  },
  {
    id: 'deliv-v2-deck',
    title: 'Planning Presentation v2 (Scope & Feedback Updates)',
    type: 'Interactive Presentation',
    version_id: 'v2.0.0',
    version_name: 'Planning Presentation v2',
    date: '2026-09-10',
    status: 'published',
    description: 'Updated planning deliverable incorporating instructor feedback and revised architecture.',
    file_name: 'Planning_V2_Updated.pptx',
    file_url: '',
    authors: 'Team Pharmacon',
  },
  {
    id: 'deliv-software-grid',
    title: 'UCS503 Software Grid & Architecture Stack',
    type: 'Technical Specification',
    version_id: 'v1.0.0',
    version_name: 'Planning Presentation v1',
    date: '2026-08-25',
    status: 'published',
    description: 'Full stack breakdown across Frontend (React/Vite/Tailwind), Backend (Node/Supabase), and Storage.',
    file_name: 'Software_Grid_Matrix.pdf',
    authors: 'Team Pharmacon',
  },
  {
    id: 'deliv-proto-demo',
    title: 'Prescription Digitisation Interactive Prototype',
    type: 'Live Prototype Demo',
    version_id: 'v1.0.0',
    version_name: 'Planning Presentation v1',
    date: '2026-08-25',
    status: 'in-progress',
    description: 'Working end-to-end prototype from prescription upload to doctor verification and inventory matching.',
    authors: 'Team Pharmacon',
  },
];

// ─── LocalStorage Key Helpers ──────────────────────────────────────────

const STORAGE_KEYS = {
  VERSIONS: 'pharmacon_versions_store',
  DELIVERABLES: 'pharmacon_deliverables_store',
  FILES: 'pharmacon_files_store',
};

function getLocalStore<T>(key: string, defaultVal: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function setLocalStore<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// ─── Data Access Layer ─────────────────────────────────────────────────

export const storageService = {
  async getVersions(): Promise<PresentationVersion[]> {
    // 1. Try local API first
    try {
      const apiRes = await api.get<{ versions: any[] }>('/versions');
      if (apiRes.versions && apiRes.versions.length > 0) {
        return apiRes.versions as PresentationVersion[];
      }
    } catch (e) {}

    // 2. Try Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('versions')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as PresentationVersion[];
      }
    }

    // 3. Fallback Local Storage
    return getLocalStore(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
  },

  async publishVersion(version: Omit<PresentationVersion, 'id'> & { id?: string }): Promise<PresentationVersion> {
    const newVersion: PresentationVersion = {
      id: version.id || `v${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      ...version,
    };

    // 1. Persist to Express API / SQLite backend
    try {
      await api.post('/versions', {
        id: newVersion.id,
        name: newVersion.name,
        date: newVersion.date,
        authors: newVersion.authors,
        status: newVersion.status,
        changeSummary: newVersion.change_summary,
        deploymentUrl: newVersion.deployment_url,
      });
    } catch (err) {
      console.warn('API version post fallback:', err);
    }

    // 2. Persist to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('versions').insert([newVersion]);
      } catch (err) {
        console.warn('Supabase version insert fallback:', err);
      }
    }

    // 3. Always update local storage for offline / static consistency
    const current = getLocalStore<PresentationVersion>(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
    const updated = current.map(v => v.status === 'current' && newVersion.status === 'current' ? { ...v, status: 'archived' as const } : v);
    const result = [newVersion, ...updated];
    setLocalStore(STORAGE_KEYS.VERSIONS, result);
    return newVersion;
  },

  async getDeliverables(): Promise<DeliverableItem[]> {
    try {
      const apiRes = await api.get<{ deliverables: any[] }>('/deliverables');
      if (apiRes.deliverables && apiRes.deliverables.length > 0) {
        return apiRes.deliverables as DeliverableItem[];
      }
    } catch (e) {}

    if (supabase) {
      const { data, error } = await supabase
        .from('deliverables')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as DeliverableItem[];
      }
    }
    return getLocalStore(STORAGE_KEYS.DELIVERABLES, INITIAL_DELIVERABLES);
  },

  async publishDeliverable(item: Omit<DeliverableItem, 'id'> & { id?: string }): Promise<DeliverableItem> {
    const newItem: DeliverableItem = {
      id: item.id || `deliv-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      ...item,
    };

    // 1. Persist to Express API / SQLite backend
    try {
      await api.post('/deliverables', {
        id: newItem.id,
        title: newItem.title,
        type: newItem.type,
        versionId: newItem.version_id,
        date: newItem.date,
        status: newItem.status,
        description: newItem.description,
        file_name: newItem.file_name,
      });
    } catch (err) {
      console.warn('API deliverable post fallback:', err);
    }

    // 2. Persist to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('deliverables').insert([newItem]);
      } catch (err) {
        console.warn('Supabase deliverable insert fallback:', err);
      }
    }

    // 3. Persist to localStorage
    const current = getLocalStore<DeliverableItem>(STORAGE_KEYS.DELIVERABLES, INITIAL_DELIVERABLES);
    const result = [newItem, ...current];
    setLocalStore(STORAGE_KEYS.DELIVERABLES, result);
    return newItem;
  },

  async uploadFileToStorage(file: File): Promise<{ fileName: string; fileUrl: string; size: number }> {
    if (supabase) {
      try {
        const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `uploads/${cleanName}`;

        const { data, error } = await supabase.storage
          .from('presentations')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from('presentations').getPublicUrl(filePath);
          return {
            fileName: file.name,
            fileUrl: pubData.publicUrl,
            size: file.size,
          };
        }
      } catch (err) {
        console.warn('Supabase storage upload error, using local data URL fallback:', err);
      }
    }

    // In-browser / static fallback: create object URL or simulate file upload
    return new Promise((resolve) => {
      const simulatedUrl = URL.createObjectURL(file);
      resolve({
        fileName: file.name,
        fileUrl: simulatedUrl,
        size: file.size,
      });
    });
  },
};
