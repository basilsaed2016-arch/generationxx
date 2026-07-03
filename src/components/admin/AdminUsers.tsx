'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, Users as UsersIcon, Shield } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from 'sonner'

type User = {
  id: string
  username: string
  discordId: string
  avatar: string | null
  isAdmin: boolean
  createdAt: string
  examCount: number
  lastExam: { percentage: number; passed: boolean; createdAt: string } | null
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q,
        page: String(page),
        limit: '20',
      })
      const res = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' })
      const data = await res.json()
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch {
      toast.error('فشل التحميل')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
     
  }, [q, page])

  const toggleAdmin = async (u: User) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: u.id, isAdmin: !u.isAdmin }),
      })
      if (!res.ok) throw new Error()
      toast.success(u.isAdmin ? 'تمت إزالة الصلاحية' : 'تم منح صلاحية الأدمن')
      await load()
    } catch {
      toast.error('فشل التحديث')
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-white">المستخدمون</h1>
        <p className="mt-1 text-sm text-white/60">
          جميع المستخدمين المسجلين — إجمالي: {total}
        </p>
      </header>

      <GlassCard className="mb-4 p-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="ابحث بالاسم أو الـ Discord ID..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 pr-10 pl-3 text-sm text-white placeholder:text-white/40 focus:border-[#00F5D4]/50 focus:outline-none"
          />
        </div>
      </GlassCard>

      {loading ? (
        <div className="flex justify-center py-12 text-white/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 p-12 text-center text-white/50">
          <UsersIcon size={40} className="text-white/30" />
          <p>لا يوجد مستخدمون مطابقون.</p>
        </GlassCard>
      ) : (
        <>
          <div className="space-y-2">
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <GlassCard className="flex items-center gap-4 p-4">
                  <Avatar discordId={u.discordId} avatar={u.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-white">{u.username}</div>
                    <div className="text-[11px] text-white/40">
                      {u.discordId} · {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  <div className="hidden text-center sm:block">
                    <div className="text-base font-bold text-[#00F5D4]">{u.examCount}</div>
                    <div className="text-[10px] text-white/40">محاولة</div>
                  </div>
                  <button
                    onClick={() => toggleAdmin(u)}
                    data-cursor="hover"
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      u.isAdmin
                        ? 'bg-[#00F5D4]/20 text-[#00F5D4]'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                    title={u.isAdmin ? 'إزالة صلاحية الأدمن' : 'منح صلاحية الأدمن'}
                  >
                    <Shield size={14} />
                    {u.isAdmin ? 'أدمن' : 'مستخدم'}
                  </button>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 disabled:opacity-30"
              >
                السابق
              </button>
              <span className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
                {page} / {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 disabled:opacity-30"
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Avatar({
  discordId,
  avatar,
}: {
  discordId: string
  avatar: string | null
}) {
  const url = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.${
        avatar.startsWith('a_') ? 'gif' : 'png'
      }?size=128`
    : discordId.startsWith('demo_')
    ? `https://api.dicebear.com/9.x/identicon/svg?seed=${discordId}`
    : 'https://cdn.discordapp.com/embed/avatars/0.png'
   
  return (
    <img
      src={url}
      alt="avatar"
      className="h-10 w-10 rounded-full ring-2 ring-[#00F5D4]/30"
    />
  )
}
