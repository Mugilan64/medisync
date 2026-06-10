import React, { useEffect, useState } from 'react'
import { Box, Typography, Skeleton } from '@mui/material'
import { TrendingUp } from '@mui/icons-material'
import { motion } from 'framer-motion'

function AnimatedNumber({ value, loading }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (loading || !value) return
    let start = 0
    const end = typeof value === 'number' ? value : 0
    if (end === 0) { setDisplay(0); return }
    const duration = 1200
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value, loading])

  if (loading) return <Skeleton width={60} height={36} />
  if (typeof value === 'string') return <>{value}</>
  return <>{display.toLocaleString()}</>
}

export default function StatCard({ title, value, icon, gradient, trend, subtitle, loading, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Box sx={{
        borderRadius: 3,
        p: 2.5,
        background: gradient || 'linear-gradient(135deg, #0891b2, #0e7490)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' },
      }}>
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute', top: -20, right: -20,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -30, right: 30,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </Box>
          {trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, background: 'rgba(255,255,255,0.15)', borderRadius: 10, px: 1, py: 0.3 }}>
              <TrendingUp sx={{ fontSize: 12 }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{trend}%</Typography>
            </Box>
          )}
        </Box>

        <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, lineHeight: 1, mb: 0.5 }}>
          <AnimatedNumber value={value} loading={loading} />
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 500 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: '0.7rem', opacity: 0.6, mt: 0.3 }}>{subtitle}</Typography>}
      </Box>
    </motion.div>
  )
}
