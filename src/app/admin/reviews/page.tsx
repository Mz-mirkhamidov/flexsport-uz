import { createClient } from "@/lib/supabase/server";
import { approveReview, deleteReview } from "@/actions/reviews";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, text, is_approved, created_at, products(name), profiles(full_name, email)")
    .order("created_at", { ascending: false });

  const pending = (reviews ?? []).filter((r) => !r.is_approved);
  const approved = (reviews ?? []).filter((r) => r.is_approved);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Sharhlar" subtitle={`${(reviews ?? []).length} ta sharh`} />

      <div>
        <CardHeader title={`Tasdiqlashni kutmoqda (${pending.length})`} />
        <div className="flex flex-col gap-3">
          {pending.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{r.products?.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {r.profiles?.full_name ?? r.profiles?.email}
                  </span>
                </div>
                <span className="text-[#8DC63F]">{"★".repeat(r.rating)}</span>
              </div>
              {r.text && <p className="mt-1 text-sm text-gray-600">{r.text}</p>}
              <div className="mt-3 flex gap-4">
                <form action={approveReview.bind(null, r.id)}>
                  <button type="submit" className="text-sm font-medium text-[#4d7a1a] hover:underline">
                    Tasdiqlash
                  </button>
                </form>
                <DeleteButton action={deleteReview.bind(null, r.id)} confirmMessage="Sharhni o'chirasizmi?" />
              </div>
            </Card>
          ))}
          {pending.length === 0 && <EmptyState title="Yangi sharhlar yo'q" />}
        </div>
      </div>

      <div>
        <CardHeader title={`Tasdiqlangan (${approved.length})`} />
        <div className="flex flex-col gap-3">
          {approved.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">{r.products?.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    {r.profiles?.full_name ?? r.profiles?.email}
                  </span>
                </div>
                <span className="text-[#8DC63F]">{"★".repeat(r.rating)}</span>
              </div>
              {r.text && <p className="mt-1 text-sm text-gray-600">{r.text}</p>}
              <div className="mt-3">
                <DeleteButton action={deleteReview.bind(null, r.id)} confirmMessage="Sharhni o'chirasizmi?" />
              </div>
            </Card>
          ))}
          {approved.length === 0 && <EmptyState title="Hali tasdiqlangan sharh yo'q" />}
        </div>
      </div>
    </div>
  );
}
