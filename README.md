# GenerationX Roleplay — Website

موقع GenerationX Roleplay الكامل — تجربة رول بلاي فاخرة داخل عالم FiveM.

## التقنيات

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM (SQLite — قابل للترحيل إلى PostgreSQL)
- **Auth:** Discord OAuth2 + التحقق من المواطنة (Citizen Verification)
- **Animations:** Framer Motion
- **Realtime:** mini-service لاستطلاع حالة البث على Kick كل 60 ثانية
- **Deployment:** جاهز للنشر على Vercel

## التثبيت المحلي

```bash
# 1. تثبيت الحزم
bun install
# أو: npm install

# 2. إعداد متغيرات البيئة
cp .env.example .env
# املأ القيم في .env (راجع القسم التالي)

# 3. إعداد قاعدة البيانات
bun run db:push

# 4. ملء قاعدة البيانات بالبيانات الأولية
bun run seed

# 5. تشغيل السيرفر
bun run dev
```

ثم افتح `http://localhost:3000`

## متغيرات البيئة (.env)

انسخ `.env.example` إلى `.env` واملأ القيم التالية:

```env
# قاعدة البيانات
DATABASE_URL="file:./db/custom.db"
# للإنتاج على Vercel، استخدم PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# Discord OAuth2 (من https://discord.com/developers/applications)
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."

# Discord Server (Guild)
DISCORD_GUILD_ID="..."                    # ID سيرفر GenerationX
DISCORD_VERIFIED_ROLE_ID="..."            # ID دور الـ Verified Citizen

# Admin
ADMIN_DISCORD_ID="..."                    # Discord ID الخاص بصاحب السيرفر

# Discord Bot Token (اختياري — لفحص أدوار الأعضاء بدقة)
DISCORD_BOT_TOKEN="..."

# رابط دعوة الديسكورد (يظهر في الموقع)
NEXT_PUBLIC_DISCORD_INVITE="https://discord.gg/gx-rp"

# رابط الموقع (اختياري — يُكتشف تلقائياً)
# NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### كيفية الحصول على القيم

1. **DISCORD_CLIENT_ID + SECRET:**
   - اذهب إلى https://discord.com/developers/applications
   - أنشئ تطبيقاً جديداً → تبويب OAuth2 → انسخ Client ID و Client Secret
   - في تبويب OAuth2 → Redirects، أضف:
     - `http://localhost:3000/api/auth/discord` (للتطوير)
     - `https://yourdomain.com/api/auth/discord` (للإنتاج)

2. **DISCORD_GUILD_ID:**
   - فعّل Developer Mode في إعدادات ديسكورد (App Settings → Advanced)
   - انقر بالزر الأيمن على اسم سيرفرك → Copy ID

3. **DISCORD_VERIFIED_ROLE_ID:**
   - في إعدادات السيرفر → Roles
   - انقر بالزر الأيمن على دور الـ Verified Citizen → Copy ID

4. **ADMIN_DISCORD_ID:**
   - انقر بالزر الأيمن على اسمك في ديسكورد → Copy ID

5. **DISCORD_BOT_TOKEN (اختياري لكن مُوصى به):**
   - في نفس التطبيق → تبويب Bot → Add Bot
   - انسخ الـ Token
   - فعّل **Server Members Intent** (مهم لفحص الأدوار)
   - ادعُ البوت إلى سيرفرك
   - بدون هذا، يُعتبر مجرد الانضمام للسيرفر تحقيقاً كافياً

## نظام التحقق من المواطنة (Citizen Verification)

عند تسجيل الدخول عبر Discord:

1. نحصل على `access_token` من Discord OAuth2
2. نطلب `/users/@me/guilds` للتحقق من عضوية المستخدم في سيرفر GenerationX
3. إذا كان عضواً، نطلب `/guilds/{guild}/members/{user}` (باستخدام Bot Token) لفحص الأدوار
4. نعرض في واجهة المستخدم:
   - ✅ **Verified Citizen** (شارة خضراء) — إذا كان لديه دور الـ Verified Role
   - ❌ **Not Verified** (شارة حمراء) — إذا لم يكن لديه الدور
   - رسالة تطلب الانضمام للديسكورد — إذا لم يكن عضواً في السيرفر

## النشر على Vercel

