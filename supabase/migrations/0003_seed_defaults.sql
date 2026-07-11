-- Flexsport.uz — default seed data (idempotent)

insert into public.settings (key, value) values
  ('payment_split_mode', '{"product":"payme","delivery_fee":"cash"}'),
  ('contact_info', '{"phone":"","email":"","instagram":"","telegram":""}'),
  ('low_stock_default_threshold', '5')
on conflict (key) do nothing;

insert into public.delivery_zones (name, method, fee) values
  ('Toshkent shahri', 'tashkent_courier', 25000),
  ('Viloyatlar (Pochta)', 'region_post', 20000)
on conflict do nothing;

insert into public.categories (name, slug, sort_order) values
  ('Futbol', 'futbol', 1),
  ('Basketbol', 'basketbol', 2),
  ('Fitnes va Trenajyor', 'fitnes-trenajyor', 3),
  ('Yugurish', 'yugurish', 4),
  ('Tennis', 'tennis', 5),
  ('Suzish', 'suzish', 6),
  ('Outdoor va Turizm', 'outdoor-turizm', 7),
  ('Velosport', 'velosport', 8),
  ('Kiyim-kechak', 'kiyim-kechak', 9),
  ('Aksessuarlar', 'aksessuarlar', 10)
on conflict (slug) do nothing;
