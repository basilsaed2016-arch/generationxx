'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ListChecks,
  Users,
  Award,
  Settings,
  Home,
  Tag,
  Radio,
  Package,
  CreditCard,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import GlowButton from '@/components/ui/GlowButton'
import AdminStats from '@/components/admin/AdminStats'
import AdminQuestions from '@/components/admin/AdminQuestions'
import AdminCategories from '@/components/admin/AdminCategories'
import AdminApplicants from '@/components/admin/AdminApplicants'
import AdminResults from '@/components/admin/AdminResults'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminSettings from '@/components/admin/AdminSettings'
import AdminStreamers from '@/components/admin/AdminStreamers'
import AdminProducts from '@/components/admin/AdminProducts'
import AdminPayments from '@/components/admin/AdminPayments'
import { cn } from '@/lib/utils'

type Tab =
  | 'dashboard'
  | 'streamers'
  | 'products'
  | 'payments'
  | 'questions'
  | 'categories'
  | 'applicants'
  | 'results'
  | 'users'
  | 'settings'

type TabDef = {
  id: Tab
  label: string
  icon: React.ComponentType<{ className?: string }>
}

type TabGroup = {
  name: string
  tabs: TabDef[]
}

const TAB_GROUPS: TabGroup[] = [
  {
    name: 'عام',
    tabs: [{ id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard }],
  },
  {
    name: 'المحتوى',
    tabs: [{ id: 'streamers', label: 'الستريمرز', icon: Radio }],
  },
  {
    name: 'المتجر',
    tabs: [
      { id: 'products', label: 'المنتجات', icon: Package },
      { id: 'payments', label: 'المدفوعات', icon: CreditCard },
    ],
  },
  {
    name: 'الاختبار',
    tabs: [
      { id: 'questions', label: 'الأسئلة', icon: ListChecks },
      { id: 'categories', label: 'التصنيفات', icon: Tag },
      { id: 'applicants', label: 'المتقدمون', icon: Users },
      { id: 'results', label: 'النتائج', icon: Award },
    ],
  },
  {
    name: 'النظام',
    tabs: [
      { id: 'users', label: 'المستخدمون', icon: Users },
      { id: 'settings', label: 'الإعدادات', icon: Settings },
    ],
  },
]

// Flatten for quick lookup
const ALL_TABS = TAB_GROUPS.flatMap((g) => g.tabs)

export default function AdminDashboard() {
  const { user, setView } = useApp()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (user && !user.isAdmin) {
      setView('home')
    }
  }, [user, setView])

  if (!user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="mb-4 text-rose-400">غير مصرح لك بالوصول إلى لوحة التحكم.</p>
          <GlowButton variant="primary" onClick={() => setView('home')}>
            العودة للرئيسية
          </GlowButton>
        </div>
      </div>
    )
  }

  const currentTab = ALL_TABS.find((t) => t.id === tab)

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ===== Top bar (sticky) ===== */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0b0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebar(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-white lg:hidden"
              aria-label="فتح القائمة"
            >
              <LayoutDashboard size={16} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white sm:text-base">
                {currentTab?.label ?? 'لوحة التحكم'}
              </h1>
              <p className="hidden text-[11px] text-white/40 sm:block">
                GenerationX Admin Panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('home')}
              data-cursor="hover"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/70 transition-colors hover:border-[#00F5D4]/40 hover:text-[#00F5D4]"
            >
              <Home size={14} />
              <span className="hidden sm:inline">الموقع</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ===== Sidebar (desktop) ===== */}
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 lg:block">
          <SidebarContent tab={tab} setTab={setTab} />
        </aside>

        {/* ===== Mobile sidebar ===== */}
        {mobileSidebar && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 right-0 w-72 overflow-y-auto bg-[#0a0b0e] p-4 pt-6"
            >
              <SidebarContent
                tab={tab}
                setTab={(t) => {
                  setTab(t)
                  setMobileSidebar(false)
                }}
              />
            </motion.div>
          </div>
        )}

        {/* ===== Main content ===== */}
        <main className="min-w-0 flex-1">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {tab === 'dashboard' && <AdminStats />}
            {tab === 'streamers' && <AdminStreamers />}
            {tab === 'products' && <AdminProducts />}
            {tab === 'payments' && <AdminPayments />}
            {tab === 'questions' && <AdminQuestions />}
            {tab === 'categories' && <AdminCategories />}
            {tab === 'applicants' && <AdminApplicants />}
            {tab === 'results' && <AdminResults />}
            {tab === 'users' && <AdminUsers />}
            {tab === 'settings' && <AdminSettings />}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  tab,
  setTab,
}: {
  tab: Tab
  setTab: (t: Tab) => void
}) {
  return (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#0a0b0e] p-4">
      {/* Brand */}
      <div className="px-2 pb-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#00F5D4]">
          لوحة الأدمن
        </div>
        <div className="text-xs text-white/40">GenerationX Control</div>
      </div>

      {/* Groups */}
      {TAB_GROUPS.map((group) => (
        <div key={group.name}>
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/25">
            {group.name}
          </div>
          <div className="space-y-0.5">
            {group.tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                data-cursor="hover"
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-right text-sm font-medium transition-all',
                  tab === id
                    ? 'bg-[#00F5D4]/10 text-[#00F5D4] ring-1 ring-[#00F5D4]/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {tab === id && (
                  <motion.div
                    layoutId="admin-active-dot"
                    className="h-1 w-1 rounded-full bg-[#00F5D4]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
