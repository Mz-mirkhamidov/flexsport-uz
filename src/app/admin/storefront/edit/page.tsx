import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { HomepageSectionForm } from "@/components/admin/HomepageSectionForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { resolveHomepageContent } from "@/lib/cms/homepage";

export default async function EditStorefrontPage() {
  const supabase = await createClient();
  const { data: page } = await supabase.from("site_pages").select("id").eq("slug", "homepage").single();
  const { data: sections } = page
    ? await supabase.from("site_sections").select("section_key, published_content").eq("page_id", page.id)
    : { data: null };
  const content = resolveHomepageContent(sections);

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-950 md:p-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader
          title="Bosh sahifani tahrirlash"
          subtitle="Kerakli bo‘limni o‘zgartirib, saytda e’lon qiling"
          action={<Link href="/admin/storefront"><Button variant="secondary">Ko‘rinishga qaytish</Button></Link>}
        />
        <div id="hero">
          <HomepageSectionForm
            sectionKey="hero" title="Asosiy banner" description="Birinchi ko‘rinadigan rasm va matnlar."
            imageUrl={content.hero.imageUrl}
            fields={[
              { name: "titleTop", label: "Yuqori sarlavha", value: content.hero.titleTop },
              { name: "titleAccent", label: "Ajratilgan sarlavha", value: content.hero.titleAccent },
              { name: "subtitle", label: "Izoh", value: content.hero.subtitle, kind: "textarea" },
              { name: "ctaLabel", label: "Tugma matni", value: content.hero.ctaLabel },
              { name: "ctaHref", label: "Tugma havolasi", value: content.hero.ctaHref },
              { name: "imageAlt", label: "Rasm tavsifi", value: content.hero.imageAlt },
            ]}
          />
        </div>
        <div id="featured-campaign">
          <HomepageSectionForm
            sectionKey="featured-campaign" title="Ajratilgan mahsulot" description="Katta reklama kartasi."
            imageUrl={content.featuredCampaign.imageUrl}
            fields={[
              { name: "eyebrow", label: "Belgi", value: content.featuredCampaign.eyebrow },
              { name: "heading", label: "Mahsulot nomi", value: content.featuredCampaign.heading },
              { name: "description", label: "Tavsif", value: content.featuredCampaign.description, kind: "textarea" },
              { name: "priceLabel", label: "Narx", value: content.featuredCampaign.priceLabel },
              { name: "ctaLabel", label: "Tugma matni", value: content.featuredCampaign.ctaLabel },
              { name: "ctaHref", label: "Tugma havolasi", value: content.featuredCampaign.ctaHref },
              { name: "imageAlt", label: "Rasm tavsifi", value: content.featuredCampaign.imageAlt },
            ]}
          />
        </div>
        <div id="sport-finder">
          <HomepageSectionForm
            sectionKey="sport-finder" title="Sport tanlash" description="Kolleksiyalar bo‘limi matnlari."
            fields={[
              { name: "eyebrow", label: "Kichik sarlavha", value: content.sportFinder.eyebrow },
              { name: "heading", label: "Asosiy sarlavha", value: content.sportFinder.heading },
              { name: "description", label: "Izoh", value: content.sportFinder.description, kind: "textarea" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
