import { API_BASE_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

async function getToken() {
  return await SecureStore.getItemAsync('auth_token');
}

async function request(method, endpoint, body = null) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }
  return response.json();
}

export const api = {
  // Auth
  register: (data) => request('POST', '/auth/register', data),
  login: (data) => request('POST', '/auth/login', data),
  getMe: () => request('GET', '/auth/me'),
  updateProfile: (data) => request('PUT', '/auth/profile', data),

  // AI
  analyzeLabReport: (data) => request('POST', '/ai/analyze-lab', data),
  getLabReports: () => request('GET', '/ai/lab-reports'),
  chat: (data) => request('POST', '/ai/chat', data),
  parsePrescription: (data) => request('POST', '/ai/parse-prescription', data),
  analyzeFamily: (data) => request('POST', '/ai/analyze-family', data),
  analyzeCycle: (data) => request('POST', '/ai/analyze-cycle', data),

  // Family
  getFamilyMembers: () => request('GET', '/family/members'),
  addFamilyMember: (data) => request('POST', '/family/members', data),
  deleteFamilyMember: (id) => request('DELETE', `/family/members/${id}`),

  // Reminders
  getReminders: () => request('GET', '/reminders/'),
  addReminder: (data) => request('POST', '/reminders/', data),
  deleteReminder: (id) => request('DELETE', `/reminders/${id}`),
  logAdherence: (data) => request('POST', '/reminders/log', data),

  // Tracker
  getCycles: () => request('GET', '/tracker/cycles'),
  logCycle: (data) => request('POST', '/tracker/cycles', data),
  deleteCycle: (id) => request('DELETE', `/tracker/cycles/${id}`),
};
