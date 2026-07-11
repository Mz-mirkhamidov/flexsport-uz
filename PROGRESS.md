# Flexsport.uz — Holat hisoboti (2026-07-12)

## Qisqacha

Faza 1 (MVP) ning **Fundament (A)** va **Katalog (B)** bosqichlari to'liq tugallandi. Loyiha ishlaydigan holatda: Next.js ilova, to'liq Postgres sxemasi, admin panel, mijoz tomoni (katalog/savat), va rizesport.uz'dan pilot import.

## Infratuzilma

| Narsa | Qiymat |
|---|---|
| GitHub repo | https://github.com/mz-muzaf/flexsport-uz (private) |
| Supabase loyihasi | `uwjwoyvvusigpyccgwbr` — **sizning shaxsiy hisobingizda** (supabase.com/dashboard) |
| Admin login | `saydulla.sm@gmail.com` / `Test123456` (role=admin) |
| Lokal ishga tushirish | `.env.local` allaqachon to'ldirilgan (Supabase URL/kalitlar, Telegram bot token/chat ID). `npm run dev` |
| Payme | Hali sozlanmagan — `PAYME_MERCHANT_ID`/`PAYME_MERCHANT_KEY` bo'sh |

**Muhim eslatma:** Loyiha boshida Supabase MCP ulanishi orqali yaratilgan birinchi loyiha (`emvsfmnxynnvndplldat`) sizning shaxsiy hisobingizga tegishli emas edi. Shuning uchun butun sxema sizning haqiqiy loyihangizga (`uwjwoyvvusigpyccgwbr`) ko'chirildi — `supabase/full_schema.sql` shu loyihaga SQL Editor orqali qo'llandi. Kelgusi migratsiyalar endi shu loyihaga qarab yoziladi (lekin ular ham SQL Editor orqali qo'lda qo'llanishi kerak, chunki Supabase MCP vositam bu loyihaga to'g'ridan-to'g'ri kira olmaydi — faqat oddiy HTTP/REST orqali kira olaman).

## Bajarilgan ishlar

### Faza A — Fundament
- Next.js 16 + TypeScript + Tailwind CSS skeleton, storefront/admin route guruhlari
- To'liq Postgres sxemasi: profiles, categories, brands, products, product_variants, product_images, discounts, reviews, wishlist_items, delivery_zones, settings, orders, order_items, order_status_history, payment_transactions
- RLS barcha jadvallarda yoqilgan, xavfsizlik/performance advisorlar tozalangan
- Email+parol orqali ro'yxatdan o'tish/kirish/chiqish, `/admin` va `/account` route guard (`src/proxy.ts`)

### Faza B — Katalog
- **Admin:** kategoriya CRUD (2 daraja: kategoriya→subkategoriya), mahsulot+variant+rasm CRUD (Supabase Storage'ga yuklash)
- **Mijoz:** bosh sahifa (yangi/bestseller/chegirma bloklari), katalog+filtr (narx/brend/o'lcham/rang/chegirma), qidiruv, mahsulot sahifasi (variant tanlash, qoldiq)
- **Savat:** localStorage-asosli, mahsulot sahifasidan `/cart`gacha to'liq ishlaydi (Faza C'ning bir qismi ham shu yerda bajarildi)
- **Import skripti** (`scripts/import-rizesport.ts`): rizesport.uz'dan kategoriya/mahsulot/variant/rasmni avtomatik ko'chiradi va bazaga yozadi

## Import holati

Pilot sifatida **Basketbol** kategoriyasi to'liq import qilindi:
- 4 subkategoriya (To'plar, Aksessuarlar, Formalar, Stoykalar)
- 60 mahsulot, 114 rasm, 0 xato

**Muhim:** Nomlar/tavsiflar hozircha **ruscha** (manba shunday edi). TZ talabiga ko'ra sayt faqat o'zbek tilida bo'lishi kerak — bu import qilingan 60 ta mahsulotni admin panel orqali qo'lda tahrirlab, o'zbekchaga o'tkazish kerak bo'ladi.

### Ertaga davom etish uchun topilma

Saytning **o'zbekcha versiyasi mavjud**: `https://uz.rizesport.uz` — va u yerda:
- Sarlavha/matnlar o'zbek tilida
- Kategoriya URL'lari lotin-o'zbekcha (masalan `/basketbol`, rus kirillchasi emas)

**Ertangi qadam:** `scripts/import-rizesport.ts`dagi `SITE` konstantasini `https://uz.rizesport.uz`ga o'zgartirib, qolgan kategoriyalarni shu manbadan import qilish kerak — bu rus tilidan tarjima qilish zaruratini yo'qotadi va TZ talabiga to'g'ridan-to'g'ri mos keladi. Skript hozircha faqat rus-kirill URL'lariga moslashtirilgan (`CATEGORY_JOBS` massivi Cyrillic `ruPath` kutadi) — uz-subdomenga o'tkazishda URL formatini (lotin, `/basketbol` kabi) hisobga olib, `transliterate()`/`toSlug()` funksiyalarini soddalashtirish yoki olib tashlash kerak bo'ladi, chunki uz-subdomenda slug allaqachon lotin harflarida.

Qolgan import qilinishi kerak bo'lgan kategoriyalar (TZ'dagi 10 ta asosiy kategoriya bo'yicha, rizesport tuzilishidan moslashtirilgan):
- Futbol (eng katta — ~330 mahsulot, 7 sahifa)
- Fitnes va Trenajyor (Тренажеры: беговые дорожки, силовые тренажеры, велотренажеры va h.k.)
- Yugurish, Tennis, Suzish, Outdoor va Turizm, Velosport, Kiyim-kechak, Aksessuarlar

## Keyingi bosqichlar (rejadagi tartib bo'yicha)

1. **Import davom ettirish** — yuqoridagi kategoriyalar, uz.rizesport.uz orqali
2. **Faza C qoldig'i** — Sevimlilar (wishlist) CRUD, Sharhlar (reviews) CRUD + admin tasdiqlash navbati
3. **Faza D** — Manzillar CRUD, Checkout oqimi, Payme integratsiyasi (JSON-RPC webhook), to'lov-split (mahsulot=Payme, yetkazib berish=naqd)
4. **Faza E** — Admin: buyurtmalar boshqaruvi + Telegram xabarnoma, ombor/kam qoldiq, skidkalar, sozlamalar
5. **Faza F** — Dashboard statistikasi, statik sahifalar, Telegram bot to'liq integratsiyasi, RLS/QA audit, production deploy (Vercel + domen)

## Ochiq savollar / eslatmalar

- Payme merchant hisobi hali ochilmagan (mijoz o'zi ochishi kerak — TZ bo'yicha)
- Import qilingan mahsulotlarda **stock_qty** rizesport'dan aniq olinmagan (default 10/15 qo'yilgan) — real qoldiqni admin panel orqali kiritish kerak
- Brend maydoni faqat ba'zi mahsulotlarda avtomatik aniqlangan, ko'pchiligida bo'sh — qo'lda to'ldirish kerak
- To'liq rejani [C:\Users\LABBE\.claude\plans\mossy-stirring-candle.md](C:\Users\LABBE\.claude\plans\mossy-stirring-candle.md) faylida ko'rish mumkin
