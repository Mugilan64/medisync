import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, Button, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, Chip, Divider, Skeleton
} from '@mui/material'
import {
  CalendarMonth, CheckCircle, Cancel, MedicalServices,
  ArrowForward, PersonSearch, Today, AccessTime
} from '@mui/icons-material'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'
import StatCard from '../../components/common/StatCard'
import { analyticsAPI, appointmentsAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import dayjs from 'dayjs'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, aptsRes] = await Promise.all([
          analyticsAPI.patientDashboard(),
          appointmentsAPI.list({ per_page: 5 }),
        ])
        setStats(statsRes.data)
        setAppointments(aptsRes.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const recent = appointments.slice(0, 4)

  const trendData = [
    { month: 'Jan', appointments: 1 },
    { month: 'Feb', appointments: 2 },
    { month: 'Mar', appointments: 1 },
    { month: 'Apr', appointments: 3 },
    { month: 'May', appointments: 2 },
    { month: 'Jun', appointments: stats?.total_consultations || 4 },
  ]

  return (
    <Box>
      {/* Welcome */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
          Good {dayjs().hour() < 12 ? 'morning' : dayjs().hour() < 17 ? 'afternoon' : 'evening'}, {user?.first_name}!
        </Typography>
        <Typography color="text.secondary">Here's your health overview for today.</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: 'Upcoming', value: stats?.upcoming_appointments, icon: <CalendarMonth sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #0891b2, #0e7490)' },
          { title: 'Completed', value: stats?.completed_appointments, icon: <CheckCircle sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #10b981, #059669)' },
          { title: 'Cancelled', value: stats?.cancelled_appointments, icon: <Cancel sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
          { title: 'Total Consultations', value: stats?.total_consultations, icon: <MedicalServices sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
        ].map((card, i) => (
          <Grid item xs={6} sm={3} key={card.title}>
            <StatCard {...card} index={i} loading={loading} />
          </Grid>
        ))}
      </Grid>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card sx={{ mb: 2.5, background: 'linear-gradient(135deg, #0891b2 0%, #4f46e5 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>Need a consultation?</Typography>
              <Typography sx={{ opacity: 0.8, fontSize: '0.875rem' }}>Browse 500+ certified doctors across all specialties</Typography>
            </Box>
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/doctors')}
              sx={{ background: 'rgba(255,255,255,0.2)', '&:hover': { background: 'rgba(255,255,255,0.3)' }, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Find Doctors
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2.5}>
        {/* Recent appointments */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Recent Appointments</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/appointments')}>View all</Button>
              </Box>
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} height={60} sx={{ mb: 1, borderRadius: 2 }} />)
              ) : recent.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <CalendarMonth sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                  <Typography color="text.secondary">No appointments yet</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/doctors')}>Book your first appointment</Button>
                </Box>
              ) : (
                <List disablePadding>
                  {recent.map((apt, i) => (
                    <React.Fragment key={apt.id}>
                      {i > 0 && <Divider sx={{ my: 1 }} />}
                      <ListItem
                        disablePadding
                        sx={{ py: 1, cursor: 'pointer', borderRadius: 2, px: 1, '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate(`/appointments/${apt.id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ background: 'linear-gradient(135deg, #0891b2, #4f46e5)', width: 40, height: 40, fontSize: '0.85rem' }}>
                            {apt.doctor?.user?.first_name?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              Dr. {apt.doctor?.user?.first_name} {apt.doctor?.user?.last_name}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
                              <Today sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption">{apt.appointment_date}</Typography>
                              <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="caption">{apt.start_time?.slice(0, 5)}</Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={apt.status}
                          size="small"
                          className={`status-${apt.status}`}
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Trend chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Consultation Trend</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>This year</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="aptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="appointments" stroke="#0891b2" fill="url(#aptGrad)" strokeWidth={2.5} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
