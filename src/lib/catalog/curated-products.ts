export type CuratedCategory = "butsa" | "forma" | "top" | "anjom" | "fitness" | "sumka";

export type CuratedProduct = {
  id?: string;
  slug: string;
  name: string;
  kicker: string;
  category: CuratedCategory;
  price: number;
  image: string;
  badge?: string;
  description: string;
};

export const categoryLabels: Record<CuratedCategory, string> = {
  butsa: "Butsalar",
  forma: "Formalar",
  top: "To‘plar",
  anjom: "Anjomlar",
  fitness: "Fitness",
  sumka: "Sumka va kiyim",
};

export const curatedProducts: CuratedProduct[] = [
  { slug:"velocity-pro-fg", name:"FS Velocity Pro FG", kicker:"Tezlik uchun professional butsa", category:"butsa", price:1199000, image:"/catalog/boot-speed-white.webp", badge:"Bestseller", description:"Yengil korpus, agressiv tishlar va tez burilishlar uchun ishonchli tayanch." },
  { slug:"control-elite-fg", name:"FS Control Elite FG", kicker:"To‘p nazorati uchun", category:"butsa", price:1049000, image:"/catalog/boot-control-black.webp", badge:"Pro", description:"Yumshoq ustki qatlam va barqaror taglik — har bir teginishda aniq nazorat." },
  { slug:"cobalt-speed-fg", name:"FS Cobalt Speed FG", kicker:"Maydon uchun tezkor model", category:"butsa", price:899000, image:"/catalog/boot-cobalt.webp", description:"Dinamik siluet, mustahkam poshna va tabiiy maydon uchun universal tishlar." },
  { slug:"indoor-pro", name:"FS Indoor Pro", kicker:"Futzal va zal uchun", category:"butsa", price:749000, image:"/catalog/futsal-indoor-white.webp", badge:"Yangi", description:"Sirpanmaydigan taglik va zalda tez harakatlanish uchun past profil." },
  { slug:"match-kit-black", name:"FS Match Kit Black", kicker:"Uy o‘yin formasi", category:"forma", price:649000, image:"/catalog/kit-pro-black.webp", badge:"Yangi", description:"Nafas oladigan mato, futbolka va shortikdan iborat premium o‘yin komplekti." },
  { slug:"away-kit-white", name:"FS Away Kit White", kicker:"Safar o‘yin formasi", category:"forma", price:629000, image:"/catalog/kit-away-white.webp", description:"Yengil oq mato va kontrast detallarda zamonaviy jamoaviy ko‘rinish." },
  { slug:"cobalt-team-kit", name:"FS Cobalt Team Kit", kicker:"Jamoaviy forma", category:"forma", price:599000, image:"/catalog/kit-cobalt.webp", description:"Mashg‘ulot va o‘yin uchun erkin bichimdagi to‘liq futbol komplekti." },
  { slug:"guardian-gk-kit", name:"FS Guardian GK Kit", kicker:"Darvozabonlar uchun", category:"forma", price:799000, image:"/catalog/kit-goalkeeper.webp", badge:"Pro", description:"Uzun yeng, elastik mato va harakatga xalaqit bermaydigan darvozabon formasi." },
  { slug:"elite-match-ball", name:"FS Elite Match Ball", kicker:"Professional futbol to‘pi", category:"top", price:389000, image:"/catalog/ball-match-black.webp", badge:"Top", description:"Barqaror uchish trayektoriyasi va aniq zarba uchun termal panelli match to‘pi." },
  { slug:"training-ball", name:"FS Training Ball", kicker:"Kundalik mashg‘ulot uchun", category:"top", price:249000, image:"/catalog/ball-training-white.webp", description:"Chidamli qoplama va mashg‘ulotlarda uzoq xizmat qiladigan konstruktsiya." },
  { slug:"guardian-gloves", name:"FS Guardian Gloves", kicker:"Darvozabon qo‘lqopi", category:"anjom", price:449000, image:"/catalog/gloves-goalkeeper.webp", description:"Kaftda kuchli grip, bilakda mahkam fiksatsiya va zarbani yumshatuvchi qatlam." },
  { slug:"pro-shin-guards", name:"FS Pro Shin Guards", kicker:"Yengil himoya", category:"anjom", price:189000, image:"/catalog/guards-shin.webp", description:"Oyoqqa mos ergonomik shakl va minimal vaznda ishonchli himoya." },
  { slug:"adjustable-dumbbells", name:"FS Adjustable Dumbbells", kicker:"2 × 24 kg tizim", category:"fitness", price:2499000, image:"/catalog/dumbbells-adjustable.webp", badge:"Premium", description:"Bir burilishda vaznni almashtiring — uy mashg‘ulotlari uchun ixcham kuch stansiyasi." },
  { slug:"pro-kettlebell", name:"FS Pro Kettlebell", kicker:"16 kg funksional kuch", category:"fitness", price:549000, image:"/catalog/kettlebell-pro.webp", description:"Muvozanatli og‘irlik va keng tutqich — swing, squat va core mashqlari uchun." },
  { slug:"resistance-system", name:"FS Resistance System", kicker:"5 darajali tasma to‘plami", category:"fitness", price:329000, image:"/catalog/bands-resistance.webp", description:"Uyda yoki safarda butun tana mashg‘uloti uchun universal qarshilik tizimi." },
  { slug:"core-roller-set", name:"FS Core Roller Set", kicker:"Press va kardio to‘plami", category:"fitness", price:279000, image:"/catalog/ab-roller.webp", description:"Ikki g‘ildirakli roller va sakrash arqoni bilan ixcham mashg‘ulot komplekti." },
  { slug:"undeniable-duffel", name:"FS Undeniable 60L", kicker:"Katta sport sumkasi", category:"sumka", price:699000, image:"/catalog/bag-duffel.webp", badge:"Bestseller", description:"Oyoq kiyim bo‘limi, mustahkam tutqich va bir kunlik mashg‘ulot uchun yetarli hajm." },
  { slug:"technical-backpack", name:"FS Technical Backpack", kicker:"Shahar va sport uchun", category:"sumka", price:579000, image:"/catalog/bag-backpack.webp", description:"Noutbuk bo‘limi, ventilyatsiyali orqa qism va ergonomik yelkali ryukzak." },
  { slug:"pro-compression", name:"FS Pro Compression", kicker:"Termo longsliv", category:"sumka", price:479000, image:"/catalog/top-compression.webp", badge:"Yangi", description:"Terni tez chiqaradigan elastik mato va mushaklarni qo‘llab turuvchi bichim." },
  { slug:"motion-tracksuit", name:"FS Motion Tracksuit", kicker:"Yengil sport kostyumi", category:"sumka", price:899000, image:"/catalog/tracksuit-pro.webp", description:"Shamoldan himoya qiluvchi kurtka va erkin harakat uchun tapered shim." },
];

export const formatUzs = (price: number) => `${new Intl.NumberFormat("uz-UZ").format(price)} so‘m`;
