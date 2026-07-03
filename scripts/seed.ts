/**
 * Seed the GenerationX database with default data:
 *  - Admin + demo user
 *  - Exam categories + 20 questions
 *  - 7 Kick streamers
 *  - 6 product categories + 10 products (from uploaded images)
 *  - Payment settings defaults
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()
const ADMIN_DISCORD_ID = '000000000000000001'

async function main() {
  // ===== Users =====
  await db.user.upsert({
    where: { discordId: ADMIN_DISCORD_ID },
    update: { isAdmin: true },
    create: {
      discordId: ADMIN_DISCORD_ID,
      username: 'GenerationX Admin',
      discriminator: '0001',
      email: 'admin@generationx.gg',
      isAdmin: true,
    },
  })

  await db.user.upsert({
    where: { discordId: '000000000000000002' },
    update: {},
    create: {
      discordId: '000000000000000002',
      username: 'Guest Player',
      discriminator: '0002',
      email: 'guest@generationx.gg',
      isAdmin: false,
    },
  })

  // ===== Exam categories =====
  const catRP = await db.category.upsert({
    where: { name: 'قواعد الرول بلاي' },
    update: {},
    create: { name: 'قواعد الرول بلاي', color: '#00F5D4', order: 0 },
  })
  const catCity = await db.category.upsert({
    where: { name: 'قوانين المدينة' },
    update: {},
    create: { name: 'قوانين المدينة', color: '#5b8cff', order: 1 },
  })
  const catCombat = await db.category.upsert({
    where: { name: 'القتال والسلاح' },
    update: {},
    create: { name: 'القتال والسلاح', color: '#ef476f', order: 2 },
  })
  const catTraffic = await db.category.upsert({
    where: { name: 'المرور والمركبات' },
    update: {},
    create: { name: 'المرور والمركبات', color: '#ffd166', order: 3 },
  })

  // ===== Questions =====
  const questions = [
    { text: 'ما معنى الميتا جيمنج (Meta Gaming)؟', A: 'استخدام معلومات من خارج اللعبة لصالح شخصيتك', B: 'لعب لعبة أخرى أثناء الرول بلاي', C: 'كتابة شات طويل', D: 'تغيير الشخصية بسرعة', correct: 'A', cat: catRP.id, exp: 'الميتا جيمنج ممنوع لأنه يكسر واقعية التجربة.' },
    { text: 'ما هو الـ RDM (Random Deathmatch)؟', A: 'سباق سيارات عشوائي', B: 'قتل لاعبين عشوائي بدون سبب رول بلاي', C: 'توزيع أموال عشوائي', D: 'موت مفاجئ بسبب البق', correct: 'B', cat: catRP.id, exp: 'RDM هو قتل عشوائي وممنوع تماماً في المدينة.' },
    { text: 'ما هو الـ VDM (Vehicle Deathmatch)؟', A: 'سباق بالمركبات', B: 'استخدام مركبة لدهس اللاعبين عشوائياً', C: 'إصلاح مركبة', D: 'بيع مركبة', correct: 'B', cat: catRP.id, exp: 'VDM ممنوع ويعتبر كسر لقواعد الرول بلاي.' },
    { text: 'ما هو الـ Power Gaming؟', A: 'استخدام قوة خارقة', B: 'إجبار لاعب آخر على موقف غير واقعي أو استخدام ميكانيكا اللعبة بشكل غير منطقي', C: 'اللعب بقوة', D: 'كسب كل المباريات', correct: 'B', cat: catRP.id, exp: 'Power Gaming يضر بالتجربة الواقعية للجميع.' },
    { text: 'هل يجوز قتل ضابط شرطة بدون سبب رول بلاي؟', A: 'نعم دائماً', B: 'فقط في الليل', C: 'لا، يجب وجود سبب رول بلاي واضح', D: 'فقط إذا كان وحده', correct: 'C', cat: catRP.id, exp: 'القتل بدون سبب رول بلاي يعتبر RDM.' },
    { text: 'ماذا تفعل إذا تم إيقافك من قبل شرطة المدينة؟', A: 'تهرب فوراً بأقصى سرعة', B: 'تتعاون وتتبع التعليمات الرول بلاي', C: 'تطلق النار مباشرة', D: 'تسجل خروج من السيرفر', correct: 'B', cat: catCity.id, exp: 'التعاون مع الشرطة يحافظ على واقعية المدينة.' },
    { text: 'ما الحد الأقصى للسرعة داخل المدينة المأهولة؟', A: 'لا يوجد', B: '50 كم/س تقريباً وفق اللوحات', C: '200 كم/س', D: '120 كم/س', correct: 'B', cat: catTraffic.id, exp: 'يجب احترام لوحات السرعة لتفادي المخالفات.' },
    { text: 'أين يجوز وقوف المركبة بشكل صحيح؟', A: 'في منتصف الطريق', B: 'في الأماكن المخصصة فقط', C: 'على الأرصفة دائماً', D: 'أمام المنازل مباشرة', correct: 'B', cat: catTraffic.id, exp: 'الوقوف الخاطئ قد يؤدي إلى سحب المركبة من قبل البلدية.' },
    { text: 'هل يجوز استخدام السلاح داخل المستشفى؟', A: 'نعم', B: 'فقط في حال الطوارئ', C: 'لا، المناطق الآمنة ممنوع فيها السلاح', D: 'فقط للحراس', correct: 'C', cat: catCombat.id, exp: 'المستشفيات والمباني الحكومية مناطق آمنة (Green Zone).' },
    { text: 'ما هي عقوبة الـ Fear RP إذا أُمسكت تحت تهديد السلاح؟', A: 'لا شيء', B: 'يجب أن تتصرف بخوف واقعي وتمتثل للمطالب', C: 'تستطيع الهجوم', D: 'تستطيع الهرب بأي ثمن', correct: 'B', cat: catRP.id, exp: 'Fear RP يعني احترام التهديد والتصرف بواقعية.' },
    { text: 'ماذا يعني مصطلح NVL (No Value of Life)؟', A: 'عدم احترام حياة الشخصية', B: 'لعب بدون أسلحة', C: 'عدم وجود لاج', D: 'لعب لمدة قصيرة', correct: 'A', cat: catRP.id, exp: 'NVL يحدث عندما لا يهتم اللاعب بحياة شخصيته في موقف مميت.' },
    { text: 'هل يجوز سرقة سيارة شرطة أثناء مطاردة؟', A: 'نعم دائماً', B: 'فقط إذا كانت فارغة وبدون سبب رول بلاي قوي', C: 'لا يجوز', D: 'فقط في الليل', correct: 'C', cat: catCity.id, exp: 'سرقة مركبات الطوارئ ممنوعة لكسرها الواقعية.' },
    { text: 'ما الموقف الصحيح عند رؤية حادث مروري؟', A: 'التجاهل والاستمرار', B: 'إيقاف مركبتك والاتصال بالطوارئ', C: 'أخذ صور ومغادرة', D: 'السخرية من السائقين', correct: 'B', cat: catCity.id, exp: 'التصرف الواقعي يبقي التجربة حية.' },
    { text: 'ما هي مدة جلسة الرول بلاي المثالية لكل موقف؟', A: '5 ثواني', B: 'مدة كافية لإنهاء الموقف بصدق', C: 'ساعة كاملة دائماً', D: 'لا يهم', correct: 'B', cat: catRP.id, exp: 'الموقف الرول بلاي يجب أن يأخذ وقته المناسب.' },
    { text: 'هل يجوز إعادة إحياء شخصيتك بعد الموت في نفس الموقف؟', A: 'نعم فوراً', B: 'لا، يجب احترام قاعدة NLR (New Life Rule)', C: 'فقط بصلاحيات الأدمن', D: 'فقط إذا كنت VIP', correct: 'B', cat: catRP.id, exp: 'NLR تمنع العودة لمكان الموت ومعرفة تفاصيله.' },
    { text: 'ما معنى FailRP؟', A: 'فشل في اللعبة', B: 'كسر قواعد الرول بلاي عمداً أو جهلاً', C: 'انقطاع الإنترنت', D: 'مشكلة في السكربت', correct: 'B', cat: catRP.id, exp: 'FailRP يشمل أي تصرف غير واقعي يضر بالتجربة.' },
    { text: 'هل يجوز طلب المساعدة من الأدمن في موقف رول بلاي؟', A: 'نعم في كل وقت', B: 'فقط لكسر القاعدة أو مشكلة تقنية', C: 'لا أبداً', D: 'فقط في النهار', correct: 'B', cat: catRP.id, exp: 'الأدمن يتدخل فقط لكسر القاعدة وليس لصالحك.' },
    { text: 'ما العقوبة المتوقعة على المخدرات داخل المدينة؟', A: 'لا شيء', B: 'مخالفة مرورية', C: 'ملاحقة قانونية وفق قوانين المدينة', D: 'خصم رصيد فقط', correct: 'C', cat: catCity.id, exp: 'التعامل بالمخدرات جريمة داخل المدينة.' },
    { text: 'كيف تتصرف عند إطلاق نار قربك وأنت أعزل؟', A: 'تطلق النار', B: 'تهرب وتختبئ وتبلغ الطوارئ', C: 'تتحدى المهاجم', D: 'تتجاهل', correct: 'B', cat: catCombat.id, exp: 'التصرف الواقعي يحفظ حياتك وحياة الآخرين.' },
    { text: 'ما الإجراء الصحيح عند شراء مركبة من الوكالة؟', A: 'سرقتها', B: 'الدفع واستلام المستندات والتأمين', C: 'طلبها مجاناً', D: 'استئجارها بدون عقد', correct: 'B', cat: catTraffic.id, exp: 'الإجراءات الرسمية تحفظ ملكيتك للمركبة.' },
  ]

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    await db.question.upsert({
      where: { id: `seed-q-${i + 1}` },
      update: {
        text: q.text,
        optionA: q.A,
        optionB: q.B,
        optionC: q.C,
        optionD: q.D,
        correct: q.correct,
        categoryId: q.cat,
        explanation: q.exp,
        enabled: true,
        order: i,
        timeLimit: 60,
      },
      create: {
        id: `seed-q-${i + 1}`,
        text: q.text,
        optionA: q.A,
        optionB: q.B,
        optionC: q.C,
        optionD: q.D,
        correct: q.correct,
        categoryId: q.cat,
        explanation: q.exp,
        enabled: true,
        order: i,
        timeLimit: 60,
      },
    })
  }

  // ===== Streamers (Kick) =====
  const streamers = [
    { name: 'Rayder TV', slug: 'rayder-tv', desc: 'بثوث مباشرة لأجمل لحظات الرول بلاي في مدينة GenerationX.' },
    { name: 'Abu Ghadab', slug: 'abughadabb', desc: 'مغامرات يومية داخل المدينة وقصص رول بلاي مشوقة.' },
    { name: 'Loay Huda', slug: 'loay_huda', desc: 'ستريمر محترف يقدم محتوى رول بلاي هادف وممتع.' },
    { name: 'Abu Fayez', slug: '1abufayez1', desc: 'محتوى يومي من قلب مدينة GenerationX.' },
    { name: 'Xaaim', slug: 'imxaaim', desc: 'لقطات مضحكة وأكشن داخل المدينة.' },
    { name: 'Zinghu', slug: 'zinghu', desc: 'تجربة رول بلاي سينمائية بأسلوب فريد.' },
    { name: 'Kharashka', slug: 'kharashka', desc: 'مغامرات لا تنتهي داخل عالم GenerationX.' },
  ]
  for (let i = 0; i < streamers.length; i++) {
    const s = streamers[i]
    await db.streamer.upsert({
      where: { kickSlug: s.slug },
      update: {},
      create: {
        id: `seed-streamer-${i + 1}`,
        name: s.name,
        kickSlug: s.slug,
        kickUrl: `https://kick.com/${s.slug}`,
        description: s.desc,
        order: i,
        enabled: true,
      },
    })
  }

  // ===== Product categories =====
  const catDefs = [
    { name: 'VIP Cars', slug: 'vip-cars', order: 0 },
    { name: 'VIP Peds', slug: 'vip-peds', order: 1 },
    { name: 'VIP Packages', slug: 'vip-packages', order: 2 },
    { name: 'Properties', slug: 'properties', order: 3 },
    { name: 'Weapons', slug: 'weapons', order: 4 },
    { name: 'Special Items', slug: 'special-items', order: 5 },
  ]
  const catMap: Record<string, string> = {}
  for (const c of catDefs) {
    const created = await db.productCategory.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
    catMap[c.slug] = created.id
  }

  // ===== Products (from uploaded images) =====
  const products = [
    { name: 'VIP Car', desc: 'سيارة VIP حصرية متاحة للاستخدام الفوري داخل المدينة.', price: 50, catSlug: 'vip-cars', badge: 'سيارة', image: '/products/vip-car.webp' },
    { name: 'VIP Villa', desc: 'فيلا VIP فاخرة مع مرافق خاصة داخل أرقى أحياء المدينة.', price: 70, catSlug: 'properties', badge: 'عقار', image: '/products/vip-villa.webp' },
    { name: 'VIP Personal Pack', desc: 'حزمة شخصية VIP تشمل: سيارة VIP + فيلا VIP + سلاح VIP.', price: 120, catSlug: 'vip-packages', badge: 'الأكثر طلباً', image: '/products/vip-pack.webp' },
    { name: 'VIP Gang', desc: 'حزمة عصابة VIP: فيلا/منزل عصابة + شخصية قائد + 3 سيارات + 5 VIP.', price: 200, catSlug: 'vip-packages', badge: 'حصرية', image: '/products/vip-gang.webp' },
    { name: 'VIP Weapon', desc: 'سلاح VIP حصري مع رخصة حمل دائمة داخل المدينة.', price: 35, catSlug: 'weapons', badge: 'سلاح', image: '/products/vip-weapon.webp' },
    { name: 'VIP PED (1 Of 1)', desc: 'شخصية VIP فريدة من نوعها — تتوفر نسخة واحدة فقط.', price: 50, catSlug: 'vip-peds', badge: 'واحدة فقط', image: '/products/vip-ped-1of1.webp' },
    { name: 'VIP Storage', desc: 'تخزين VIP في أي موقع تختاره داخل المدينة.', price: 10, catSlug: 'vip-packages', badge: 'تخزين', image: '/products/vip-storage.webp' },
    { name: 'Second Character', desc: 'افتح شخصية ثانية إضافية لحسابك داخل المدينة.', price: 25, catSlug: 'vip-peds', badge: 'شخصية', image: '/products/second-character.webp' },
    { name: 'Special Car Plate', desc: 'لوحة سيارة خاصة برقم مميز تختاره أنت.', price: 10, catSlug: 'special-items', badge: 'مميز', image: '/products/special-car-plate.webp' },
    { name: 'Special Phone Number', desc: 'رقم هاتف خاص ومميز داخل شبكة المدينة.', price: 20, catSlug: 'special-items', badge: 'هاتف', image: '/products/special-phone-number.webp' },
  ]
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    await db.product.upsert({
      where: { id: `seed-product-${i + 1}` },
      update: {},
      create: {
        id: `seed-product-${i + 1}`,
        name: p.name,
        description: p.desc,
        price: p.price,
        currency: 'USD',
        image: p.image,
        badge: p.badge,
        order: i,
        enabled: true,
        categoryId: catMap[p.catSlug],
      },
    })
  }

  // ===== Payment settings defaults =====
  await db.paymentSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      paypalEmail: 'payments@generationx.gg',
      bankName: 'Bank of GenerationX',
      bankAccountName: 'GenerationX Roleplay',
      bankAccountNumber: '000000000000',
      bankIban: 'GB00 BANK 0000 0000 0000 00',
      bankSwift: 'BANKGB00',
      cardProvider: 'stripe',
      cardProviderKey: '',
      currency: 'USD',
      taxPercent: 0,
      enabled: true,
    },
  })

  console.log('Seed complete: 2 users, 20 questions, 7 Kick streamers, 6 categories, 10 products, payment settings.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
