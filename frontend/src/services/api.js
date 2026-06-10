import axios from 'axios'
import useAuthStore from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
        const { access_token } = res.data
        useAuthStore.getState().login(
          useAuthStore.getState().user,
          access_token,
          refreshToken
        )
        original.headers.Authorization = `Bearer ${access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Appointments
export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  list: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  get: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
  cancel: (id, data) => api.patch(`/appointments/${id}`, { ...data, status: 'cancelled' }),
  confirm: (id) => api.patch(`/appointments/${id}`, { status: 'confirmed' }),
  complete: (id) => api.patch(`/appointments/${id}`, { status: 'completed' }),
  addNotes: (id, data) => api.patch(`/appointments/${id}`, { consultation_notes: data.notes }),
  getSlots: (doctorId, date) => api.get(`/appointments/slots/${doctorId}`, { params: { appointment_date: date } }),
}

// Doctors
export const doctorsAPI = {
  list: (params) => api.get('/doctors', { params }),
  get: (id) => api.get(`/doctors/${id}`),
  specializations: () => api.get('/doctors/specializations'),
  myProfile: () => api.get('/doctors/me/profile'),
  toggleAvailability: (id, available) => api.patch(`/doctors/${id}/availability`, null, { params: { is_available: available } }),
}

// Analytics
export const analyticsAPI = {
  adminDashboard: () => api.get('/analytics/admin/dashboard'),
  adminMonthlyTrend: () => api.get('/analytics/admin/monthly-trend'),
  adminStatusDist: () => api.get('/analytics/admin/status-distribution'),
  patientDashboard: () => api.get('/analytics/patient/dashboard'),
  doctorDashboard: () => api.get('/analytics/doctor/dashboard'),
}

// Notifications
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  unreadCount: () => api.get('/notifications/unread-count'),
}

// Patients
export const patientsAPI = {
  me: () => api.get('/patients/me'),
  update: (data) => api.patch('/patients/me', data),
  list: () => api.get('/patients'),
}

export default api
