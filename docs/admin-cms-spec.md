# FlexSport Admin CMS — Product Specification

Status: planning draft  
Scope: storefront editor, catalog lifecycle, variants, inventory, finance  
Production changes: none

## Product principles

1. The admin storefront preview must render the same production components as the public site. It must not be a visually similar duplicate.
2. Content editing and publishing are separate actions. Editors can preview drafts without changing production.
3. Product visibility, archive state, and homepage placement are separate controls.
4. Historical order profit must never change when current product cost or selling price changes.
5. Every destructive or financial mutation requires server-side admin authorization and an audit record.

## Navigation

- Dashboard
- Site editor
  - Homepage
  - Catalog preview
  - Static pages
- Products
  - Active
  - Drafts
  - Hidden
  - Archive
  - Product groups
- Categories
- Orders
- Inventory
- Discounts
- Reviews
- Finance
  - Profit report
  - Expenses
- Settings

## 1. Storefront editor

### Layout

The page uses three synchronized regions:

| Region | Purpose |
|---|---|
| Top toolbar | Desktop/mobile preview, draft state, undo, preview, publish |
| Storefront canvas | The exact public homepage rendered with production components |
| Inspector drawer | Fields for the selected section, text, image, link, products, visibility and order |

### Editing behavior

- Editable sections display a pencil control only in admin edit mode.
- Selecting a section highlights its boundary and opens the inspector.
- Text changes update the preview immediately but remain a draft.
- Images are selected from the media library or uploaded to Supabase Storage.
- Publish creates a content version, records the admin, and revalidates the affected routes.
- Previous published versions can be viewed and restored.

### Homepage section types

- Hero
- Trust benefits
- Sport navigation pills
- Featured campaign/banner
- Manual product collection
- Dynamic product collection
- Sport finder
- Custom promotional section

Each section supports `is_visible`, `sort_order`, schedule start/end and device-specific image fields.

## 2. Product workspace

### Header

- Product title and status
- Public preview
- Save draft
- Publish/unpublish
- Archive/restore
- Change history

### Tabs

| Tab | Fields and controls |
|---|---|
| General | Name, slug, description, brand, category, tags |
| Media | Primary image, gallery, alt text, drag order, color assignment |
| Pricing | Default cost, default selling price, discount, margin preview |
| Variants | Color, size, SKU, cost, selling price, stock, active state |
| Relations | Color group, related products, cross-sell products |
| Placement | Catalog visibility, homepage collections, sort order, featured dates |
| SEO | Title, description, social image, canonical settings |
| History | Content, price, stock and status audit trail |

### Status model

- `Qoralama`: tayyorlanmoqda, faqat adminlarga ko‘rinadi
- `Faol`: asosiy sayt va tanlangan katalogda ko‘rinadi
- `Yashirin`: ro‘yxatlarda ko‘rinmaydi, faqat to‘g‘ridan-to‘g‘ri havola orqali ochiladi
- `Arxiv`: saytda umuman ko‘rinmaydi va arxivda saqlanadi

The database may use stable internal enum values (`draft`, `active`, `hidden`, `archived`), but every admin label, filter, badge, validation message and report must use the Uzbek labels above.

Homepage placement uses a separate collection relation and never changes product status.

## 3. Product groups and colors

A product group represents one commercial model with multiple color products.

- Group fields: name, shared description, optional shared brand/category.
- A group member is a normal product with its own slug, images, variants and stock.
- Color swatches link group members.
- Selecting a swatch navigates to that member and displays its own images, price and inventory.
- Related products are independent from color groups.

## 4. Archive and bulk catalog management

Filters:

- Query: name, SKU, slug
- Status
- Category and brand
- Stock state
- Has image / missing image
- Cost and selling-price range
- Updated date

Bulk actions:

- Activate, hide, archive, restore
- Assign existing category
- Create and assign a new category
- Add to or remove from homepage collection
- Change brand
- Export selected rows

Bulk actions show the number of affected products and require confirmation before execution.

## 5. Inventory

Inventory is variant-based. Every stock change creates an immutable movement record.

Movement types:

- purchase receipt
- sale
- return
- manual adjustment
- damaged/write-off
- cancellation release

The UI shows current quantity, reserved quantity, available quantity, low-stock threshold and recent movement history.

## 6. Finance

