import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Avatar, Button
} from '@mui/material'
import {
  People, LocalHospital, CalendarMonth, AttachMoney,
  TrendingUp, Today, Assessment, Refresh
} from '@mui/icons-material'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { motion } from 'framer-motion'
import StatCard from '../../components/common/StatCard'
import { analyticsAPI, appointmentsAPI } from '../../services/api'

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
  no_show: '#6b7280',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [trend, setTrend] = useState([])
  const [distribution, setDistribution] = useState([])
  const [recentApts, setRecentApts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [statsRes, trendRes, distRes, aptsRes] = await Promise.all([
        analyticsAPI.adminDashboard(),
        analyticsAPI.adminMonthlyTrend(),
        analyticsAPI.adminStatusDist(),
        appointmentsAPI.list({ per_page: 8 }),
      ])
      setStats(statsRes.data)
      setTrend(trendRes.data.data)
      setDistribution(distRes.data.data.filter(d => d.count > 0))
      setRecentApts(aptsRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const statCards = stats ? [
    { title: 'Total Patients', value: stats.total_patients, icon: <People sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #0891b2, #0e7490)', trend: 12 },
    { title: 'Total Doctors', value: stats.total_doctors, icon: <LocalHospital sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)', trend: 5 },
    { title: 'Total Appointments', value: stats.total_appointments, icon: <CalendarMonth sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #10b981, #059669)', trend: 18 },
    { title: 'Monthly Revenue', value: `₹${(stats.monthly_revenue / 1000).toFixed(1)}K`, icon: <AttachMoney sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', trend: 24 },
    { title: "Today's Bookings", value: stats.today_appointments, icon: <Today sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', trend: 8 },
    { title: 'Completed', value: stats.completed_appointments, icon: <Assessment sx={{ color: 'white', fontSize: 22 }} />, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', trend: 15 },
  ] : []

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Overview of your healthcare platform
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={load} variant="outlined" size="small">
          Refresh
        </Button>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {loading ? Array(6).fill(0).map((_, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <Box sx={{ height: 130, borderRadius: 3, bgcolor: 'action.hover', animation: 'pulse 1.5s infinite' }} />
          </Grid>
        )) : statCards.map((card, i) => (
          <Grid item xs={6} sm={4} md={2} key={card.title}>
            <StatCard {...card} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {/* Trend chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Appointment & Revenue Trend</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Last 6 months</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorApt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="appointments" stroke="#0891b2" fill="url(#colorApt)" strokeWidth={2} name="Appointments" dot={{ r: 4 }} />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#4f46e5" fill="url(#colorRev)" strokeWidth={2} name="Revenue (₹)" dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Status distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Appointment Status</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>All time distribution</Typography>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" nameKey="status" paddingAngle={3}>
                  {distribution.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n.charAt(0).toUpperCase() + n.slice(1)]} contentStyle={{ borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {distribution.map(d => (
                <Box key={d.status} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_COLORS[d.status] }} />
                  <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{d.status} ({d.count})</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Recent appointments */}
      <Card>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Appointments</Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  {['Appointment #', 'Patient', 'Doctor', 'Date', 'Type', 'Status', 'Fee'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentApts.map(apt => (
                  <TableRow key={apt.id} hover>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: 'primary.main' }}>{apt.appointment_number}</TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      {apt.patient?.user?.first_name} {apt.patient?.user?.last_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>
                      Dr. {apt.doctor?.user?.first_name} {apt.doctor?.user?.last_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem' }}>{apt.appointment_date}</TableCell>
                    <TableCell>
                      <Chip label={apt.appointment_type} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={apt.status}
                        size="small"
                        className={`status-${apt.status}`}
                        sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {apt.fee_amount ? `₹${apt.fee_amount}` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {recentApts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No appointments yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  )
}
