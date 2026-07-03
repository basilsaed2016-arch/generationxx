'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Shield,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

type AuthStatus = {
  discordConfigured: boolean
  demoAvailable: boolean
  guildConfigured: boolean
  roleConfigured: boolean
  botTokenConfigured: boolean
}

export default function AdminSettings() {
  const [status, setStatus] = useState<AuthStatus | null>(null)

  useEffect(() => {
    fetch('/api/auth/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">الإعدادات</h1>
        <p className="mt-1 text-sm text-white/50">
          إعدادات النظام والمعلومات العامة. كل الإعدادات الحساسة تُقرأ من ملف <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#00F5D4]">.env</code>.
        </p>
      </div>

      {/* Auth status */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-white/40">
          حالة المصادقة
        </h2>
        {status ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatusRow
              label="Discord OAuth"
              ok={status.discordConfigured}
              okText="مُهيأ"
              notOkText="غير مُهيأ — الوضع التجريبي مفعّل"
            />
            <StatusRow
              label="Guild ID"
              ok={status.guildConfigured}
              okText="مُهيأ"
              notOkText="غير مُهيأ"
            />
            <StatusRow
              label="Verified Role ID"
              ok={status.roleConfigured}
              okText="مُهيأ"
              notOkText="غير مُهيأ"
            />
            <StatusRow
              label="Bot Token (للتحقق من الأدوار)"
              ok={status.botTokenConfigured}
              okText="مُهيأ"
              notOkText="غير مُهيأ — التحقق من الأدوار غير مفعّل"
            />
          </div>
        ) : (
          <div className="h-24 animate-pulse rounded-xl bg-white/5" />
        )}
      </div>

      {/* Info cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingCard
          icon={Server}
          title="حالة الخادم"
          rows={[
            ['السيرفر', 'يعمل 24/7'],
            ['اللغة', 'العربية (RTL)'],
            ['الإصدار', 'v5.1.0'],
          ]}
        />
        <SettingCard
          icon={Database}
          title="قاعدة البيانات"
          rows={[
            ['النوع', 'SQLite (قابل للترحيل إلى PostgreSQL)'],
            ['الجداول', '9 جداول'],
            ['النسخ الاحتياطي', 'يومي'],
          ]}
        />
        <SettingCard
          icon={Shield}
          title="المصادقة"
          rows={[
            ['الطريقة', 'Discord OAuth2 + التحقق من المواطنة'],
            ['الجلسة', '7 أيام'],
            ['التوثيق', 'تحقق من العضوية + الدور'],
          ]}
        />
        <SettingCard
          icon={SettingsIcon}
          title="الاختبار"
          rows={[
            ['نسبة النجاح', '80%'],
            ['الوقت الافتراضي/سؤال', '60 ثانية'],
            ['المحاولات', 'غير محدودة'],
          ]}
        />
      </div>

      {/* Configuration guide */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center gap-2 text-[#00F5D4]">
            <Info size={16} />
            <h2 className="text-sm font-bold">دليل التهيئة (.env)</h2>
          </div>
          <p className="mb-4 text-xs text-white/60">
            كل القيم التالية تُقرأ من ملف <code className="rounded bg-white/10 px-1.5 py-0.5">.env</code> ولا يتم حفظها في الكود أبداً.
          </p>
          <div className="overflow-hidden rounded-lg border border-white/[0.06]">
            <table className="w-full text-right text-xs">
              <thead className="bg-white/[0.03] text-white/50">
                <tr>
                  <th className="px-3 py-2 font-semibold">المتغيّر</th>
                  <th className="px-3 py-2 font-semibold">الوصف</th>
                  <th className="px-3 py-2 font-semibold">مطلوب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                <EnvRow name="DATABASE_URL" desc="رابط قاعدة البيانات (SQLite أو PostgreSQL)" required />
                <EnvRow name="DISCORD_CLIENT_ID" desc="Client ID من Discord Developer Portal" required />
                <EnvRow name="DISCORD_CLIENT_SECRET" desc="Client Secret من Discord Developer Portal" required />
                <EnvRow name="DISCORD_GUILD_ID" desc="ID سيرفر GenerationX للتحقق من العضوية" required />
                <EnvRow name="DISCORD_VERIFIED_ROLE_ID" desc="ID دور الـ Verified Citizen" required />
                <EnvRow name="ADMIN_DISCORD_ID" desc="Discord ID الخاص بصاحب السيرفر (للوصول للأدمن)" required />
                <EnvRow name="DISCORD_BOT_TOKEN" desc="Bot Token لفحص أدوار الأعضاء (اختياري — بدونها يُعتبر الانضمام للسيرفر تحقيقاً كافياً)" />
                <EnvRow name="NEXT_PUBLIC_APP_URL" desc="رابط الموقع (يُكتشف تلقائياً إن لم يُحدد)" />
                <EnvRow name="NEXT_PUBLIC_DISCORD_INVITE" desc="رابط دعوة الديسكورد الظاهر في الموقع" />
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-lg border border-[#00F5D4]/20 bg-[#00F5D4]/[0.04] p-4">
            <h3 className="mb-2 text-xs font-bold text-[#00F5D4]">خطوات التفعيل:</h3>
            <ol className="space-y-1.5 text-xs text-white/70">
              <li>1. اذهب إلى <a href="https://discord.com/developers/applications" target="_blank" rel="noopener" className="text-[#00F5D4] underline">Discord Developer Portal</a> وأنشئ تطبيقاً جديداً.</li>
              <li>2. انسخ Client ID و Client Secret إلى ملف <code className="rounded bg-white/10 px-1">.env</code>.</li>
              <li>3. في تبويب OAuth2، أضف Redirect URI: <code className="rounded bg-white/10 px-1">http://localhost:3000/api/auth/discord</code> ورابط الإنتاج أيضاً.</li>
              <li>4. فعّل Developer Mode في إعدادات ديسكورد، ثم انسخ Guild ID و Role ID بالزر الأيمن.</li>
              <li>5. (اختياري) أنشئ Bot في نفس التطبيق وانسخ Bot Token لفحص أدوار الأعضاء بدقة.</li>
              <li>6. أعد تشغيل السيرفر — سيعمل الـ OAuth تلقائياً.</li>
            </ol>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

function StatusRow({
  label,
  ok,
  okText,
  notOkText,
}: {
  label: string
  ok: boolean
  okText: string
  notOkText: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-1.5">
        {ok ? (
          <CheckCircle2 size={14} className="text-green-400" />
        ) : (
          <XCircle size={14} className="text-red-400" />
        )}
        <span className={`text-xs font-semibold ${ok ? 'text-green-400' : 'text-red-400'}`}>
          {ok ? okText : notOkText}
        </span>
      </div>
    </div>
  )
}

function SettingCard({
  icon: Icon,
  title,
  rows,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  rows: [string, string][]
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#00F5D4]/20 bg-[#00F5D4]/[0.04]">
          <Icon className="h-4 w-4 text-[#00F5D4]" />
        </div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      <div className="space-y-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between border-b border-white/[0.04] pb-2 text-xs last:border-b-0"
          >
            <span className="text-white/50">{k}</span>
            <span className="font-semibold text-white">{v}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function EnvRow({
  name,
  desc,
  required,
}: {
  name: string
  desc: string
  required?: boolean
}) {
  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="px-3 py-2">
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#00F5D4]">{name}</code>
      </td>
      <td className="px-3 py-2 text-white/70">{desc}</td>
      <td className="px-3 py-2">
        {required ? (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">مطلوب</span>
        ) : (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40">اختياري</span>
        )}
      </td>
    </tr>
  )
}
