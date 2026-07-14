type BadgeTone = "green" | "amber" | "blue" | "red" | "gray";

const TONE_CLASSES: Record<BadgeTone, string> = {
  green: "bg-[#8DC63F]/15 text-[#4d7a1a]",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({
  tone = "gray",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

const ORDER_STATUS_TONE: Record<string, BadgeTone> = {
  received: "blue",
  preparing: "amber",
  in_transit: "amber",
  delivered: "green",
  cancelled: "red",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  received: "Qabul qilindi",
  preparing: "Tayyorlanmoqda",
  in_transit: "Yo'lda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={ORDER_STATUS_TONE[status] ?? "gray"}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

export function PaymentStatusBadge({
  paid,
  label,
}: {
  paid: boolean;
  label?: string;
}) {
  return (
    <Badge tone={paid ? "green" : "amber"}>
      {label ?? (paid ? "To'landi" : "Kutilmoqda")}
    </Badge>
  );
}
