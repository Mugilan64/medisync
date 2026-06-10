import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, IconButton, InputAdornment,
  Checkbox, FormControlLabel, Divider, CircularProgress, Alert, Chip
} from '@mui/material'
import { Visibility, VisibilityOff, MedicalServices, CheckCircle, ArrowForward } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { authAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const features = [
  'Book appointments with top doctors',
  'Real-time availability & instant confirmation',
  'Secure digital health records',
  'Video consultations from home',
]

const demoAccounts = [
  { label: 'Admin', email: 'admin@medisync.health', password: 'Admin@2024', color: '#ef4444' },
  { label: 'Doctor', email: 'dr.priya@medisync.health', password: 'Doctor@2024', color: '#0891b2' },
  { label: 'Patient', email: 'patient@medisync.health', password: 'Patient@2024', color: '#10b981' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.login(data)
      const { access_token, refresh_token, user } = res.data
      login(user, access_token, refresh_token)
      toast.success(`Welcome back, ${user.first_name}!`)
      const role = user.role?.name
      if (role === 'super_admin') navigate('/admin/dashboard')
      else if (role === 'doctor') navigate('/doctor/dashboard')
      else navigate('/patient/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setValue('email', account.email)
    setValue('password', account.password)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '50%',
        background: 'linear-gradient(145deg, #0a0f1e 0%, #0c1a2e 50%, #0e2240 100%)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <Box sx={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <Box sx={{ position: 'absolute', bottom: '20%', right: '5%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 3, background: 'linear-gradient(135deg, #0891b2, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(8,145,178,0.4)' }}>
              <MedicalServices sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>MediSync</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.65rem' }}>Healthcare Platform</Typography>
            </Box>
          </Box>

          <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.15, mb: 2, letterSpacing: '-0.03em' }}>
            Healthcare at your<br />
            <Box component="span" sx={{ background: 'linear-gradient(135deg, #22d3ee, #818cf8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              fingertips
            </Box>
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 5, fontSize: '1rem', lineHeight: 1.7 }}>
            Connect with certified doctors, manage appointments, and access your health records — all in one secure platform.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircle sx={{ color: '#22d3ee', fontSize: 18 }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{f}</Typography>
                </Box>
              </motion.div>
            ))}
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4, mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[['500+', 'Doctors'], ['50K+', 'Patients'], ['4.9★', 'Rating']].map(([num, label]) => (
              <Box key={label}>
                <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.4rem' }}>{num}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        </motion.div>
      </Box>

      {/* Right panel */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 3, md: 6 },
        background: (t) => t.palette.background.default,
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, letterSpacing: '-0.02em' }}>Welcome back</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>Sign in to your MediSync account</Typography>

          {/* Demo accounts */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Quick demo access:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {demoAccounts.map(acc => (
                <Chip
                  key={acc.label}
                  label={acc.label}
                  size="small"
                  onClick={() => fillDemo(acc)}
                  sx={{ cursor: 'pointer', borderColor: acc.color, color: acc.color, fontWeight: 600, '&:hover': { bgcolor: `${acc.color}15` } }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email address"
              type="email"
              fullWidth
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              {...register('password', { required: 'Password is required' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Remember me</Typography>} />
              <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />}
              sx={{ py: 1.5, fontSize: '1rem' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">New to MediSync?</Typography>
          </Divider>

          <Button
            component={Link}
            to="/register"
            variant="outlined"
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
          >
            Create an account
          </Button>
        </motion.div>
      </Box>
    </Box>
  )
}
