# Flexsport.uz — Holat hisoboti (2026-07-14)

## Qisqacha

**Faza 1 (MVP) to'liq tugallandi va production'da jonli.** Mijoz butun jarayonni (ro'yxatdan o'tish → katalog → savat → checkout → Payme to'lov → buyurtma tarixi) xatosiz bajara oladi, admin mahsulot/kategoriya/buyurtma/ombor/skidkani to'liq boshqara oladi.

**🟢 Sayt jonli:** https://flexsport-uz.vercel.app

## Infratuzilma

| Narsa | Qiymat |
|---|---|
| GitHub repo | https://github.com/Mz-mirkhamidov/flexsport-uz (private) — **e'tibor bering:** eski `mz-muzaf` hisobi/repo o'chirilgan, hozir shu yangi hisobda |
| Vercel loyihasi | `flexsport-uz`, `mzmuzaf17-2341's projects` jamoasida, GitHub'ga ulangan (avtomatik CI/CD — har push'da qayta deploy bo'ladi) |
| Production URL | https://flexsport-uz.vercel.app |
| Supabase loyihasi | `uwjwoyvvusigpyccgwbr` — sizning shaxsiy hisobingizda |
| Admin login | `saydulla.sm@gmail.com` (parol sizga oldin aytilgan; role=admin) |
| Lokal ishga tushirish | `.env.local` to'ldirilgan. `npm run dev` |
| Payme | Hali sozlanmagan — `PAYME_MERCHANT_ID`/`PAYME_MERCHANT_KEY` bo'sh. Hozircha checkout'da mock (test) to'lov rejimi ishlaydi |
| Telegram bot | Token va admin guruh chat ID sozlangan, xabarlar ishlaydi |

**Eslatma:** Supabase va Vercel MCP vositalarim ba'zi eski loyihalar (`crmsystem`, `trade-smc`) bilan bir hisobga ulangan — bu sizning haqiqiy hisoblaringiz, chalkashlik yo'q, faqat shuni bilib qo'ying.

## Bajarilgan ishlar (Faza A–F)

- **Fundament:** Next.js 16 + TS + Tailwind, to'liq Postgres sxemasi (16 jadval, RLS bilan), email+parol auth, route guard
- **Katalog:** kategoriya/mahsulot/variant/rasm admin CRUD, katalog+filtr+qidiruv, mahsulot sahifasi
- **Savat/Sevimlilar/Sharhlar:** localStorage savat, sevimlilar toggle, yulduzli sharh + admin tasdiqlash navbati
- **Checkout+Payme:** manzillar CRUD, checkout oqimi (server-side narx/qoldiq qayta tekshiruvi), Payme JSON-RPC webhook (5 metod), to'lov-split (mahsulot=Payme, yetkazib berish=naqd), test (mock) to'lov rejimi
- **Admin operatsiyalar:** buyurtmalar (status o'tish + tarix + Telegram xabar), ombor (kam qoldiq filtri + Telegram ogohlantirish), skidkalar (global/kategoriya/mahsulot), sozlamalar (yetkazib berish narxi, kontakt)
- **Dashboard va statik sahifalar:** savdo statistikasi, top mahsulotlar, statik sahifalar (Biz haqimizda, Yetkazib berish, Qaytarish, Aloqa)
- **Production deploy:** Vercel'ga GitHub orqali ulandi, environment o'zgaruvchilar sozlandi, sayt tasdiqlangan holda ishlamoqda (rasm/ma'lumotlar Supabase'dan to'g'ri yuklanmoqda)

## Import holati — TO'LIQ TUGALLANDI

`uz.rizesport.uz`dan: **731 ta mahsulot, 37 subkategoriya, 1899 ta rasm, 0 xato**, barchasi o'zbek tilida.

**Admin tekshirishi tavsiya etiladigan narsalar:**
- `stock_qty` — rizesport saytidan olingan, real qoldiqni Ombor bo'limida tekshiring
- Brend maydoni ko'p mahsulotda bo'sh
- Har bir subkategoriyada ~150 tagacha mahsulot import qilindi (`scripts/import-rizesport.ts`)

## Qolgan ixtiyoriy qadamlar

1. **Domen (`flexsport.uz`)** — Vercel'ning domen ro'yxatga oluvchisi `.uz` zonani qo'llab-quvvatlamaydi (bu ccTLD, mahalliy registrator kerak — masalan cctld.uz yoki O'zbekistondagi domen provayderlari orqali sotib olinadi). Domenni sotib olgach, Vercel loyihasi → **Settings → Domains**da qo'shib, DNS yozuvlarini (A/CNAME) registrator panelida sozlaysiz. Tayyor bo'lganda `NEXT_PUBLIC_SITE_URL`ni ham yangilab, qayta deploy qilish kerak.
2. **Payme production** — haqiqiy merchant hisobi ochilgach, `PAYME_MERCHANT_ID`/`PAYME_MERCHANT_KEY`ni Vercel environment variables'ga qo'shing va Payme kabinetida webhook manzilini (`https://flexsport-uz.vercel.app/api/payme/webhook`, keyinchalik `https://flexsport.uz/api/payme/webhook`) ro'yxatdan o'tkazing.
3. **Supabase Advisors** — vaqti-vaqti bilan dashboard → Advisors bo'limini tekshirib turish tavsiya etiladi.

## Boshqa eslatmalar

- To'liq texnik reja: `C:\Users\LABBE\.claude\plans\mossy-stirring-candle.md`
- Test buyurtma (№ FS-1000) bazada qoladi — admin panel orqali xohlasangiz "Bekor qilindi"ga o'zgartirishingiz mumkin
