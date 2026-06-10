import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Chip, Button, Grid, Stack, Divider,
  Avatar, CircularProgress, TextField, alpha, useTheme,
} from '@mui/material';
import {
  ArrowBack, CalendarToday, AccessTime, Person, LocalHospital,
  CheckCircle, Cancel, Edit, Save, EventNote,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { appointmentsAPI } from '../../services/api';
import { useAuth } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  no_show:   { label: 'No Show',   color: 'default' },
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDoctor } = useAuth();

  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await appointmentsAPI.getById(id);
        setAppt(res.data);
        setNotes(res.data.consultation_notes || '');
      } catch {
        toast.error('Failed to load appointment');
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await appointmentsAPI.addNotes(id, { notes });
      toast.success('Notes saved');
      setEditingNotes(false);
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleComplete = async () => {
    try {
      await appointmentsAPI.complete(id);
      toast.success('Appointment marked as completed');
      setAppt(prev => ({ ...prev, status: 'completed' }));
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );

  if (!appt) return null;

  const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/appointments')} sx={{ mb: 3, borderRadius: 2 }} variant="outlined">
        Back to Appointments
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3], overflow: 'hidden' }}>
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                p: 3, color: 'white',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Appointment #{appt.id?.toString().padStart(5, '0')}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {appt.appointment_type || 'In-Person Consultation'}
                    </Typography>
                  </Box>
                  <Chip
                    label={sc.label} color={sc.color} variant="filled"
                    sx={{ fontWeight: 700, bgcolor: 'white', color: `${sc.color}.main` }}
                  />
                </Box>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Patient */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>Patient</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        {appt.patient_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{appt.patient_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{appt.patient_phone || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Doctor */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>Doctor</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                        {appt.doctor_name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{appt.doctor_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{appt.specialization || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}><Divider /></Grid>

                  {/* Date & Time */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <CalendarToday fontSize="small" color="primary" />
                      <Typography variant="overline" color="text.secondary" fontWeight={700}>Date</Typography>
                    </Box>
                    <Typography fontWeight={600}>
                      {appt.appointment_date ? format(parseISO(appt.appointment_date), 'MMMM dd, yyyy') : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <AccessTime fontSize="small" color="primary" />
                      <Typography variant="overline" color="text.secondary" fontWeight={700}>Time</Typography>
                    </Box>
                    <Typography fontWeight={600}>{appt.start_time} – {appt.end_time}</Typography>
                  </Grid>

                  {/* Symptoms */}
                  <Grid item xs={12}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700}>Symptoms / Reason</Typography>
                    <Card variant="outlined" sx={{ mt: 0.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                      <Typography variant="body2">{appt.symptoms || 'Not specified'}</Typography>
                    </Card>
                  </Grid>

                  {/* Patient Notes */}
                  {appt.patient_notes && (
                    <Grid item xs={12}>
                      <Typography variant="overline" color="text.secondary" fontWeight={700}>Patient Notes</Typography>
                      <Card variant="outlined" sx={{ mt: 0.5, p: 1.5, borderRadius: 2 }}>
                        <Typography variant="body2">{appt.patient_notes}</Typography>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Card>

            {/* Consultation Notes — Doctor only */}
            {isDoctor && (
              <Card sx={{ mt: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventNote color="primary" />
                      <Typography variant="h6" fontWeight={600}>Consultation Notes</Typography>
                    </Box>
                    {!editingNotes ? (
                      <Button startIcon={<Edit />} size="small" onClick={() => setEditingNotes(true)} variant="outlined" sx={{ borderRadius: 2 }}>
                        {notes ? 'Edit' : 'Add Notes'}
                      </Button>
                    ) : (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" onClick={() => setEditingNotes(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                        <Button size="small" variant="contained" startIcon={savingNotes ? <CircularProgress size={12} /> : <Save />} onClick={handleSaveNotes} disabled={savingNotes} sx={{ borderRadius: 2 }}>
                          Save
                        </Button>
                      </Stack>
                    )}
                  </Box>
                  <TextField
                    multiline rows={5} fullWidth
                    placeholder="Add consultation notes, diagnosis, prescriptions..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    disabled={!editingNotes}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Box>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Fee Card */}
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Consultation Fee</Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                    ₹{appt.consultation_fee || 0}
                  </Typography>
                  <Chip
                    label={appt.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    color={appt.payment_status === 'paid' ? 'success' : 'warning'}
                    size="small" sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>
              </Card>

              {/* Actions */}
              {isDoctor && appt.status === 'confirmed' && (
                <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>Actions</Typography>
                    <Stack spacing={1.5}>
                      <Button
                        fullWidth variant="contained" color="success"
                        startIcon={<CheckCircle />} onClick={handleComplete}
                        sx={{ borderRadius: 2 }}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        fullWidth variant="outlined" color="error"
                        startIcon={<Cancel />}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel Appointment
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              )}

              {/* Timeline */}
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 2, display: 'block' }}>Timeline</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Booked', time: appt.created_at, done: true },
                      { label: 'Confirmed', time: appt.confirmed_at, done: ['confirmed', 'completed'].includes(appt.status) },
                      { label: 'Completed', time: appt.completed_at, done: appt.status === 'completed' },
                    ].map(({ label, time, done }) => (
                      <Box key={label} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                        <Box sx={{
                          width: 10, height: 10, borderRadius: '50%', mt: 0.5, flexShrink: 0,
                          bgcolor: done ? 'success.main' : 'text.disabled',
                        }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600} color={done ? 'text.primary' : 'text.disabled'}>{label}</Typography>
                          {time && <Typography variant="caption" color="text.secondary">{format(parseISO(time), 'MMM dd, h:mm a')}</Typography>}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
}
