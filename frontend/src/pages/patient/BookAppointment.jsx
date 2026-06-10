import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Card, CardContent, Grid, Button, Avatar, Rating, Chip,
  CircularProgress, Alert, Stepper, Step, StepLabel, TextField, Divider
} from '@mui/material'
import { CalendarMonth, AccessTime, CheckCircle, ArrowBack, ArrowForward, Payment } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorsAPI, appointmentsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const steps = ['Select Date', 'Choose Time', 'Confirm & Pay']

export default function BookAppointment() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [reason, setReason] = useState('')
  const [aptType, setAptType] = useState('in_person')
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    doctorsAPI.get(doctorId).then(r => { setDoctor(r.data); setLoading(false) }).catch(() => navigate('/doctors'))
  }, [doctorId])

  const handleDateChange = async (date) => {
    setSelectedDate(date)
    setSelectedSlot('')
    setSlotsLoading(true)
    try {
      const res = await appointmentsAPI.getSlots(doctorId, date)
      setSlots(res.data.slots)
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBook = async () => {
    setBooking(true)
    setError('')
    try {
      const res = await appointmentsAPI.create({
        doctor_id: parseInt(doctorId),
        appointment_date: selectedDate,
        start_time: `${selectedSlot}:00`,
        appointment_type: aptType,
        reason_for_visit: reason,
      })
      toast.success(`Appointment ${res.data.appointment_number} booked successfully!`)
      navigate('/appointments')
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  // Generate next 14 days (skip Sundays if doctor unavailable)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = dayjs().add(i + 1, 'day')
    return { value: d.format('YYYY-MM-DD'), label: d.format('ddd, MMM D'), day: d.format('dddd') }
  })

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/doctors')} sx={{ mb: 1 }}>Back to Doctors</Button>
        <Typography variant="h4" fontWeight={800}>Book Appointment</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Doctor info sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0891b2, #4f46e5)', fontSize: '1.3rem', fontWeight: 700 }}>
                  {doctor?.user?.first_name?.[0]}{doctor?.user?.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Dr. {doctor?.user?.first_name} {doctor?.user?.last_name}</Typography>
                  <Typography color="primary.main" variant="body2" fontWeight={500}>{doctor?.specialization?.name}</Typography>
                  <Rating value={parseFloat(doctor?.rating) || 0} size="small" readOnly precision={0.5} />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Experience</Typography>
                  <Typography variant="body2" fontWeight={600}>{doctor?.experience_years} years</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Consultation Fee</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">₹{doctor?.consultation_fee}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Hospital</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right', maxWidth: '60%' }}>{doctor?.hospital?.name || '—'}</Typography>
                </Box>
              </Box>

              {selectedDate && selectedSlot && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Booking Summary</Typography>
                  <Box sx={{ bgcolor: 'primary.main', borderRadius: 2, p: 2, color: 'white' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <CalendarMonth fontSize="small" />
                      <Typography variant="body2">{selectedDate}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <AccessTime fontSize="small" />
                      <Typography variant="body2">{selectedSlot}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Booking wizard */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map(label => (
                  <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
              </Stepper>

              {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

              <AnimatePresence mode="wait">
                <motion.div key={activeStep} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>

                  {/* Step 1: Date */}
                  {activeStep === 0 && (
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>Select a Date</Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>Choose your preferred appointment date</Typography>
                      <Grid container spacing={1.5}>
                        {availableDates.map(d => (
                          <Grid item xs={6} sm={4} key={d.value}>
                            <Box
                              onClick={() => { setSelectedDate(d.value); handleDateChange(d.value) }}
                              sx={{
                                p: 2, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
                                border: '2px solid',
                                borderColor: selectedDate === d.value ? 'primary.main' : 'divider',
                                bgcolor: selectedDate === d.value ? 'primary.main' : 'transparent',
                                color: selectedDate === d.value ? 'white' : 'inherit',
                                transition: 'all 0.15s ease',
                                '&:hover': { borderColor: 'primary.main', bgcolor: selectedDate === d.value ? 'primary.main' : 'primary.light' },
                              }}
                            >
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>{d.day.slice(0, 3)}</Typography>
                              <Typography variant="subtitle1" fontWeight={700}>{dayjs(d.value).format('D')}</Typography>
                              <Typography variant="caption">{dayjs(d.value).format('MMM')}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Step 2: Time */}
                  {activeStep === 1 && (
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>Choose a Time Slot</Typography>
                      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>Available slots for {selectedDate}</Typography>
                      {slotsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                      ) : (
                        <Grid container spacing={1.5}>
                          {slots.map(slot => (
                            <Grid item xs={4} sm={3} key={slot.time}>
                              <Box
                                onClick={() => slot.available && setSelectedSlot(slot.time)}
                                sx={{
                                  p: 1.5, borderRadius: 2, textAlign: 'center', cursor: slot.available ? 'pointer' : 'not-allowed',
                                  border: '2px solid',
                                  borderColor: selectedSlot === slot.time ? 'primary.main' : slot.available ? 'divider' : 'transparent',
                                  bgcolor: selectedSlot === slot.time ? 'primary.main' : !slot.available ? 'action.disabledBackground' : 'transparent',
                                  color: selectedSlot === slot.time ? 'white' : !slot.available ? 'text.disabled' : 'inherit',
                                  opacity: slot.available ? 1 : 0.4,
                                  '&:hover': slot.available ? { borderColor: 'primary.main' } : {},
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <Typography variant="body2" fontWeight={600}>{slot.time}</Typography>
                                {!slot.available && <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>Booked</Typography>}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      )}

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>Appointment Type</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {['in_person', 'video', 'phone'].map(type => (
                            <Chip
                              key={type}
                              label={type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              onClick={() => setAptType(type)}
                              color={aptType === type ? 'primary' : 'default'}
                              variant={aptType === type ? 'filled' : 'outlined'}
                              sx={{ cursor: 'pointer', fontWeight: aptType === type ? 600 : 400 }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Step 3: Confirm */}
                  {activeStep === 2 && (
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>Confirm Booking</Typography>
                      <TextField
                        label="Reason for visit (optional)"
                        multiline
                        rows={3}
                        fullWidth
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="Describe your symptoms or reason for consultation..."
                        sx={{ mb: 3 }}
                      />

                      <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Payment Summary</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Consultation fee</Typography>
                          <Typography variant="body2">₹{doctor?.consultation_fee}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Platform fee</Typography>
                          <Typography variant="body2">₹0</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography fontWeight={700}>Total</Typography>
                          <Typography fontWeight={700} color="primary.main">₹{doctor?.consultation_fee}</Typography>
                        </Box>
                      </Card>

                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Payment is collected at the clinic. Your appointment will be confirmed after doctor approval.
                      </Alert>
                    </Box>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                {activeStep > 0 && (
                  <Button startIcon={<ArrowBack />} onClick={() => setActiveStep(p => p - 1)} variant="outlined">
                    Back
                  </Button>
                )}
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => setActiveStep(p => p + 1)}
                    disabled={(activeStep === 0 && !selectedDate) || (activeStep === 1 && !selectedSlot)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={booking ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                    onClick={handleBook}
                    disabled={booking}
                    sx={{ px: 3 }}
                  >
                    {booking ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
