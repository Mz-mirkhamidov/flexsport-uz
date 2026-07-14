/**
 * Catalog import from uz.rizesport.uz (Uzbek-language mirror — clean Latin
 * slugs, Uzbek copy, no transliteration needed).
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/import-rizesport.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (bypasses RLS for bulk
 * insert + storage upload). Text AND images are copied per explicit
 * site-owner instruction; see the legal note in TZ section 9 about
 * rizesport's own product photography.
 */
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";
import { slugify } from "../src/lib/validation/catalog";

const SITE = "https://uz.rizesport.uz";
const REQUEST_DELAY_MS = 300;
const MAX_PAGES_PER_SUBCATEGORY = 3;

type CategoryJob = {
  parentSlug: string; // our existing top-level category slug
  path: string; // rizesport uz category URL path (Latin, e.g. "futbol_to-plari")
  uzName: string; // subcategory name to create/use in our DB
  uzSlug: string; // subcategory slug in our DB
};

const JOBS: CategoryJob[] = [
  // Futbol
  { parentSlug: "futbol", path: "futbol_formalari", uzName: "Formalar", uzSlug: "futbol-formalar" },
  { parentSlug: "futbol", path: "futbol_butsalari", uzName: "Butsalar", uzSlug: "futbol-butsalar" },
  { parentSlug: "futbol", path: "futbol_to-plari", uzName: "To'plar", uzSlug: "futbol-toplar" },
  { parentSlug: "futbol", path: "futbol_uchun_darvozabon_qo-lqoplari", uzName: "Darvozabon qo'lqoplari", uzSlug: "futbol-darvozabon-qolqoplari" },
  { parentSlug: "futbol", path: "futbol_aksessuarlari", uzName: "Aksessuarlar", uzSlug: "futbol-aksessuarlar" },

  // Basketbol
  { parentSlug: "basketbol", path: "basketbol_to-plari", uzName: "To'plar", uzSlug: "basketbol-toplar" },
  { parentSlug: "basketbol", path: "basketbol_aksessuarlari", uzName: "Aksessuarlar", uzSlug: "basketbol-aksessuarlar" },

  // Fitnes va Trenajyor
  { parentSlug: "fitnes-trenajyor", path: "ko-p_funksiyali_trenajorlar", uzName: "Ko'p funksiyali trenajorlar", uzSlug: "fitnes-kop-funksiyali-trenajorlar" },
  { parentSlug: "fitnes-trenajyor", path: "velotrenajor", uzName: "Velotrenajor", uzSlug: "fitnes-velotrenajor" },
  { parentSlug: "fitnes-trenajyor", path: "elliptik_trenajorlar", uzName: "Elliptik trenajorlar", uzSlug: "fitnes-elliptik-trenajorlar" },
  { parentSlug: "fitnes-trenajyor", path: "erkaklar_fitnesi", uzName: "Erkaklar fitnesi", uzSlug: "fitnes-erkaklar" },
  { parentSlug: "fitnes-trenajyor", path: "ayollar_fitnesi", uzName: "Ayollar fitnesi", uzSlug: "fitnes-ayollar" },
  { parentSlug: "fitnes-trenajyor", path: "gantellar", uzName: "Gantellar", uzSlug: "fitnes-gantellar" },
  { parentSlug: "fitnes-trenajyor", path: "turniklar", uzName: "Turniklar", uzSlug: "fitnes-turniklar" },
  { parentSlug: "fitnes-trenajyor", path: "fitnes_aksessuarlari", uzName: "Aksessuarlar", uzSlug: "fitnes-aksessuarlar" },

  // Yugurish
  { parentSlug: "yugurish", path: "yugurish_yolaklari", uzName: "Yugurish yo'laklari", uzSlug: "yugurish-yolaklari" },

  // Tennis
  { parentSlug: "tennis", path: "tennis_raketkasi", uzName: "Raketkalar", uzSlug: "tennis-raketkalar" },
  { parentSlug: "tennis", path: "tennis_koptogi", uzName: "To'plar", uzSlug: "tennis-toplar" },
  { parentSlug: "tennis", path: "tennis_uchun_aksessuarlar", uzName: "Aksessuarlar", uzSlug: "tennis-aksessuarlar" },
  { parentSlug: "tennis", path: "tennis_krossovkalari", uzName: "Krossovkalar", uzSlug: "tennis-krossovkalar" },

  // Suzish
  { parentSlug: "suzish", path: "suzish_uchun_ko-zoynaklar", uzName: "Ko'zoynaklar", uzSlug: "suzish-kozoynaklar" },
  { parentSlug: "suzish", path: "suzish_qalpoqlari", uzName: "Qalpoqlar", uzSlug: "suzish-qalpoqlar" },
  { parentSlug: "suzish", path: "suzish_uchun_aksessuarlar", uzName: "Aksessuarlar", uzSlug: "suzish-aksessuarlar" },
  { parentSlug: "suzish", path: "erkaklar_plavkasi", uzName: "Plavkalar", uzSlug: "suzish-plavkalar" },

  // Outdoor va Turizm
  { parentSlug: "outdoor-turizm", path: "havo_to-ldirilgan_yotoqlar", uzName: "Yotoqlar", uzSlug: "outdoor-yotoqlar" },
  { parentSlug: "outdoor-turizm", path: "skandinavcha_yurish_tayoqchasi", uzName: "Yurish tayoqchalari", uzSlug: "outdoor-yurish-tayoqchalari" },
  { parentSlug: "outdoor-turizm", path: "baliq_ovlash_uskunalari", uzName: "Baliq ovlash", uzSlug: "outdoor-baliq-ovlash" },

  // Velosport
  { parentSlug: "velosport", path: "bolalar_velosipedlari", uzName: "Bolalar velosipedi", uzSlug: "velosport-bolalar" },
  { parentSlug: "velosport", path: "tog-_velosipedi", uzName: "Tog' velosipedi", uzSlug: "velosport-togli" },
  { parentSlug: "velosport", path: "shahar_velosipedlari", uzName: "Shahar velosipedi", uzSlug: "velosport-shahar" },
  { parentSlug: "velosport", path: "samokatlar", uzName: "Samokatlar", uzSlug: "velosport-samokatlar" },

  // Kiyim-kechak
  { parentSlug: "kiyim-kechak", path: "sport_kiyimlari", uzName: "Sport kiyimlari", uzSlug: "kiyim-sport-kiyimlari" },
  { parentSlug: "kiyim-kechak", path: "futbolkalar", uzName: "Futbolkalar", uzSlug: "kiyim-futbolkalar" },
  { parentSlug: "kiyim-kechak", path: "shortiklar", uzName: "Shortiklar", uzSlug: "kiyim-shortiklar" },
  { parentSlug: "kiyim-kechak", path: "krossovkalar", uzName: "Krossovkalar", uzSlug: "kiyim-krossovkalar" },

  // Aksessuarlar
  { parentSlug: "aksessuarlar", path: "ryukzaklar_va_sumkalar", uzName: "Ryukzak va sumkalar", uzSlug: "aksessuar-ryukzak-sumka" },
  { parentSlug: "aksessuarlar", path: "sport_elektronikasi", uzName: "Sport elektronikasi", uzSlug: "aksessuar-elektronika" },
  { parentSlug: "aksessuarlar", path: "kubkalar", uzName: "Kubkalar", uzSlug: "aksessuar-kubkalar" },
  { parentSlug: "aksessuarlar", path: "medallar", uzName: "Medallar", uzSlug: "aksessuar-medallar" },
];

