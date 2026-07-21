import { AdminStorefrontChrome } from "@/components/admin/AdminStorefrontChrome";
import { PremiumHome } from "@/app/(storefront)/page";

export default function AdminStorefrontPage() {
  return (
    <AdminStorefrontChrome>
      <PremiumHome adminMode />
    </AdminStorefrontChrome>
  );
}
