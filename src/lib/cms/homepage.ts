import type { Json } from "@/types/database.types";

export type HeroContent = {
  titleTop: string;
  titleAccent: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
};

export type FeaturedCampaignContent = {
  eyebrow: string;
  heading: string;
  description: string;
  priceLabel: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
};

export type SportFinderContent = {
  eyebrow: string;
  heading: string;
  description: string;
};

export const DEFAULT_HOMEPAGE_CONTENT = {
  hero: {
    titleTop: "Cheksiz kuch.",
    titleAccent: "Sening\no‘yining.",
    subtitle: "Chegaralarni yeng.\nO‘z maqsadingga erish.",
    ctaLabel: "Yangiliklarni ko‘rish",
    ctaHref: "/search",
    imageUrl: "/flexsport-hero-athletes.webp",
    imageAlt: "FlexSport sportchilari",
  } satisfies HeroContent,
  featuredCampaign: {
    eyebrow: "Yangi",
    heading: "FS Pro Compression",
    description: "Yengil. Nafas oladigan. Chegarasiz harakat.",
    priceLabel: "479 000 UZS",
    ctaLabel: "Hozir sotib olish",
    ctaHref: "/search?q=kiyim",
    imageUrl: "/fs-compression.webp",
    imageAlt: "FS Pro Compression sport kiyimi",
  } satisfies FeaturedCampaignContent,
  sportFinder: {
    eyebrow: "SPORT FINDER / 01",
    heading: "Maqsadingizni tanlang.",
    description: "Sizga mos kolleksiyani bir bosishda toping.",
  } satisfies SportFinderContent,
};

function objectContent(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function stringValue(value: Json | undefined, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function resolveHomepageContent(
  sections: Array<{ section_key: string; published_content: Json }> | null,
) {
  const byKey = new Map(sections?.map((section) => [section.section_key, objectContent(section.published_content)]));
  const hero = byKey.get("hero") ?? {};
  const featured = byKey.get("featured-campaign") ?? {};
  const finder = byKey.get("sport-finder") ?? {};

  return {
    hero: Object.fromEntries(
      Object.entries(DEFAULT_HOMEPAGE_CONTENT.hero).map(([key, fallback]) => [
        key,
        stringValue(hero[key], fallback),
      ]),
    ) as HeroContent,
    featuredCampaign: Object.fromEntries(
      Object.entries(DEFAULT_HOMEPAGE_CONTENT.featuredCampaign).map(([key, fallback]) => [
        key,
        stringValue(featured[key], fallback),
      ]),
    ) as FeaturedCampaignContent,
    sportFinder: Object.fromEntries(
      Object.entries(DEFAULT_HOMEPAGE_CONTENT.sportFinder).map(([key, fallback]) => [
        key,
        stringValue(finder[key], fallback),
      ]),
    ) as SportFinderContent,
  };
}
