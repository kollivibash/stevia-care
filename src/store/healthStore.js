import { create } from 'zustand';

const API = 'https://healthpilot-pz8o.onrender.com/api/v1';

let syncTimer = null;

// Token is passed directly — no circular dependency
const syncToBackend = async (state, token) => {
  if (!token || token === 'demo_token') return;
  try {
    const res = await fetch(`${API}/data/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        familyMembers: state.familyMembers,
        reminders:     state.reminders,
        labReports:    state.labReports,
        periodCycles:  state.periodCycles,
        vitalsLog:     state.vitalsLog,
        isPremium:     state.isPremium,
      }),
    });
    if (res.ok) {
      console.log('[SYNC] ✅ Saved to MongoDB');
    } else {
      const err = await res.text();
      console.log('[SYNC] ❌ Failed:', res.status, err);
    }
  } catch (e) {
    console.log('[SYNC] ❌ Network error:', e.message);
  }
};

export const useHealthStore = create((set, get) => ({

  familyMembers: [],
  reminders:     [],
  labReports:    [],
  periodCycles:  [],
  vitalsLog:     [],
  isPremium:     false,
  isSyncing:     false,
  lastSynced:    null,
  adherenceLogs: [],

  // ── Called from RootNavigator with explicit token ─────────────────────
  loadFromBackend: async (token) => {
    if (!token || token === 'demo_token') return;
    set({ isSyncing: true });
    try {
      console.log('[LOAD] Fetching data from MongoDB...');
      const res = await fetch(`${API}/data/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('[LOAD] Status:', res.status);
      if (!res.ok) {
        const err = await res.text();
        console.log('[LOAD] ❌', err);
        set({ isSyncing: false });
        return;
      }
      const data = await res.json();
      console.log('[LOAD] ✅ family:', data.familyMembers?.length, 'reminders:', data.reminders?.length);
      set({
        familyMembers: data.familyMembers || [],
        reminders:     data.reminders     || [],
        labReports:    data.labReports    || [],
        periodCycles:  data.periodCycles  || [],
        vitalsLog:     data.vitalsLog     || [],
        isPremium:     data.isPremium     || false,
        lastSynced:    new Date().toISOString(),
        isSyncing:     false,
      });
    } catch (e) {
      console.log('[LOAD] ❌ Error:', e.message);
      set({ isSyncing: false });
    }
  },

  clearData: () => {
    if (syncTimer) clearTimeout(syncTimer);
    set({ familyMembers:[], reminders:[], labReports:[], periodCycles:[], vitalsLog:[], isPremium:false, lastSynced:null });
  },

  // ── All mutations take token directly ────────────────────────────────
  addFamilyMember: (m, token) => {
    set(s => ({ familyMembers: [...s.familyMembers, { ...m, id: `mem_${Date.now()}` }] }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  updateFamilyMember: (id, u, token) => {
    set(s => ({ familyMembers: s.familyMembers.map(m => m.id === id ? { ...m, ...u } : m) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  removeFamilyMember: (id, token) => {
    set(s => ({ familyMembers: s.familyMembers.filter(m => m.id !== id) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },

  addReminder: (r, token) => {
    set(s => ({ reminders: [...s.reminders, { ...r, id: `rem_${Date.now()}` }] }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  updateReminder: (id, u, token) => {
    set(s => ({ reminders: s.reminders.map(r => r.id === id ? { ...r, ...u } : r) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  deleteReminder: (id, token) => {
    set(s => ({ reminders: s.reminders.filter(r => r.id !== id) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },

  addLabReport: (r, token) => {
    set(s => ({ labReports: [{ ...r, id: `rep_${Date.now()}`, uploadedAt: new Date().toISOString() }, ...s.labReports] }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  removeLabReport: (id, token) => {
    set(s => ({ labReports: s.labReports.filter((r, i) => (r.id || `idx_${i}`) !== id && i !== id) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },

  addPeriodCycle: (c, token) => {
    set(s => ({ periodCycles: [{ ...c, id: `c_${Date.now()}` }, ...s.periodCycles] }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  updatePeriodCycle: (id, u, token) => {
    set(s => ({ periodCycles: s.periodCycles.map(c => c.id === id ? { ...c, ...u } : c) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  deletePeriodCycle: (id, token) => {
    set(s => ({ periodCycles: s.periodCycles.filter(c => c.id !== id) }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },

  addVitalsEntry: (entry, token) => {
    set(s => ({ vitalsLog: [{ ...entry, id: `v_${Date.now()}` }, ...s.vitalsLog] }));
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
  clearVitalsLog: (token) => {
    set({ vitalsLog: [] });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },

  logAdherence: (l) => {
    set(s => ({ adherenceLogs: [{ ...l, id: `adh_${Date.now()}`, loggedAt: new Date().toISOString() }, ...s.adherenceLogs] }));
  },

  setPremium: (val, token) => {
    set({ isPremium: val });
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncToBackend(get(), token), 1500);
  },
}));
