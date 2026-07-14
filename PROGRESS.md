# Flexsport.uz — Holat hisoboti (2026-07-14)

## Qisqacha

**Faza 1 (MVP)ning 10 ta bosqichidan 9 tasi to'liq tugallandi va sinaldi.** Loyiha to'liq ishlaydigan holatda: mijoz butun jarayonni (ro'yxatdan o'tish → katalog → savat → checkout → Payme to'lov → buyurtma tarixi) xatosiz bajara oladi, admin mahsulot/kategoriya/buyurtma/ombor/skidkani to'liq boshqara oladi. Faqat **production'ga chiqarish** (Vercel + domen) qoldi — bu sizning ishtirokingizni talab qiladi.

## Infratuzilma

| Narsa | Qiymat |
|---|---|
| GitHub repo | https://github.com/mz-muzaf/flexsport-uz (private) |
| Supabase loyihasi | `uwjwoyvvusigpyccgwbr` — sizning shaxsiy hisobingizda |
| Admin login | `saydulla.sm@gmail.com` / `Test123456` (role=admin) |
| Lokal ishga tushirish | `.env.local` to'ldirilgan. `npm run dev` |
| Payme | Hali sozlanmagan — `PAYME_MERCHANT_ID`/`PAYME_MERCHANT_KEY` bo'sh. Hozircha checkout'da mock (test) to'lov rejimi ishlaydi |
| Telegram bot | Token va admin guruh chat ID sozlangan, xabarlar ishlaydi |

**Eslatma:** Supabase MCP vositam bu loyihaga to'g'ridan-to'g'ri kira olmaydi (boshqa hisobga ulangan) — faqat oddiy HTTP/REST orqali kira olaman. Kelgusi DB migratsiyalari `supabase/migrations/`ga yoziladi, lekin sizning loyihangizga SQL Editor orqali qo'lda qo'llanishi kerak bo'ladi.

## Bajarilgan ishlar (Faza A–F, deploy'dan tashqari)

- **Fundament:** Next.js 16 + TS + Tailwind, to'liq Postgres sxemasi (16 jadval, RLS bilan), email+parol auth, route guard
- **Katalog:** kategoriya/mahsulot/variant/rasm admin CRUD, katalog+filtr+qidiruv, mahsulot sahifasi
- **Savat/Sevimlilar/Sharhlar:** localStorage savat, sevimlilar toggle, yulduzli sharh + admin tasdiqlash navbati
- **Checkout+Payme:** manzillar CRUD, checkout oqimi (server-side narx/qoldiq qayta tekshiruvi), Payme JSON-RPC webhook (5 metod: CheckPerformTransaction/CreateTransaction/PerformTransaction/CancelTransaction/CheckTransaction), to'lov-split (mahsulot=Payme, yetkazib berish=naqd), test (mock) to'lov rejimi
- **Admin operatsiyalar:** buyurtmalar (status o'tish + tarix + Telegram xabar), ombor (kam qoldiq filtri + Telegram ogohlantirish), skidkalar (global/kategoriya/mahsulot), sozlamalar (yetkazib berish narxi, kontakt)
- **Dashboard va statik sahifalar:** savdo statistikasi (kunlik/oylik/7-kunlik grafik), top mahsulotlar, statik sahifalar (Biz haqimizda, Yetkazib berish, Qaytarish, Aloqa)

Barchasi brauzerda uchidan-uchigacha qo'lda sinaldi (haqiqiy Payme sandbox'siz, chunki merchant hisobi hali yo'q).

## Import holati — TO'LIQ TUGALLANDI

`uz.rizesport.uz` (o'zbekcha manba)dan to'liq import qilindi:
- **731 ta mahsulot, 37 subkategoriya, 1899 ta rasm, 0 xato**
- Barcha 10 asosiy kategoriya qamrab olindi (Futbol, Basketbol, Fitnes va Trenajyor, Yugurish, Tennis, Suzish, Outdoor va Turizm, Velosport, Kiyim-kechak, Aksessuarlar)
- Barcha nom/tavsiflar **o'zbek tilida** (TZ talabiga mos)

**Import qilingandan keyin admin tekshirishi kerak bo'lgan narsalar:**
- `stock_qty` — rizesport saytidagi "amount" maydonidan olingan (ba'zan haqiqiy qoldiqni emas, sayt UI cheklovini aks ettirishi mumkin) — admin panel → Ombor bo'limida real qoldiqni tekshirib/kiritish tavsiya etiladi
- Brend maydoni ko'p mahsulotda bo'sh — kerak bo'lsa qo'lda to'ldiriladi
- Har bir subkategoriya uchun faqat 3 sahifagacha (taxminan 150 tagacha mahsulot) import qilindi — agar biror subkategoriyada bundan ko'p mahsulot bo'lsa, qolgani import qilinmagan (skript `scripts/import-rizesport.ts`dagi `MAX_PAGES_PER_SUBCATEGORY`ni oshirib qayta ishga tushirish mumkin)

## Qolgan yagona bosqich: Production deploy

1. **Domen** — `flexsport.uz` domenini sotib olish (bu moliyaviy tranzaksiya, men bajara olmayman — o'zingiz amalga oshirishingiz kerak)
2. **Vercel** — GitHub repo'ni Vercel'ga ulash (sizning Vercel hisobingiz orqali), environment o'zgaruvchilarini (`.env.local`dagilar) Vercel loyiha sozlamalariga kiritish
3. **Payme production** — haqiqiy merchant hisobi ochilgach, `PAYME_MERCHANT_ID`/`PAYME_MERCHANT_KEY`ni qo'shish va Payme kabinetida webhook manzilini (`https://flexsport.uz/api/payme/webhook`) ro'yxatdan o'tkazish
4. **Supabase Advisors** — loyiha katta bo'lgani sayin, Supabase dashboard → Advisors bo'limini vaqti-vaqti bilan tekshirib turish tavsiya etiladi (men bu loyihaga MCP orqali kira olmayman)

## Boshqa eslatmalar

- To'liq texnik reja: `C:\Users\LABBE\.claude\plans\mossy-stirring-candle.md`
- Test buyurtma (№ FS-1000) bazada qoladi — istasangiz admin panel orqali statusini "Bekor qilindi"ga o'zgartirishingiz yoki shunchaki e'tiborsiz qoldirishingiz mumkin
