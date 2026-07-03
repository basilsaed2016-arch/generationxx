'use client'

import { motion } from 'framer-motion'
import { Users, Briefcase, Car, Building2, Code2, Trophy } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import GlassCard from '@/components/ui/GlassCard'

const STATS = [
  { icon: Users, label: 'عدد اللاعبين', value: 18500, suffix: '+' },
  { icon: Briefcase, label: 'عدد الوظائف', value: 42, suffix: '' },
  { icon: Car, label: 'عدد السيارات', value: 320, suffix: '+' },
  { icon: Building2, label: 'عدد الأعمال', value: 18, suffix: '' },
  { icon: Code2, label: 'عدد السكربتات', value: 240, suffix: '+' },
  { icon: Trophy, label: 'سنوات الخبرة', value: 5, suffix: '+' },
]

const TIMELINE = [
  {
    year: '2021',
    title: 'انطلاقة GenerationX',
    desc: 'بدأنا كمجتمع صغير بطموح كبير لبناء سيرفر رول بلاي عربي يواكب المعايير العالمية.',
  },
  {
    year: '2022',
    title: 'إطلاق المدينة الأولى',
    desc: 'افتتحنا أول خريطة سينمائية متكاملة مع أكثر من 30 وظيفة ونظام اقتصاد حقيقي.',
  },
  {
    year: '2023',
    title: 'نظام السكربتات الحصرية',
    desc: 'أطلقنا أكثر من 100 سكربت حصري مطور داخلياً لرفع مستوى الواقعية والاستمتاع.',
  },
  {
    year: '2024',
    title: 'توسع إقليمي',
    desc: 'تجاوزنا 10,000 لاعب نشط شهرياً وأطلقنا نظام الستريمرز الرسمي لدعم صناع المحتوى.',
  },
  {
    year: '2025',
    title: 'الجيل الجديد',
    desc: 'اليوم نقدم أحدث تقنيات السينما داخل اللعبة مع تجربة UI/UX فاخرة لا مثيل لها.',
  },
]

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <SectionHeading
        eyebrow="من نحن"
        title="مدينة بُنيت بشغف لإعادة تعريف الرول بلاي"
        subtitle="نحن لسنا مجرد سيرفر FiveM، نحن مجتمع حقيقي يطمح لتقديم أرقى تجربة رول بلاي عربية على الإطلاق. كل تفصيلة في مدينتنا مصممة لتأخذك إلى عالم آخر."
      />

      {/* Stats grid */}
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <GlassCard className="group h-full p-4 text-center transition-colors hover:border-[#00F5D4]/30">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-[#00F5D4]/20 bg-[#00F5D4]/[0.04]">
                  <Icon className="h-5 w-5 text-[#00F5D4]" />
                </div>
                <div className="text-2xl font-extrabold text-white">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-[11px] text-white/50">{s.label}</div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="mt-20">
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-2xl font-extrabold text-white sm:text-3xl"
        >
          رحلتنا عبر السنوات
        </motion.h3>

        <div className="relative">
          <div
            className="absolute right-[15px] top-0 h-full w-px bg-white/[0.08] md:right-1/2 md:translate-x-1/2"
            aria-hidden
          />
          <div className="space-y-6 md:space-y-10">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className={`relative flex items-start gap-6 pr-10 md:w-1/2 md:pr-0 ${
                  i % 2 === 0
                    ? 'md:ml-auto md:flex-row md:pl-10'
                    : 'md:mr-auto md:flex-row-reverse md:pl-0 md:pr-10'
                }`}
              >
                <div
                  className="absolute top-2 z-10 flex h-3 w-3 items-center justify-center rounded-full bg-[#00F5D4]"
                  style={
                    i % 2 === 0
                      ? { left: '-6px', right: 'auto' }
                      : { right: '-6px', left: 'auto' }
                  }
                />

                <GlassCard className="flex-1 p-5">
                  <div className="mb-1 text-xs font-bold text-[#00F5D4]">{t.year}</div>
                  <h4 className="mb-2 text-lg font-bold text-white">{t.title}</h4>
                  <p className="text-sm leading-relaxed text-white/60">{t.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
