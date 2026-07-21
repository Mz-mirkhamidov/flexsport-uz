-- Editable homepage content and a public bucket for CMS images.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site_media_admin_insert" on storage.objects;
create policy "site_media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and (select public.is_admin()));

drop policy if exists "site_media_admin_update" on storage.objects;
create policy "site_media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()))
  with check (bucket_id = 'site-media' and (select public.is_admin()));

drop policy if exists "site_media_admin_delete" on storage.objects;
create policy "site_media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));

with homepage as (
  select id from public.site_pages where slug = 'homepage'
)
insert into public.site_sections (
  page_id,
  section_key,
  section_type,
  published_content,
  draft_content,
  sort_order
)
select homepage.id, seed.section_key, seed.section_type, seed.content, seed.content, seed.sort_order
from homepage
cross join (
  values
    (
      'hero',
      'hero',
      jsonb_build_object(
        'titleTop', 'Cheksiz kuch.',
        'titleAccent', 'Sening\no‘yining.',
        'subtitle', 'Chegaralarni yeng.\nO‘z maqsadingga erish.',
        'ctaLabel', 'Yangiliklarni ko‘rish',
        'ctaHref', '/search',
        'imageUrl', '/flexsport-hero-athletes.webp',
        'imageAlt', 'FlexSport sportchilari'
      ),
      10
    ),
    (
      'featured-campaign',
      'featured_campaign',
      jsonb_build_object(
        'eyebrow', 'Yangi',
        'heading', 'FS Pro Compression',
        'description', 'Yengil. Nafas oladigan. Chegarasiz harakat.',
        'priceLabel', '479 000 UZS',
        'ctaLabel', 'Hozir sotib olish',
        'ctaHref', '/search?q=kiyim',
        'imageUrl', '/fs-compression.webp',
        'imageAlt', 'FS Pro Compression sport kiyimi'
      ),
      40
    ),
    (
      'sport-finder',
      'sport_finder',
      jsonb_build_object(
        'eyebrow', 'SPORT FINDER / 01',
        'heading', 'Maqsadingizni tanlang.',
        'description', 'Sizga mos kolleksiyani bir bosishda toping.'
      ),
      60
    )
) as seed(section_key, section_type, content, sort_order)
on conflict (page_id, section_key) do nothing;