### Required snapshots

When an order is created, each order item stores:

- selling price snapshot
- discount snapshot
- cost snapshot
- quantity
- line revenue
- line cost
- line gross profit

Changing a current product price or cost does not modify old orders.

### Dashboard metrics

- Gross sales
- Discounts
- Refunds
- Net sales
- Cost of goods sold
- Gross profit
- Payment fees
- Delivery expenses
- Marketing and operating expenses
- Net profit

Definitions:

- `net_sales = gross_sales - discounts - refunds`
- `gross_profit = net_sales - cost_of_goods_sold`
- `net_profit = gross_profit - payment_fees - delivery_expenses - operating_expenses`

Reports support today, week, month, custom date range and CSV export.

## 7. Proposed database changes

### Existing table changes

`products`:

- `status product_status not null default 'draft'`
- `cost_price numeric(12,2)` as a default/fallback cost
- `published_at timestamptz`
- `archived_at timestamptz`
- `seo_title text`
- `seo_description text`

`product_variants`:

- `cost_price numeric(12,2)`
- `reserved_qty integer not null default 0`
- `color_hex text`
- `sort_order integer not null default 0`

`order_items`:

- `unit_cost_snapshot numeric(12,2)` initially nullable for legacy orders; required by the application for every new order
- `discount_snapshot numeric(12,2) not null default 0`
- `line_cost numeric(12,2)` generated from cost and quantity
- `line_gross_profit numeric(12,2)` generated from revenue minus cost

### New tables

| Table | Purpose |
|---|---|
| `product_groups` | Connect different color products of one model |
| `product_group_items` | Group membership and color swatch metadata |
| `product_relations` | Related and cross-sell products |
| `inventory_movements` | Immutable stock ledger |
| `site_pages` | Page identity and publication state |
| `site_sections` | Ordered editable storefront sections |
| `site_content_versions` | Draft and published content history |
| `media_assets` | Uploaded image metadata and usage |
| `collections` | Manual or rule-based product collections |
| `collection_products` | Manual collection membership/order |
| `expenses` | Delivery, payment, ads and operating expenses |
| `admin_audit_log` | Admin mutation history |

New public-schema tables must have RLS enabled. Public storefront access is limited to published content and active products. Admin writes use explicit server-side authorization; no generic authenticated write policies.

## 8. Migration and backfill rules

1. Preserve all existing products and URLs.
2. Snapshot the exact products currently exposed by storefront queries. Map only that reviewed set to `active`; place the remaining imported catalog in `archived` even when legacy `is_active = true`.
3. Keep `premium-curated` only as temporary input for homepage collection backfill, then use collection relations.
4. Default missing cost prices to null, not zero, so unknown cost cannot create false profit.
5. Mark financial reports as incomplete while an order item has unknown cost.
6. Backfill order cost snapshots only from reliable historical cost data; never use today's cost silently. Keep unknown legacy values null and label the affected profit report incomplete.
7. Run changes on a development branch or preview database before production.

## 9. Delivery phases

### Phase A — safety foundation

- Fix RLS privilege escalation and review approval policies.
- Add `requireAdmin()` to every admin action.
- Fix mock payment order ownership.
- Add admin audit logging foundation.

### Phase B — catalog lifecycle

- Add status, archive, cost, filters and bulk actions.
- Build responsive product and archive screens.
- Add product preview.

### Phase C — variants and inventory

- Add product groups, color navigation and variant pricing.
- Add inventory ledger and reservation fields.

### Phase D — finance

- Add order cost snapshots, expenses and profit reports.
- Reconcile totals against paid/refunded orders.

### Phase E — storefront CMS

- Move hard-coded homepage content into versioned sections.
- Build exact storefront canvas and inspector.
- Add draft, preview, publish and rollback.

## Acceptance criteria

- Admin preview and public site use the same rendering components.
- An archived product cannot appear in search, catalog, sitemap or homepage.
- Restoring a product requires choosing its status and category.
- Every public product has at least one active, sellable variant and image.
- Color selection opens the correct grouped product with its own media and stock.
- Historical profit remains unchanged after current price/cost edits.
- Reports identify orders with unknown historical cost instead of overstating profit.
- All admin mutations reject non-admin users at both server and database layers.
- Desktop and mobile admin flows expose all critical actions without clipped controls.
