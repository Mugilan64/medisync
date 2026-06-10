import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, Chip, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Avatar, Skeleton,
  InputAdornment, Stack, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, alpha, useTheme,
} from '@mui/material';
import {
  Search, FilterList, CalendarToday, AccessTime, Person,
  LocalHospital, Cancel, CheckCircle, Schedule, Refresh,
  Visibility, MoreVert, Download, EventNote,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { appointmentsAPI } from '../../services/api';
import { useAuth } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'warning', icon: <Schedule sx={{ fontSize: 14 }} /> },
  confirmed: { label: 'Confirmed', color: 'info',    icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  completed: { label: 'Completed', color: 'success', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  cancelled: { label: 'Cancelled', color: 'error',   icon: <Cancel sx={{ fontSize: 14 }} /> },
  no_show:   { label: 'No Show',   color: 'default', icon: <Cancel sx={{ fontSize: 14 }} /> },
};

const SPECIALIZATIONS = [
  'All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Gynecology', 'Ophthalmology', 'Psychiatry', 'General Medicine',
];

export default function AppointmentsList() {
  const theme = useTheme();
  const { user, isDoctor, isAdmin } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      };
      const res = await appointmentsAPI.getAll(params);
      setAppointments(res.data.appointments || res.data || []);
      setTotal(res.data.total || res.data?.length || 0);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter, search]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await appointmentsAPI.cancel(selected.id, { reason: 'Cancelled by user' });
      toast.success('Appointment cancelled');
      setCancelOpen(false);
      setDetailOpen(false);
      fetchAppointments();
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await appointmentsAPI.confirm(id);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch {
      toast.error('Failed to confirm');
    }
  };

  const statusCounts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(s => [s, appointments.filter(a => a.status === s).length])
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Appointments</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track all appointments
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          variant="outlined"
          onClick={fetchAppointments}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Status filter chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {[{ key: 'all', label: 'All', color: 'default' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label, color: v.color }))].map(({ key, label, color }) => (
          <Chip
            key={key}
            label={`${label}${key !== 'all' ? ` (${statusCounts[key] || 0})` : ''}`}
            color={statusFilter === key ? color : 'default'}
            variant={statusFilter === key ? 'filled' : 'outlined'}
            onClick={() => { setStatusFilter(key); setPage(0); }}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {/* Search & Filter bar */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: theme.shadows[1] }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search by patient, doctor, or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Stack>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                {['Appointment', 'Patient', isAdmin || isDoctor ? 'Doctor' : '', 'Date & Time', 'Type', 'Status', 'Actions'].filter(Boolean).map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {[160, 140, 140, 120, 80, 90, 80].map((w, j) => (
                      <TableCell key={j}><Skeleton width={w} height={20} /></TableCell>
                    ))}
                  </TableRow>
                )) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <EventNote sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary">No appointments found</Typography>
                    </TableCell>
                  </TableRow>
                ) : appointments.map((appt, idx) => {
                  const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
                  return (
                    <motion.tr
                      key={appt.id}
                      component={TableRow}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) }, transition: 'background 0.2s' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          #{appt.id?.toString().padStart(5, '0')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appt.appointment_type || 'In-Person'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                            {appt.patient_name?.charAt(0) || 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {appt.patient_name || 'Patient'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {appt.patient_phone || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {(isAdmin || isDoctor) && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 13 }}>
                              {appt.doctor_name?.charAt(0) || 'D'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {appt.doctor_name || 'Doctor'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {appt.specialization || ''}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {appt.appointment_date ? format(parseISO(appt.appointment_date), 'MMM dd, yyyy') : '-'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                          <AccessTime sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {appt.start_time || '-'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appt.appointment_type || 'In-Person'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={sc.icon}
                          label={sc.label}
                          color={sc.color}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => { setSelected(appt); setDetailOpen(true); }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {appt.status === 'pending' && isDoctor && (
                            <Tooltip title="Confirm">
                              <IconButton size="small" color="success" onClick={() => handleConfirm(appt.id)}>
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {['pending', 'confirmed'].includes(appt.status) && (
                            <Tooltip title="Cancel">
                              <IconButton size="small" color="error" onClick={() => { setSelected(appt); setCancelOpen(true); }}>
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Appointment Details</Typography>
          <Typography variant="caption" color="text.secondary">
            #{selected?.id?.toString().padStart(5, '0')}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
              {[
                { label: 'Patient', value: selected.patient_name },
                { label: 'Doctor', value: selected.doctor_name },
                { label: 'Specialization', value: selected.specialization },
                { label: 'Date', value: selected.appointment_date ? format(parseISO(selected.appointment_date), 'MMMM dd, yyyy') : '-' },
                { label: 'Time', value: `${selected.start_time} – ${selected.end_time}` },
                { label: 'Type', value: selected.appointment_type || 'In-Person' },
                { label: 'Status', value: STATUS_CONFIG[selected.status]?.label },
                { label: 'Symptoms', value: selected.symptoms || 'Not specified' },
                { label: 'Notes', value: selected.patient_notes || 'None' },
                { label: 'Consultation Fee', value: selected.consultation_fee ? `₹${selected.consultation_fee}` : '-' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`, pb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {selected && ['pending', 'confirmed'].includes(selected.status) && (
            <Button color="error" variant="outlined" onClick={() => { setDetailOpen(false); setCancelOpen(true); }} sx={{ borderRadius: 2 }}>
              Cancel Appointment
            </Button>
          )}
          <Button onClick={() => setDetailOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirm Dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Cancel Appointment?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel appointment #{selected?.id?.toString().padStart(5, '0')}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelOpen(false)} sx={{ borderRadius: 2 }}>Keep It</Button>
          <Button color="error" variant="contained" onClick={handleCancel} disabled={cancelling} sx={{ borderRadius: 2 }}>
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
