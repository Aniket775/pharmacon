import { api } from '../api/client';

const SUPABASE_URL = 'https://gvlidgvvwpdhocyjigfr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uJRb1N_Tk6hDIJcqTIi3lg_XCX51eY_';

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
];

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

// Direct HTTPS helper for Supabase REST API
async function supabaseRest<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      console.warn(`Supabase REST error on ${path}:`, res.status, res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`Supabase network error on ${path}:`, err);
    return null;
  }
}

// ─── Data Access Layer ─────────────────────────────────────────────────

export const storageService = {
  async getVersions(): Promise<PresentationVersion[]> {
    // 1. Try Supabase cloud
    const cloudVersions = await supabaseRest<PresentationVersion[]>('versions?select=*&order=created_at.desc');
    if (cloudVersions && cloudVersions.length > 0) {
      setLocalStore(STORAGE_KEYS.VERSIONS, cloudVersions);
      return cloudVersions;
    }

    // 2. Try local API
    try {
      const apiRes = await api.get<{ versions: any[] }>('/versions');
      if (apiRes.versions && apiRes.versions.length > 0) {
        return apiRes.versions as PresentationVersion[];
      }
    } catch (e) {}

    // 3. Fallback Local Storage
    return getLocalStore(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
  },

  async publishVersion(version: Omit<PresentationVersion, 'id'> & { id?: string }): Promise<PresentationVersion> {
    const newVersion: PresentationVersion = {
      id: version.id || `v${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      ...version,
    };

    // 1. Persist to Supabase cloud
    await supabaseRest('versions', {
      method: 'POST',
      body: JSON.stringify(newVersion),
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    });

    // 2. Persist to Express API backend
    try {
      await api.post('/versions', newVersion);
    } catch (err) {}

    // 3. Update localStorage
    const current = getLocalStore<PresentationVersion>(STORAGE_KEYS.VERSIONS, INITIAL_VERSIONS);
    const updated = current.map(v => v.status === 'current' && newVersion.status === 'current' ? { ...v, status: 'archived' as const } : v);
    const result = [newVersion, ...updated];
    setLocalStore(STORAGE_KEYS.VERSIONS, result);
    return newVersion;
  },

  async getDeliverables(): Promise<DeliverableItem[]> {
    const cloudDelivs = await supabaseRest<DeliverableItem[]>('deliverables?select=*&order=created_at.desc');
    if (cloudDelivs && cloudDelivs.length > 0) {
      setLocalStore(STORAGE_KEYS.DELIVERABLES, cloudDelivs);
      return cloudDelivs;
    }

    try {
      const apiRes = await api.get<{ deliverables: any[] }>('/deliverables');
      if (apiRes.deliverables && apiRes.deliverables.length > 0) {
        return apiRes.deliverables as DeliverableItem[];
      }
    } catch (e) {}

    return getLocalStore(STORAGE_KEYS.DELIVERABLES, INITIAL_DELIVERABLES);
  },

  async publishDeliverable(item: Omit<DeliverableItem, 'id'> & { id?: string }): Promise<DeliverableItem> {
    const newItem: DeliverableItem = {
      id: item.id || `deliv-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      ...item,
    };

    await supabaseRest('deliverables', {
      method: 'POST',
      body: JSON.stringify(newItem),
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    });

    try {
      await api.post('/deliverables', newItem);
    } catch (err) {}

    const current = getLocalStore<DeliverableItem>(STORAGE_KEYS.DELIVERABLES, INITIAL_DELIVERABLES);
    const result = [newItem, ...current];
    setLocalStore(STORAGE_KEYS.DELIVERABLES, result);
    return newItem;
  },

  async uploadFileToStorage(file: File): Promise<{ fileName: string; fileUrl: string; size: number }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          fileName: file.name,
          fileUrl: reader.result as string,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    });
  },

  async getTeamMembers(): Promise<any[]> {
    // 1. Direct Supabase cloud fetch
    const cloudMembers = await supabaseRest<any[]>('team_members?select=*&order=id.asc');
    if (cloudMembers && cloudMembers.length > 0) {
      localStorage.setItem('pharmacon_team_members', JSON.stringify(cloudMembers));
      return cloudMembers;
    }

    // 2. Try Express API
    try {
      const apiRes = await api.get<{ members: any[] }>('/team');
      if (apiRes.members && apiRes.members.length > 0) {
        return apiRes.members;
      }
    } catch (e) {}

    const cached = localStorage.getItem('pharmacon_team_members');
    return cached ? JSON.parse(cached) : [];
  },

  async updateTeamMember(memberId: string, memberData: any): Promise<void> {
    // 1. Direct Supabase cloud upsert
    await supabaseRest('team_members', {
      method: 'POST',
      body: JSON.stringify({ id: memberId, ...memberData }),
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
    });

    // 2. Express API
    try {
      await api.put(`/team/${memberId}`, memberData);
    } catch (err) {}
  },
};
