import { createTheme, alpha } from '@mui/material/styles'

const TEAL = '#0891b2'
const TEAL_DARK = '#0e7490'
const TEAL_LIGHT = '#e0f7fa'
const INDIGO = '#4f46e5'
const SUCCESS = '#10b981'
const WARNING = '#f59e0b'
const ERROR = '#ef4444'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: TEAL,
      dark: TEAL_DARK,
      light: '#22d3ee',
      contrastText: '#ffffff',
    },
    secondary: {
      main: INDIGO,
      contrastText: '#ffffff',
    },
    success: { main: SUCCESS },
    warning: { main: WARNING },
    error: { main: ERROR },
    background: {
      default: '#f0f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
    '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)',
    '0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.03)',
    '0 20px 25px rgba(0,0,0,0.06), 0 10px 10px rgba(0,0,0,0.02)',
    '0 25px 50px rgba(0,0,0,0.08)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: '0.9rem',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
          boxShadow: `0 4px 14px ${alpha(TEAL, 0.4)}`,
          '&:hover': {
            boxShadow: `0 6px 20px ${alpha(TEAL, 0.5)}`,
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#f8fafc',
            '&:hover fieldset': { borderColor: TEAL },
            '&.Mui-focused fieldset': { borderColor: TEAL },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
          color: '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#0f172a',
          color: '#ffffff',
          borderRight: 'none',
        },
      },
    },
  },
})

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: { main: '#22d3ee', dark: TEAL, light: '#67e8f9', contrastText: '#0f172a' },
    secondary: { main: '#818cf8', contrastText: '#0f172a' },
    success: { main: '#34d399' },
    warning: { main: '#fbbf24' },
    error: { main: '#f87171' },
    background: { default: '#0a0f1e', paper: '#111827' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
    divider: '#1e293b',
  },
  components: {
    ...lightTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #1e293b',
          backgroundColor: '#111827',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(17,24,39,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #1e293b',
          boxShadow: 'none',
          color: '#f1f5f9',
        },
      },
    },
  },
})
