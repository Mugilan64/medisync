import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Avatar, Button, TextField, Grid,
  Divider, Chip, Stack, IconButton, CircularProgress,
  alpha, useTheme, Tab, Tabs, Switch, FormControlLabel,
} from '@mui/material';
import {
  Edit, Save, Cancel, CameraAlt, Person, Security,
  Notifications, LocalHospital, Star, Phone, Email,
  LocationOn, Work, School,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../store/authStore';

const MotionCard = motion(Card);

export default function ProfilePage() {
  const theme = useTheme();
  const { user, isDoctor, isPatient, isAdmin } = useAuth();
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      specialization: user?.specialization || '',
      experience_years: user?.experience_years || '',
      consultation_fee: user?.consultation_fee || '',
      qualifications: user?.qualifications || '',
    }
  });

  useEffect(() => {
    if (user) reset({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || '',
      specialization: user.specialization || '',
      experience_years: user.experience_years || '',
      consultation_fee: user.consultation_fee || '',
      qualifications: user.qualifications || '',
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // API call would go here: await profileAPI.update(data)
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email;
  const roleLabel = isAdmin ? 'Super Admin' : isDoctor ? 'Doctor' : 'Patient';
  const roleColor = isAdmin ? 'error' : isDoctor ? 'primary' : 'success';

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>My Profile</Typography>

      <Grid container spacing={3}>
        {/* Left: Avatar & Quick Info */}
        <Grid item xs={12} md={4}>
          <MotionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[3] }}
          >
            {/* Cover gradient */}
            <Box sx={{
              height: 100,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }} />

            <Box sx={{ px: 3, pb: 3, mt: -6 }}>
              {/* Avatar */}
              <Box
                sx={{ position: 'relative', display: 'inline-block', mb: 2 }}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
              >
                <Avatar
                  sx={{
                    width: 88, height: 88,
                    bgcolor: theme.palette.primary.main,
                    fontSize: 32, fontWeight: 700,
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </Avatar>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute', bottom: 0, right: 0,
                    bgcolor: 'primary.main', color: 'white',
                    opacity: avatarHover ? 1 : 0, transition: 'opacity 0.2s',
                    '&:hover': { bgcolor: 'primary.dark' },
                    width: 28, height: 28,
                  }}
                >
                  <CameraAlt sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>

              <Typography variant="h6" fontWeight={700}>{fullName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user?.email}</Typography>
              <Chip label={roleLabel} color={roleColor} size="small" sx={{ fontWeight: 700, mb: 2 }} />

              <Divider sx={{ my: 2 }} />

              {/* Quick info */}
              <Stack spacing={1.5}>
                {[
                  { icon: <Phone fontSize="small" />, value: user?.phone || 'Not set' },
                  { icon: <LocationOn fontSize="small" />, value: user?.address || 'Not set' },
                  ...(isDoctor ? [
                    { icon: <LocalHospital fontSize="small" />, value: user?.specialization || 'Not set' },
                    { icon: <Work fontSize="small" />, value: user?.experience_years ? `${user.experience_years} years exp.` : 'Not set' },
                    { icon: <Star fontSize="small" />, value: user?.average_rating ? `${user.average_rating.toFixed(1)} / 5.0 Rating` : 'No ratings yet' },
                  ] : []),
                ].map(({ icon, value }, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: 'text.secondary' }}>{icon}</Box>
                    <Typography variant="body2" color="text.secondary">{value}</Typography>
                  </Box>
                ))}
              </Stack>

              {isDoctor && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="primary.main">{user?.total_appointments || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Appointments</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="success.main">{user?.total_patients || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Patients</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={700} color="warning.main">₹{user?.consultation_fee || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Fee</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </MotionCard>
        </Grid>

        {/* Right: Tabs */}
        <Grid item xs={12} md={8}>
          <MotionCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Personal Info" icon={<Person />} iconPosition="start" />
                <Tab label="Security" icon={<Security />} iconPosition="start" />
                <Tab label="Notifications" icon={<Notifications />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Personal Info Tab */}
            {tab === 0 && (
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
                  {!editing ? (
                    <Button startIcon={<Edit />} onClick={() => setEditing(true)} variant="outlined" sx={{ borderRadius: 2 }}>
                      Edit Profile
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button startIcon={<Cancel />} onClick={() => { setEditing(false); reset(); }} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
                        Discard
                      </Button>
                      <Button startIcon={saving ? <CircularProgress size={14} /> : <Save />} type="submit" variant="contained" disabled={saving} sx={{ borderRadius: 2 }}>
                        Save Changes
                      </Button>
                    </Stack>
                  )}
                </Box>

                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name" fullWidth size="small"
                      disabled={!editing}
                      {...register('first_name', { required: 'Required' })}
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name" fullWidth size="small"
                      disabled={!editing}
                      {...register('last_name', { required: 'Required' })}
                      error={!!errors.last_name}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email" fullWidth size="small"
                      disabled
                      {...register('email')}
                      InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone" fullWidth size="small"
                      disabled={!editing}
                      {...register('phone')}
                      InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Address" fullWidth size="small"
                      disabled={!editing}
                      {...register('address')}
                      InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} /> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Bio" fullWidth size="small" multiline rows={3}
                      disabled={!editing}
                      placeholder="Tell us about yourself..."
                      {...register('bio')}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  {isDoctor && (
                    <>
                      <Grid item xs={12}>
                        <Divider><Typography variant="caption" color="text.secondary" fontWeight={600}>DOCTOR INFORMATION</Typography></Divider>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Specialization" fullWidth size="small"
                          disabled={!editing}
                          {...register('specialization')}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Experience (years)" fullWidth size="small"
                          type="number"
                          disabled={!editing}
                          {...register('experience_years')}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Consultation Fee (₹)" fullWidth size="small"
                          type="number"
                          disabled={!editing}
                          {...register('consultation_fee')}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Qualifications" fullWidth size="small"
                          disabled={!editing}
                          placeholder="MBBS, MD, etc."
                          {...register('qualifications')}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            )}

            {/* Security Tab */}
            {tab === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Security Settings</Typography>
                <Stack spacing={3}>
                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Typography fontWeight={600} sx={{ mb: 2 }}>Change Password</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField label="Current Password" type="password" fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="New Password" type="password" fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField label="Confirm New Password" type="password" fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Button variant="contained" sx={{ borderRadius: 2 }}>Update Password</Button>
                      </Grid>
                    </Grid>
                  </Card>

                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography fontWeight={600}>Two-Factor Authentication</Typography>
                        <Typography variant="body2" color="text.secondary">Add an extra layer of security to your account</Typography>
                      </Box>
                      <Chip label="Coming Soon" size="small" />
                    </Box>
                  </Card>

                  <Card variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.04) }}>
                    <Typography fontWeight={600} color="error.main" sx={{ mb: 1 }}>Danger Zone</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Once you delete your account, there is no going back.
                    </Typography>
                    <Button variant="outlined" color="error" sx={{ borderRadius: 2 }}>Delete Account</Button>
                  </Card>
                </Stack>
              </Box>
            )}

            {/* Notifications Tab */}
            {tab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Notification Preferences</Typography>
                <Stack spacing={2}>
                  {[
                    { label: 'Appointment Reminders', desc: 'Get reminded 24 hours before your appointment', checked: true },
                    { label: 'Booking Confirmations', desc: 'Receive confirmation when an appointment is booked', checked: true },
                    { label: 'Cancellation Alerts', desc: 'Be notified when an appointment is cancelled', checked: true },
                    { label: 'Promotional Emails', desc: 'Health tips, offers, and platform updates', checked: false },
                    { label: 'SMS Notifications', desc: 'Receive alerts via SMS', checked: false },
                  ].map(({ label, desc, checked }) => (
                    <Card key={label} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography fontWeight={600} variant="body2">{label}</Typography>
                          <Typography variant="caption" color="text.secondary">{desc}</Typography>
                        </Box>
                        <Switch defaultChecked={checked} color="primary" />
                      </Box>
                    </Card>
                  ))}
                  <Button variant="contained" sx={{ borderRadius: 2, alignSelf: 'flex-start' }}>Save Preferences</Button>
                </Stack>
              </Box>
            )}
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
