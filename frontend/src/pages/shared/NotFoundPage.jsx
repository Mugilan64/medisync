import { Box, Typography, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../store/authStore';

export default function NotFoundPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAdmin, isDoctor, isPatient } = useAuth();

  const home = isAdmin ? '/admin/dashboard' : isDoctor ? '/doctor/dashboard' : '/patient/dashboard';

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 3, textAlign: 'center', px: 3,
      background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
    }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
        <Typography sx={{
          fontSize: { xs: '6rem', md: '10rem' },
          fontWeight: 900, lineHeight: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          404
        </Typography>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Page Not Found</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined" sx={{ borderRadius: 2 }}>
            Go Back
          </Button>
          <Button startIcon={<Home />} onClick={() => navigate(home)} variant="contained" sx={{ borderRadius: 2 }}>
            Go to Dashboard
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}
