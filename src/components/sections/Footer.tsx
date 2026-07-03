'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Instagram, Youtube, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/[0.06] bg-[#050505]/60 backdrop-blur-sm">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,245,212,0.35), transparent)',
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col items-start gap-3">
            <Image
              src="/gx-logo-transparent.webp"
              alt="GenerationX Roleplay"
              width={96}
              height={46}
              style={{ width: '6rem', height: 'auto' }}
            />
            <p className="text-sm leading-relaxed text-white/55">
              GenerationX Roleplay — تجربة رول بلاي فاخرة داخل عالم FiveM.
              نبني مدينة بحب وشغف ليجدها كل لاعب عربي مكاناً يستحق البقاء فيه.
            </p>
            <div className="flex items-center gap-2.5">
              <SocialIcon href={process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg/gx-rp'} label="Discord">
                <MessageCircle size={16} />
              </SocialIcon>
              <SocialIcon href="https://tiktok.com/@generationx" label="TikTok">
                <TiktokIcon />
              </SocialIcon>
              <SocialIcon href="https://instagram.com/generationx" label="Instagram">
                <Instagram size={16} />
              </SocialIcon>
              <SocialIcon href="https://youtube.com/@generationx" label="YouTube">
                <Youtube size={16} />
              </SocialIcon>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2 md:items-center">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#00F5D4]">
              روابط سريعة
            </h4>
            <FooterLink href="#hero">الرئيسية</FooterLink>
            <FooterLink href="#about">من نحن</FooterLink>
            <FooterLink href="#store">المتجر</FooterLink>
            <FooterLink href="#streamers">الستريمرز</FooterLink>
          </div>

          {/* Server info */}
          <div className="flex flex-col gap-2 md:items-end md:text-right">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#00F5D4]">
              معلومات السيرفر
            </h4>
            <div className="flex flex-col gap-1.5 text-sm text-white/55">
              <span>الحالة: <span className="text-[#00F5D4]">● متصل 24/7</span></span>
              <span>المنطقة: الشرق الأوسط</span>
              <span>اللغة: العربية</span>
              <span>الإصدار: GenerationX v5.0</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-5 sm:flex-row"
        >
          <p className="text-center text-xs text-white/35">
            حقوق النشر © {new Date().getFullYear()} GenerationX Roleplay — جميع الحقوق محفوظة.
          </p>
          <p className="text-xs text-white/35">
            صُمم بشغف لمجتمع الرول بلاي العربي
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      data-cursor="hover"
      className="text-sm text-white/55 transition-colors hover:text-[#00F5D4]"
    >
      {children}
    </a>
  )
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <motion.a
      whileHover={{ y: -1 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      data-cursor="hover"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/60 transition-colors hover:border-[#00F5D4]/40 hover:text-[#00F5D4]"
    >
      {children}
    </motion.a>
  )
}

function TiktokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
    </svg>
  )
}
