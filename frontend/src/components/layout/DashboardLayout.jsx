import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Avatar, Badge, Menu, MenuItem,
  Divider, Tooltip, useMediaQuery, useTheme, Switch
} from '@mui/material'
import {
  Dashboard, CalendarMonth, PersonSearch, Assignment, Person,
  Notifications, Logout, Menu as MenuIcon, ChevronLeft,
  AdminPanelSettings, People, Analytics, LocalHospital,
  DarkMode, LightMode, Settings, MedicalServices
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import { notificationsAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'

const DRAWER_WIDTH = 260

const navItems = {
  super_admin: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { label: 'Appointments', icon: <CalendarMonth />, path: '/appointments' },
    { label: 'Doctors', icon: <LocalHospital />, path: '/doctors' },
    { label: 'Analytics', icon: <Analytics />, path: '/admin/dashboard' },
  ],
  doctor: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/doctor/dashboard' },
    { label: 'My Appointments', icon: <CalendarMonth />, path: '/appointments' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ],
  patient: [
    { label: 'Dashboard', icon: <Dashboard />, path: '/patient/dashboard' },
    { label: 'Find Doctors', icon: <PersonSearch />, path: '/doctors' },
    { label: 'My Appointments', icon: <CalendarMonth />, path: '/appointments' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ],
}

export default function DashboardLayout({ darkMode, setDarkMode }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout, getRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const role = getRole()
  const items = navItems[role] || navItems.patient

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.list(),
        notificationsAPI.unreadCount(),
      ])
      setNotifications(notifRes.data.slice(0, 5))
      setUnreadCount(countRes.data.count)
    } catch {}
  }

  const handleLogout = async () => {
    try { await authAPI.logout() } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead()
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const SidebarContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'linear-gradient(135deg, #0891b2, #22d3ee)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <MedicalServices sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 800, lineHeight: 1, fontSize: '1.1rem' }}>
            MediSync
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Healthcare Platform
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />

      {/* User info */}
      <Box sx={{ px: 2, py: 1.5, mx: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #0891b2, #4f46e5)', fontSize: '0.85rem', fontWeight: 700 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }} noWrap>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', textTransform: 'capitalize' }}>
              {role?.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1.5, flex: 1 }}>
        {items.map((item) => {
          const active = location.pathname === item.path
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => isMobile && setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  background: active ? 'linear-gradient(135deg, rgba(8,145,178,0.3), rgba(79,70,229,0.2))' : 'transparent',
                  border: active ? '1px solid rgba(8,145,178,0.3)' : '1px solid transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.06)' },
                }}
              >
                <ListItemIcon sx={{ color: active ? '#22d3ee' : 'rgba(255,255,255,0.45)', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 400, color: active ? 'white' : 'rgba(255,255,255,0.6)' }}
                />
                {active && <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#22d3ee' }} />}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2, mb: 2 }} />

      {/* Dark mode toggle */}
      <Box sx={{ px: 2, pb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {darkMode ? <DarkMode sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} /> : <LightMode sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />}
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Dark Mode</Typography>
        </Box>
        <Switch size="small" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} sx={{ '& .MuiSwitch-thumb': { background: '#22d3ee' } }} />
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* AppBar */}
        <AppBar position="sticky" sx={{ zIndex: 1100 }}>
          <Toolbar sx={{ gap: 1 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} size="small">
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} size="small">
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <Notifications fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              PaperProps={{ sx: { width: 340, maxHeight: 400, borderRadius: 2 } }}
            >
              <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography fontWeight={700}>Notifications</Typography>
                {unreadCount > 0 && (
                  <Typography variant="caption" sx={{ cursor: 'pointer', color: 'primary.main' }} onClick={handleMarkAllRead}>
                    Mark all read
                  </Typography>
                )}
              </Box>
              <Divider />
              {notifications.length === 0 ? (
                <MenuItem><Typography variant="body2" color="text.secondary">No notifications</Typography></MenuItem>
              ) : notifications.map(n => (
                <MenuItem key={n.id} sx={{ py: 1.5, opacity: n.is_read ? 0.6 : 1, whiteSpace: 'normal' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={n.is_read ? 400 : 600}>{n.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{n.message}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>

            {/* User menu */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #0891b2, #4f46e5)', fontSize: '0.8rem', fontWeight: 700 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}>
              <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null) }}>
                <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </Box>
      </Box>
    </Box>
  )
}
