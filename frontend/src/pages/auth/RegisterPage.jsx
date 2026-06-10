import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Typography, TextField, Button, Stepper, Step, StepLabel,
  MenuItem, CircularProgress, Alert, Paper, LinearProgress
} from '@mui/material'
import { ArrowBack, ArrowForward, CheckCircle, MedicalServices } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const steps = ['Personal Details', 'Contact Info', 'Security', 'Review']

export default function RegisterPage() {
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({})

  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm({ defaultValues: formData })
  const password = watch('password')

  const stepFields = [
    ['first_name', 'last_name', 'role'],
    ['phone'],
    ['password', 'confirm_password'],
  ]

  const handleNext = async () => {
    const fields = stepFields[activeStep]
    if (fields) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    setActiveStep(prev => prev + 1)
  }

  const onSubmit = async (data) => {
    if (data.password !== data.confirm_password) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authAPI.register({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role || 'patient',
      })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const StepContent = ({ step }) => {
    if (step === 0) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="First Name" fullWidth {...register('first_name', { required: 'Required' })} error={!!errors.first_name} helperText={errors.first_name?.message} />
          <TextField label="Last Name" fullWidth {...register('last_name', { required: 'Required' })} error={!!errors.last_name} helperText={errors.last_name?.message} />
        </Box>
        <TextField label="Email Address" type="email" fullWidth {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} error={!!errors.email} helperText={errors.email?.message} />
        <TextField label="Register as" select fullWidth defaultValue="patient" {...register('role')}>
          <MenuItem value="patient">Patient</MenuItem>
          <MenuItem value="doctor">Doctor</MenuItem>
        </TextField>
      </Box>
    )

    if (step === 1) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Phone Number" fullWidth {...register('phone')} placeholder="+91 98765 43210" />
        <TextField label="City" fullWidth {...register('city')} />
        <TextField label="State" fullWidth {...register('state')} />
      </Box>
    )

    if (step === 2) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Password"
          type="password"
          fullWidth
          {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          {...register('confirm_password', {
            required: 'Required',
            validate: v => v === password || 'Passwords do not match',
          })}
          error={!!errors.confirm_password}
          helperText={errors.confirm_password?.message}
        />
      </Box>
    )

    if (step === 3) return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <CheckCircle sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>Almost there!</Typography>
        <Typography color="text.secondary">Review your information and create your account. You can always update your profile later.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, background: (t) => t.palette.background.default }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: 'linear-gradient(135deg, #0891b2, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MedicalServices sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Typography variant="h5" fontWeight={800}>MediSync</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700}>Create your account</Typography>
          <Typography color="text.secondary" variant="body2">Join thousands of patients and doctors</Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          {/* Progress */}
          <LinearProgress
            variant="determinate"
            value={(activeStep / (steps.length - 1)) * 100}
            sx={{ mb: 3, height: 4, borderRadius: 2 }}
          />

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem' } }}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div key={activeStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepContent step={activeStep} />
              </motion.div>
            </AnimatePresence>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              {activeStep > 0 && (
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => setActiveStep(p => p - 1)} sx={{ flex: 1 }}>
                  Back
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext} sx={{ flex: 1 }}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" variant="contained" disabled={loading} endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />} sx={{ flex: 1 }}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              )}
            </Box>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0891b2', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  )
}
