"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { orderStatusChangedMessage } from "@/lib/telegram/templates";

const NEXT_STATUS: Record<string, string | null> = {
  received: "preparing",
  preparing: "in_transit",
  in_transit: "delivered",
  delivered: null,
  cancelled: null,
};

export async function advanceOrderStatus(orderId: string) {
  const { supabase, user } = await requireAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("id", orderId)
    .single();
  if (!order) return;

  const nextStatus = NEXT_STATUS[order.status];
  if (!nextStatus) return;

  await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: order.status,
    to_status: nextStatus,
    changed_by: user?.id,
  });

  await sendTelegramMessage(orderStatusChangedMessage(order.order_number, nextStatus));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
}

export async function cancelOrder(orderId: string) {
  const { supabase, user } = await requireAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("id", orderId)
    .single();
  if (!order || order.status === "delivered" || order.status === "cancelled") return;

  await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: order.status,
    to_status: "cancelled",
    changed_by: user?.id,
  });

  await sendTelegramMessage(orderStatusChangedMessage(order.order_number, "cancelled"));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
}

export async function markDeliveryFeeCollected(orderId: string) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("orders")
    .update({ delivery_fee_payment_status: "collected" })
    .eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}
