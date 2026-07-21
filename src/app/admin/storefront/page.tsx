import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomepageSectionForm } from "@/components/admin/HomepageSectionForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { resolveHomepageContent } from "@/lib/cms/homepage";

export default async function AdminStorefrontPage() {
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("id")
    .eq("slug", "homepage")
    .single();

  const { data: sections } = page
    ? await supabase
        .from("site_sections")
        .select("section_key, published_content")
        .eq("page_id", page.id)
    : { data: null };

  const content = resolveHomepageContent(sections);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bosh sahifa muharriri"
        subtitle="Matn va rasmlarni almashtiring — saqlanganda real saytda ko‘rinadi"
        action={
          <Link href="/" target="_blank">
            <Button variant="secondary">Saytni ko‘rish</Button>
          </Link>
        }
      />

      <HomepageSectionForm
        sectionKey="hero"
        title="Asosiy banner"
        description="Sayt ochilganda birinchi ko‘rinadigan katta rasm va matnlar."
        imageUrl={content.hero.imageUrl}
        fields={[
          { name: "titleTop", label: "Yuqori sarlavha", value: content.hero.titleTop },
          { name: "titleAccent", label: "Ajratilgan sarlavha", value: content.hero.titleAccent },
          { name: "subtitle", label: "Izoh", value: content.hero.subtitle, kind: "textarea" },
          { name: "ctaLabel", label: "Tugma matni", value: content.hero.ctaLabel },
          { name: "ctaHref", label: "Tugma havolasi", value: content.hero.ctaHref, hint: "/search kabi yozing" },
          { name: "imageAlt", label: "Rasm tavsifi", value: content.hero.imageAlt },
        ]}
      />

      <HomepageSectionForm
        sectionKey="featured-campaign"
        title="Ajratilgan mahsulot banneri"
        description="Yangi mahsulotlar ostidagi katta reklama kartasi."
        imageUrl={content.featuredCampaign.imageUrl}
        fields={[
          { name: "eyebrow", label: "Belgi", value: content.featuredCampaign.eyebrow },
          { name: "heading", label: "Mahsulot nomi", value: content.featuredCampaign.heading },
          { name: "description", label: "Tavsif", value: content.featuredCampaign.description, kind: "textarea" },
          { name: "priceLabel", label: "Ko‘rsatiladigan narx", value: content.featuredCampaign.priceLabel },
          { name: "ctaLabel", label: "Tugma matni", value: content.featuredCampaign.ctaLabel },
          { name: "ctaHref", label: "Tugma havolasi", value: content.featuredCampaign.ctaHref },
          { name: "imageAlt", label: "Rasm tavsifi", value: content.featuredCampaign.imageAlt },
        ]}
      />

      <HomepageSectionForm
        sectionKey="sport-finder"
        title="Sport tanlash bo‘limi"
        description="Katalog kolleksiyalariga olib boradigan yashil bo‘lim matnlari."
        fields={[
          { name: "eyebrow", label: "Kichik sarlavha", value: content.sportFinder.eyebrow },
          { name: "heading", label: "Asosiy sarlavha", value: content.sportFinder.heading },
          { name: "description", label: "Izoh", value: content.sportFinder.description, kind: "textarea" },
        ]}
      />
    </div>
  );
}