function toSlug(text: string, fallback: string) {
  const s = slugify(text);
  return s || slugify(fallback);
}

function parsePrice(text: string) {
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(path: string) {
  const url = path.startsWith("http") ? path : `${SITE}/${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FlexsportImportBot/1.0)" },
  });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  await sleep(REQUEST_DELAY_MS);
  return res.text();
}

type ListingProduct = {
  name: string;
  href: string;
  priceText: string;
  imageThumb: string | null;
  stockMax: number | null;
};

function parseListingPage(html: string): ListingProduct[] {
  const $ = cheerio.load(html);
  const items: ListingProduct[] = [];
  $(".shop2-product-item.product-item").each((_, el) => {
    const $el = $(el);
    const nameAnchor = $el.find(".product-name a").first();
    const name = nameAnchor.text().trim();
    const href = nameAnchor.attr("href");
    if (!name || !href) return;
    const priceText = $el.find(".price-current strong").first().text().trim();
    const imageThumb = $el.find(".product-item__image img").attr("src") ?? null;
    const stockAttr = $el.find("input[data-max]").attr("data-max");
    items.push({
      name,
      href,
      priceText,
      imageThumb,
      stockMax: stockAttr ? Number(stockAttr) : null,
    });
  });
  return items;
}

function hasNextPage(html: string, currentPage: number) {
  const $ = cheerio.load(html);
  let found = false;
  $('a[href*="/p/"]').each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const match = href.match(/\/p\/(\d+)/);
    if (match && Number(match[1]) > currentPage) found = true;
  });
  return found;
}

type ProductDetail = {
  name: string;
  description: string;
  images: string[];
  variants: { size: string | null; color: string | null }[];
  priceText: string;
  stockMax: number | null;
};

function parseProductPage(html: string): ProductDetail {
  const $ = cheerio.load(html);
  const name = $(".shop2-product .product-name").first().text().trim();
  const priceText = $(".shop2-product .price-current strong").first().text().trim();

  const anonce = $(".shop2-product .product-anonce").first().text().trim();
  const descParas: string[] = [];
  $("#shop2-tabs-2")
    .find("p, li")
    .each((_, el) => {
      const t = $(el).text().trim();
      if (t) descParas.push(t);
    });
  const description = [anonce, ...descParas].filter(Boolean).join("\n\n");

  const images: string[] = [];
  $(".card-slider__image a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) images.push(href.startsWith("http") ? href : `${SITE}${href}`);
  });

  const variants: { size: string | null; color: string | null }[] = [];
  $(".shop2-product-options .option-item").each((_, el) => {
    const title = $(el).find(".option-title").text().trim().toLowerCase();
    const select = $(el).find("select.additional-cart-params");
    if (select.length === 0) return;
    const isSize = title.includes("o'lcham") || title.includes("razmer") || title.includes("размер");
    const isColor = title.includes("rang") || title.includes("цвет");
    if (!isSize && !isColor) return;
    select.find("option").each((_, opt) => {
      const value = $(opt).text().trim();
      if (!value) return;
      variants.push({
        size: isSize ? value : null,
        color: isColor ? value : null,
      });
    });
  });

  const stockAttr = $("input[data-max]").first().attr("data-max");

  return {
    name,
    description,
    images,
    variants,
    priceText,
    stockMax: stockAttr ? Number(stockAttr) : null,
  };
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY topilmadi. .env.local'ni tekshiring.",
    );
  }
  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const stats = { categories: 0, products: 0, skipped: 0, images: 0, errors: 0 };

  for (const job of JOBS) {
    const { data: parent, error: parentErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", job.parentSlug)
      .single();
    if (parentErr || !parent) {
      console.error(`Ota kategoriya topilmadi: ${job.parentSlug}`, parentErr);
      stats.errors++;
      continue;
    }

    let { data: subcategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", job.uzSlug)
      .maybeSingle();

    if (!subcategory) {
      const { data: created, error: createErr } = await supabase
        .from("categories")
        .insert({ name: job.uzName, slug: job.uzSlug, parent_id: parent.id })
        .select("id")
        .single();
      if (createErr || !created) {
        console.error(`Subkategoriya yaratilmadi: ${job.uzSlug}`, createErr);
        stats.errors++;
        continue;
      }
      subcategory = created;
      stats.categories++;
    }

    console.log(`\n=== ${job.path} -> ${job.parentSlug}/${job.uzName} ===`);

    let page = 1;
    const listingItems: ListingProduct[] = [];
    while (page <= MAX_PAGES_PER_SUBCATEGORY) {
      const path = page === 1 ? job.path : `${job.path}/p/${page}`;
      let html: string;
      try {
        html = await fetchHtml(path);
      } catch (e) {
        console.error(`  Listing sahifasi yuklanmadi: ${path}`, (e as Error).message);
        break;
      }
      const items = parseListingPage(html);
      if (items.length === 0) break;
      listingItems.push(...items);
      if (!hasNextPage(html, page)) break;
      page++;
    }

    console.log(`  ${listingItems.length} ta mahsulot topildi`);

    for (const item of listingItems) {
      try {
        const slug = toSlug(item.name, item.href);

        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) {
          stats.skipped++;
          continue;
        }

        const detailHtml = await fetchHtml(item.href.replace(/^\//, ""));
        const detail = parseProductPage(detailHtml);

        const price = parsePrice(detail.priceText || item.priceText);
        const stock = detail.stockMax ?? item.stockMax ?? 10;

        const { data: product, error: productErr } = await supabase
          .from("products")
          .insert({
            name: detail.name || item.name,
            slug,
            description: detail.description || null,
            category_id: subcategory.id,
            base_price: price,
            tags: [job.uzName],
            is_active: true,
          })
          .select("id")
          .single();
        if (productErr || !product) {
          console.error(`  Mahsulot yaratilmadi: ${item.name}`, productErr);
          stats.errors++;
          continue;
        }

        if (detail.variants.length > 0) {
          const rows = detail.variants.map((v) => ({
            product_id: product.id,
            size: v.size,
            color: v.color,
            stock_qty: stock,
          }));
          await supabase.from("product_variants").insert(rows);
        } else {
          await supabase.from("product_variants").insert({
            product_id: product.id,
            stock_qty: stock,
          });
        }

        const images = detail.images.length > 0
          ? detail.images
          : item.imageThumb
            ? [item.imageThumb.startsWith("http") ? item.imageThumb : `${SITE}${item.imageThumb}`]
            : [];

        let sortOrder = 0;
        for (const imgUrl of images.slice(0, 6)) {
          try {
            const imgRes = await fetch(imgUrl);
            if (!imgRes.ok) continue;
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const ext = imgUrl.split(".").pop()?.split("?")[0] || "jpg";
            const path = `${product.id}/${sortOrder}.${ext}`;
            const { error: uploadErr } = await supabase.storage
              .from("product-images")
              .upload(path, buffer, {
                contentType: imgRes.headers.get("content-type") ?? "image/jpeg",
              });
            if (uploadErr) continue;
            const { data: pub } = supabase.storage
              .from("product-images")
              .getPublicUrl(path);
            await supabase.from("product_images").insert({
              product_id: product.id,
              url: pub.publicUrl,
              sort_order: sortOrder,
            });
            sortOrder++;
            stats.images++;
            await sleep(120);
          } catch (e) {
            console.error(`  Rasm yuklanmadi: ${imgUrl}`, (e as Error).message);
          }
        }

        stats.products++;
        console.log(`  + ${detail.name || item.name} (${price} so'm, ${sortOrder} rasm)`);
      } catch (e) {
        console.error(`  Xato: ${item.name}`, (e as Error).message);
        stats.errors++;
      }
    }
  }

  console.log("\n=== Yakun ===");
  console.log(stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
