import React, { useState, useMemo } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { lightTheme, darkTheme } from './utils/theme'
import useAuthStore from './store/authStore'

// Layouts
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorSearch from './pages/patient/DoctorSearch'
import BookAppointment from './pages/patient/BookAppointment'
import AppointmentsList from './pages/shared/AppointmentsList'
import AppointmentDetail from './pages/shared/AppointmentDetail'
import ProfilePage from './pages/shared/ProfilePage'
import NotFoundPage from './pages/shared/NotFoundPage'

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role?.name)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuthStore()
  const role = user?.role?.name
  if (role === 'super_admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />
  return <Navigate to="/patient/dashboard" replace />
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const theme = useMemo(() => darkMode ? darkTheme : lightTheme, [darkMode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif' } }} />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

          <Route element={<ProtectedRoute><DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode} /></ProtectedRoute>}>
            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['super_admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor', 'super_admin']}><DoctorDashboard /></ProtectedRoute>} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={<ProtectedRoute roles={['patient', 'super_admin']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/doctors" element={<DoctorSearch />} />
            <Route path="/book/:doctorId" element={<ProtectedRoute roles={['patient', 'super_admin']}><BookAppointment /></ProtectedRoute>} />

            {/* Shared */}
            <Route path="/appointments" element={<AppointmentsList />} />
            <Route path="/appointments/:id" element={<AppointmentDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
