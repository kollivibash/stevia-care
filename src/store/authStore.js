import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const API = 'https://healthpilot-pz8o.onrender.com/api/v1';

const safeStr = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string') return val;
  return JSON.stringify(val);
};

const errMsg = (e) => {
  if (!e) return 'Something went wrong';
  if (typeof e === 'string') return e;
  if (e.message) return e.message;
  if (e.detail) return String(e.detail);
  return 'Something went wrong. Please try again.';
};

export const useAuthStore = create((set, get) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       true,
  error:           null,

  initialize: async () => {
    try {
      const token   = await SecureStore.getItemAsync('auth_token');
      const userStr = await SecureStore.getItemAsync('user_data');
      if (token && userStr) {
        set({ user: JSON.parse(userStr), token, isAuthenticated: true });
      }
    } catch (e) {
      console.log('Auth init error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(errMsg(data.detail || data));

      // ✅ Backend sends "token" not "access_token"
      const tokenStr = safeStr(data.token || data.access_token);
      const userStr  = safeStr(data.user);

      if (!tokenStr) throw new Error('No token received from server');

      await SecureStore.setItemAsync('auth_token', tokenStr);
      if (userStr) await SecureStore.setItemAsync('user_data', userStr);

      set({
        user:            data.user,
        token:           tokenStr,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      });
      return { success: true };
    } catch (e) {
      const msg = errMsg(e);
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password, age, gender) => {
    set({ isLoading: true, error: null });
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          age:    parseInt(age) || 25,
          gender,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(errMsg(data.detail || data));

      // ✅ Backend sends "token" not "access_token"
      const tokenStr = safeStr(data.token || data.access_token);
      const userStr  = safeStr(data.user);

      if (!tokenStr) throw new Error('No token received from server');

      await SecureStore.setItemAsync('auth_token', tokenStr);
      if (userStr) await SecureStore.setItemAsync('user_data', userStr);

      set({
        user:            data.user,
        token:           tokenStr,
        isAuthenticated: true,
        isLoading:       false,
        error:           null,
      });
      return { success: true };
    } catch (e) {
      const msg = errMsg(e);
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  demoLogin: () => {
    set({
      user: {
        id: 'demo_001', name: 'Guest User', age: 30,
        gender: 'male', email: 'guest@steviacare.in',
        conditions: '', medications: '', blood_group: '',
      },
      token:           'demo_token',
      isAuthenticated: true,
      isLoading:       false,
      error:           null,
    });
  },

  updateProfile: (updates) => {
    const user = { ...get().user, ...updates };
    set({ user });
    try { SecureStore.setItemAsync('user_data', JSON.stringify(user)); } catch (e) {}
  },

  clearError: () => set({ error: null }),

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
    } catch (e) {}
    set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
  },
}));
