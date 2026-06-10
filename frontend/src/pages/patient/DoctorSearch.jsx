import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Typography, Grid, Card, CardContent, TextField, MenuItem,
  Button, Avatar, Rating, Chip, InputAdornment, Skeleton, Slider
} from '@mui/material'
import {
  Search, FilterList, LocationOn, WorkHistory, Star,
  CalendarMonth, Verified
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { doctorsAPI } from '../../services/api'

const GRADIENTS = [
  'linear-gradient(135deg, #0891b2, #22d3ee)',
  'linear-gradient(135deg, #4f46e5, #818cf8)',
  'linear-gradient(135deg, #10b981, #34d399)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #ef4444, #f87171)',
  'linear-gradient(135deg, #8b5cf6, #a78bfa)',
]

function DoctorCard({ doctor, index }) {
  const navigate = useNavigate()
  const grad = GRADIENTS[index % GRADIENTS.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      <Card sx={{ height: '100%', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 12px 30px rgba(0,0,0,0.12)' } }}>
        <CardContent sx={{ p: 2.5 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 60, height: 60, background: grad, fontSize: '1.2rem', fontWeight: 700, flexShrink: 0 }}>
              {doctor.user?.first_name?.[0]}{doctor.user?.last_name?.[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={700} noWrap>
                  Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                </Typography>
                <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
              </Box>
              <Typography variant="body2" color="primary.main" fontWeight={500} noWrap>
                {doctor.specialization?.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                <Rating value={parseFloat(doctor.rating) || 0} precision={0.5} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  {doctor.rating} ({doctor.total_reviews})
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <WorkHistory sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">{doctor.experience_years} years experience</Typography>
            </Box>
            {doctor.hospital && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" noWrap>{doctor.hospital.name}</Typography>
              </Box>
            )}
          </Box>

          {/* Languages */}
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {(doctor.languages || 'English').split(',').map(lang => (
              <Chip key={lang} label={lang.trim()} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
            ))}
            <Chip
              label={doctor.is_available ? 'Available' : 'Unavailable'}
              size="small"
              color={doctor.is_available ? 'success' : 'default'}
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
            />
          </Box>

          {/* Consultations */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {doctor.total_consultations?.toLocaleString()} consultations completed
          </Typography>

          {/* Footer */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="primary.main">₹{doctor.consultation_fee}</Typography>
              <Typography variant="caption" color="text.secondary">Consultation fee</Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<CalendarMonth />}
              onClick={() => navigate(`/book/${doctor.id}`)}
              disabled={!doctor.is_available}
              sx={{ borderRadius: 2 }}
            >
              Book Now
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([])
  const [specializations, setSpecializations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', specialization_id: '', min_experience: '', is_available: true })

  useEffect(() => {
    doctorsAPI.specializations().then(r => setSpecializations(r.data)).catch(() => {})
    loadDoctors()
  }, [])

  const loadDoctors = async (params = {}) => {
    setLoading(true)
    try {
      const res = await doctorsAPI.list({ ...filters, ...params, per_page: 20 })
      setDoctors(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => loadDoctors()
  const handleReset = () => {
    setFilters({ search: '', specialization_id: '', min_experience: '', is_available: true })
    loadDoctors({ search: '', specialization_id: '', min_experience: '', is_available: true })
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>Find Doctors</Typography>
        <Typography color="text.secondary">Browse verified doctors across all specialties</Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Search doctor"
                fullWidth
                size="small"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Specialization"
                select
                fullWidth
                size="small"
                value={filters.specialization_id}
                onChange={e => setFilters(f => ({ ...f, specialization_id: e.target.value }))}
              >
                <MenuItem value="">All Specializations</MenuItem>
                {specializations.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label="Min. Experience"
                select
                fullWidth
                size="small"
                value={filters.min_experience}
                onChange={e => setFilters(f => ({ ...f, min_experience: e.target.value }))}
              >
                <MenuItem value="">Any</MenuItem>
                {[2, 5, 10, 15, 20].map(y => <MenuItem key={y} value={y}>{y}+ years</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" startIcon={<FilterList />} onClick={handleFilter} fullWidth>
                Filter
              </Button>
              <Button variant="outlined" onClick={handleReset}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          {loading ? 'Loading...' : `${doctors.length} doctors found`}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton height={280} sx={{ borderRadius: 3 }} variant="rectangular" />
            </Grid>
          ))
        ) : doctors.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Search sx={{ fontSize: 56, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>No doctors found</Typography>
              <Typography color="text.secondary">Try adjusting your filters</Typography>
            </Box>
          </Grid>
        ) : (
          doctors.map((doctor, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doctor.id}>
              <DoctorCard doctor={doctor} index={i} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  )
}
