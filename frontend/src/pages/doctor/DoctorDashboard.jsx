import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, Chip, Button, Divider, Switch, FormControlLabel
} from '@mui/material'
import {
  CalendarMonth, CheckCircle, People, AttachMoney,
  Today, AccessTime, Pending, ArrowForward
} from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import StatCard from '../../components/common/StatCard'
import { analyticsAPI, appointmentsAPI, doctorsAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const weekData = [
    { day: 'Mon', patients: 8 }, { day: 'Tue', patients: 12 }, { day: 'Wed', patients: 6 },
    { day: 'Thu', patients: 15 }, { day: 'Fri', patients: 10 }, { day: 'Sat', patients: 4 }, { day: 'Sun', patients: 0 },
  ]

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, aptsRes, profileRes] = await Promise.all([
          analyticsAPI.doctorDashboard(),
          appointmentsAPI.list({ per_page: 8 }),
          doctorsAPI.myProfile(),
        ])
        setStats(statsRes.data)
        setAppointments(aptsRes.data)
        setDoctorProfile(profileRes.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAvailabilityToggle = async (e) => {
    if (!doctorProfile) return
    try {
      await doctorsAPI.toggleAvailability(doctorProfile.id, e.target.checked)
      setDoctorProfile(prev => ({ ...prev, is_available: e.target.checked }))
      toast.success(e.target.checked ? 'You are now accepting appointments' : 'You are now unavailable')
    } catch {
      toast.error('Failed to update availability')
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayApts = appointments.filter(a => a.appointment_date === today)
  const pendingApts = appointments.filter(a => a.status === 'pending')

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Doctor Workspace
          </Typography>
          <Typography color="text.secondary">
            Dr. {user?.first_name} {user?.last_name} · {doctorProfile?.specialization?.name}
          </Typography>
        </Box>
        {doctorProfile && (
          <FormControlLabel
            control={
              <Switch
                checked={doctorProfile.is_available}
                onChange={handleAvailabilityToggle}
                color="success"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: doctorProfile.is_available ? 'success.main' : 'error.main' }} />
                <Typography variant="body2" fontWeight={600}>
                  {doctorProfile.is_available ? 'Accepting Appointments' : 'Not Available'}
                </Typography>
              </Box>
            }
          />
        )}
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: "Today's Appointments", value: stats?.today_appointments, icon: <Today sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #0891b2, #0e7490)' },
          { title: 'Pending Requests', value: stats?.pending_requests, icon: <Pending sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
          { title: 'Completed Today', value: stats?.completed_today, icon: <CheckCircle sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
          { title: 'Total Patients', value: stats?.total_patients, icon: <People sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
          { title: 'Monthly Earnings', value: `₹${((stats?.monthly_earnings || 0) / 1000).toFixed(1)}K`, icon: <AttachMoney sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
        ].map((card, i) => (
          <Grid item xs={6} sm={4} md key={card.title}>
            <StatCard {...card} index={i} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Today's queue */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Today's Queue</Typography>
                <Chip label={`${todayApts.length} patients`} size="small" color="primary" />
              </Box>
              {todayApts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CalendarMonth sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">No appointments today</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {todayApts.map((apt, i) => (
                    <React.Fragment key={apt.id}>
                      {i > 0 && <Divider sx={{ my: 1 }} />}
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
                            {apt.patient?.user?.first_name?.[0]}{apt.patient?.user?.last_name?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{apt.patient?.user?.first_name} {apt.patient?.user?.last_name}</Typography>}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.2 }}>
                              <AccessTime sx={{ fontSize: 11, color: 'text.secondary' }} />
                              <Typography variant="caption">{apt.start_time?.slice(0, 5)}</Typography>
                            </Box>
                          }
                        />
                        <Chip label={apt.status} size="small" className={`status-${apt.status}`} sx={{ fontSize: '0.65rem', fontWeight: 600 }} />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Pending requests */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Pending Requests</Typography>
                {pendingApts.length > 0 && <Chip label={pendingApts.length} size="small" color="warning" />}
              </Box>
              {pendingApts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.light', mb: 1 }} />
                  <Typography color="text.secondary" variant="body2">All caught up!</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {pendingApts.slice(0, 4).map((apt, i) => (
                    <React.Fragment key={apt.id}>
                      {i > 0 && <Divider sx={{ my: 0.5 }} />}
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{apt.patient?.user?.first_name} {apt.patient?.user?.last_name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{apt.appointment_date} · {apt.start_time?.slice(0, 5)}</Typography>}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ minWidth: 0, px: 1, py: 0.3, fontSize: '0.7rem' }}
                            onClick={async () => {
                              const { appointmentsAPI } = await import('../../services/api')
                              await appointmentsAPI.update(apt.id, { status: 'confirmed' })
                              setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'confirmed' } : a))
                              toast.success('Appointment confirmed')
                            }}
                          >✓</Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            sx={{ minWidth: 0, px: 1, py: 0.3, fontSize: '0.7rem' }}
                            onClick={async () => {
                              const { appointmentsAPI } = await import('../../services/api')
                              await appointmentsAPI.update(apt.id, { status: 'cancelled', cancelled_by: 'doctor' })
                              setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, status: 'cancelled' } : a))
                              toast.success('Appointment declined')
                            }}
                          >✗</Button>
                        </Box>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Button fullWidth variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate('/appointments')}>
                View All Appointments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly chart */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Weekly Patients</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="patients" fill="#0891b2" radius={[4, 4, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
