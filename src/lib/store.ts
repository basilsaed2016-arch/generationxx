'use client'

import { create } from 'zustand'

export type View = 'home' | 'exam' | 'admin' | 'checkout'

type SessionUser = {
  id: string
  discordId: string
  username: string
  avatar: string | null
  discriminator: string | null
  isAdmin: boolean
  inGuild: boolean
  verified: boolean
  avatarUrl?: string
}

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image: string | null
  badge: string | null
  category: { id: string; name: string; slug: string } | null
}

type AppState = {
  // View routing (single-page app)
  view: View
  setView: (v: View) => void

  // User session (client mirror)
  user: SessionUser | null
  setUser: (u: SessionUser | null) => void
  fetchUser: () => Promise<void>

  // Auth modal
  authOpen: boolean
  setAuthOpen: (b: boolean) => void

  // Pending redirect after login (e.g. 'exam')
  pendingView: View | null
  setPendingView: (v: View | null) => void

  // Mobile nav
  mobileNavOpen: boolean
  setMobileNavOpen: (b: boolean) => void

  // Checkout — selected product
  checkoutProduct: Product | null
  setCheckoutProduct: (p: Product | null) => void
  startCheckout: (p: Product) => void
}

export const useApp = create<AppState>((set) => ({
  view: 'home',
  setView: (v) => {
    set({ view: v })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },

  user: null,
  setUser: (u) => set({ user: u }),
  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' })
      if (!res.ok) {
        set({ user: null })
        return
      }
      const data = await res.json()
      set({ user: data.user ?? null })
    } catch {
      set({ user: null })
    }
  },

  authOpen: false,
  setAuthOpen: (b) => set({ authOpen: b }),

  pendingView: null,
  setPendingView: (v) => set({ pendingView: v }),

  mobileNavOpen: false,
  setMobileNavOpen: (b) => set({ mobileNavOpen: b }),

  checkoutProduct: null,
  setCheckoutProduct: (p) => set({ checkoutProduct: p }),
  startCheckout: (p) => {
    set({ checkoutProduct: p, view: 'checkout' })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  },
}))

/**
 * Helper: try to enter a gated view. If not logged in, open auth modal
 * and remember the intended view.
 */
export function requireAuthOrOpen(view: View) {
  const s = useApp.getState()
  if (!s.user) {
    s.setPendingView(view)
    s.setAuthOpen(true)
    return false
  }
  s.setView(view)
  return true
}
