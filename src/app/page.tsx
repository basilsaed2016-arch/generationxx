'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import CustomCursor from '@/components/cursor/CustomCursor'
import AnimatedBackground from '@/components/effects/AnimatedBackground'
import Navbar from '@/components/nav/Navbar'
import DiscordLoginModal from '@/components/auth/DiscordLoginModal'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Streamers from '@/components/sections/Streamers'
import Store from '@/components/sections/Store'
import Footer from '@/components/sections/Footer'
import Exam from '@/components/exam/Exam'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Checkout from '@/components/checkout/Checkout'

export default function Home() {
  const { view, fetchUser } = useApp()

  // Hydrate user session once on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <>
      <CustomCursor />
      <AnimatedBackground />

      <Navbar />
      <DiscordLoginModal />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.main
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <Hero />
            <About />
            <Streamers />
            <Store />
            <Footer />
          </motion.main>
        )}

        {view === 'exam' && (
          <motion.main
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <Exam />
          </motion.main>
        )}

        {view === 'admin' && (
          <motion.main
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <AdminDashboard />
          </motion.main>
        )}

        {view === 'checkout' && (
          <motion.main
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <Checkout />
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}
