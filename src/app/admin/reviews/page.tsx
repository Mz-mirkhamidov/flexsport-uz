import { createClient } from "@/lib/supabase/server";
import { approveReview, deleteReview } from "@/actions/reviews";
import { DeleteButton } from "@/components/admin/DeleteButton";

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
      <h1 className="text-2xl font-bold">Sharhlar</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Tasdiqlashni kutmoqda ({pending.length})
        </h2>
        <div className="flex flex-col gap-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded border border-black/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{r.products?.name}</span>
                  <span className="ml-2 text-xs text-black/50">
                    {r.profiles?.full_name ?? r.profiles?.email}
                  </span>
                </div>
                <span className="text-[#8DC63F]">{"★".repeat(r.rating)}</span>
              </div>
              {r.text && <p className="mt-1 text-sm text-black/70">{r.text}</p>}
              <div className="mt-2 flex gap-3">
                <form action={approveReview.bind(null, r.id)}>
                  <button type="submit" className="text-sm text-[#8DC63F] hover:underline">
                    Tasdiqlash
                  </button>
                </form>
                <DeleteButton action={deleteReview.bind(null, r.id)} confirmMessage="Sharhni o'chirasizmi?" />
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-sm text-black/50">Yangi sharhlar yo&apos;q</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          Tasdiqlangan ({approved.length})
        </h2>
        <div className="flex flex-col gap-3">
          {approved.map((r) => (
            <div key={r.id} className="rounded border border-black/10 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{r.products?.name}</span>
                  <span className="ml-2 text-xs text-black/50">
                    {r.profiles?.full_name ?? r.profiles?.email}
                  </span>
                </div>
                <span className="text-[#8DC63F]">{"★".repeat(r.rating)}</span>
              </div>
              {r.text && <p className="mt-1 text-sm text-black/70">{r.text}</p>}
              <div className="mt-2">
                <DeleteButton action={deleteReview.bind(null, r.id)} confirmMessage="Sharhni o'chirasizmi?" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