1. ارفع المشروع إلى GitHub
2. اذهب إلى https://vercel.com → New Project → اختر المستودع
3. في إعدادات Environment Variables، أضف كل القيم من `.env`
4. للقاعدة بيانات: استخدم [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) أو [Neon](https://neon.tech) أو [Supabase](https://supabase.com)
5. اضغط Deploy

ملاحظات:
- `prisma generate` يُشغّل تلقائياً في `postinstall` و `build`
- الـ callback URL يتكيّف تلقائياً (localhost لل開発، Vercel URL للإنتاج)
- إذا واجهت مشاكل مع الـ callback، عيّن `NEXT_PUBLIC_APP_URL` صراحةً

## بنية المشروع

```
.
├── prisma/
│   └── schema.prisma              # نماذج قاعدة البيانات (9 جداول)
├── public/
│   ├── gx-logo-transparent.webp   # شعار GenerationX (شفاف)
│   ├── gx-logo-transparent.png    # نفس الشعار بصيغة PNG
│   ├── products/                  # صور المنتجات (WebP محسّن)
│   └── streamers/                 # صور بروفائل الستريمرز (من Kick)
├── scripts/
│   ├── seed.ts                    # بيانات أولية
│   ├── optimize-products.ts       # ضغط صور المنتجات
│   ├── update-images.ts           # تحديث صور المنتجات + جلب صور Kick
│   └── make-transparent-logo.ts   # إزالة خلفية الشعار
├── mini-services/
│   └── kick-live-status/          # خدمة استطلاع Kick كل 60 ثانية
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/              # discord OAuth, session, logout, demo-login, status
│   │   │   ├── exam/              # questions, submit, results
│   │   │   ├── admin/             # questions, products, streamers, payments, orders, users, stats
│   │   │   ├── products/          # public products + categories
│   │   │   ├── streamers/         # public streamers
│   │   │   ├── live-status/       # proxy لخدمة Kick
│   │   │   ├── orders/            # إنشاء الطلبات
│   │   │   └── payment-settings/  # public payment info
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/                 # 10 أقسام للوحة الأدمن
│   │   ├── auth/                  # Discord login modal + user menu (with verification badges)
│   │   ├── checkout/              # صفحة الدفع
│   │   ├── cursor/                # مؤشر مخصص
│   │   ├── effects/               # خلفية متحركة
│   │   ├── exam/                  # نظام الاختبار
│   │   ├── nav/                   # شريط التنقل
│   │   ├── sections/              # أقسام الصفحة الرئيسية
│   │   └── ui/                    # عناصر UI
│   └── lib/
│       ├── auth.ts                # Discord OAuth + citizen verification
│       ├── db.ts                  # Prisma client
│       └── store.ts               # Zustand state
├── .env.example                   # قالب متغيرات البيئة
├── vercel.json                    # إعدادات النشر
├── package.json
└── README.md
```

## الميزات

### الصفحة الرئيسية
- Hero سينمائي مع شعار GenerationX الشفاف
- قسم "من نحن" مع إحصائيات متحركة وtimeline
- قسم الستريمرز (Kick) — يكتشف البث المباشر تلقائياً
- متجر مع 10 منتجات و6 تصنيفات
- Footer

### المصادقة + التحقق
- Discord OAuth2 (مع callback URL يتكيّف تلقائياً)
- التحقق من عضوية السيرفر + دور الـ Verified Citizen
- شارة "Verified Citizen" (خضراء) أو "Not Verified" (حمراء) في الـ user menu
- لا loading screen — الموقع يحمّل مباشرة

### الاختبار الإلكتروني
- 20 سؤال من قاعدة البيانات
- مؤقت لكل سؤال + شريط تقدم + نتائج تفصيلية
- حفظ كل المحاولات في قاعدة البيانات

### المتجر + الدفع
- 10 منتجات (VIP Car, VIP Villa, VIP Pack, VIP Gang, VIP Weapon, VIP PED 1Of1, VIP Storage, Second Character, Special Car Plate, Special Phone Number)
- 6 تصنيفات (VIP Cars, VIP Peds, VIP Packages, Properties, Weapons, Special Items)
- صفحة checkout تدعم: PayPal، Visa/Mastercard، تحويل بنكي
- حفظ الطلبات في قاعدة البيانات

### لوحة الأدمن (10 أقسام)
- **لوحة التحكم** — إحصائيات (تشمل عدد المواطنين المُوثّقين)
- **الستريمرز** — CRUD كامل + تفعيل/تعطيل + ترتيب
- **المنتجات** — CRUD + صور + تصنيفات + أسعار
- **المدفوعات** — إعدادات PayPal/Stripe/بنك + إدارة الطلبات
- **الأسئلة** — إدارة أسئلة الاختبار
- **التصنيفات** — تصنيفات الأسئلة
- **المتقدمون** — قائمة المسجلين (مع شارة التوثيق)
- **النتائج** — كل المحاولات
- **المستخدمون** — إدارة الصلاحيات
- **الإعدادات** — معلومات النظام + دليل التهيئة

### خدمة Kick Live Status
- mini-service على port 3030
- يستطلع Kick API كل 60 ثانية
- يحدّث `isLive` و `liveTitle` و `liveViewerCount` في قاعدة البيانات

## الترخيص

© GenerationX Roleplay — جميع الحقوق محفوظة.
