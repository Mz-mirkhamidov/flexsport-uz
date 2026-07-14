import { createAdminClient } from "@/lib/supabase/admin";
import { tiyinToSom } from "./amounts";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { newOrderPaidMessage } from "@/lib/telegram/templates";

/** Payme JSON-RPC error codes we emit. */
const ERR = {
  INVALID_AMOUNT: -31001,
  TRANSACTION_NOT_FOUND: -31003,
  UNABLE_TO_PERFORM: -31008,
  ORDER_NOT_FOUND: -31050,
} as const;

class PaymeError extends Error {
  code: number;
  data?: string;
  constructor(code: number, message: string, data?: string) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

// Payme numeric state <-> our text state
const STATE_TO_PAYME: Record<string, number> = {
  created: 1,
  performed: 2,
  cancelled: -1,
  cancelled_after_perform: -2,
};

const TRANSACTION_EXPIRY_MS = 12 * 60 * 60 * 1000; // 12 hours

function toMs(row: { created_at: string; performed_at: string | null; cancelled_at: string | null }) {
  return {
    create_time: new Date(row.created_at).getTime(),
    perform_time: row.performed_at ? new Date(row.performed_at).getTime() : 0,
    cancel_time: row.cancelled_at ? new Date(row.cancelled_at).getTime() : 0,
  };
}

async function getOrderForAccount(
  supabase: ReturnType<typeof createAdminClient>,
  account: Record<string, string> | undefined,
) {
  const orderId = account?.order_id;
  if (!orderId) throw new PaymeError(ERR.ORDER_NOT_FOUND, "Order not found", "order_id");

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) {
    throw new PaymeError(ERR.ORDER_NOT_FOUND, "Order not found", "order_id");
  }
  return order;
}

export async function checkPerformTransaction(params: {
  amount: number;
  account: Record<string, string>;
}) {
  const supabase = createAdminClient();
  const order = await getOrderForAccount(supabase, params.account);

  if (order.product_payment_status === "paid") {
    throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Order already paid");
  }
  if (tiyinToSom(params.amount) !== Number(order.product_amount)) {
    throw new PaymeError(ERR.INVALID_AMOUNT, "Incorrect amount");
  }

  return { allow: true };
}

export async function createTransaction(params: {
  id: string;
  time: number;
  amount: number;
  account: Record<string, string>;
}) {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("provider_transaction_id", params.id)
    .maybeSingle();

  if (existing) {
    if (existing.state === "cancelled" || existing.state === "cancelled_after_perform") {
      throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Transaction cancelled");
    }
    const times = toMs(existing);
    return {
      create_time: times.create_time,
      transaction: existing.id,
      state: STATE_TO_PAYME[existing.state] ?? 1,
    };
  }

  const order = await getOrderForAccount(supabase, params.account);
  if (order.product_payment_status === "paid") {
    throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Order already paid");
  }
  if (tiyinToSom(params.amount) !== Number(order.product_amount)) {
    throw new PaymeError(ERR.INVALID_AMOUNT, "Incorrect amount");
  }

  const { data: otherActive } = await supabase
    .from("payment_transactions")
    .select("id")
    .eq("order_id", order.id)
    .eq("state", "created")
    .neq("provider_transaction_id", params.id)
    .maybeSingle();
  if (otherActive) {
    throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Order already has a pending transaction");
  }

  const { data: created, error } = await supabase
    .from("payment_transactions")
    .insert({
      order_id: order.id,
      provider: "payme",
      provider_transaction_id: params.id,
      amount: tiyinToSom(params.amount),
      state: "created",
      raw_payload: params,
    })
    .select("*")
    .single();
  if (error || !created) {
    throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Could not create transaction");
  }

  return {
    create_time: toMs(created).create_time,
    transaction: created.id,
    state: 1,
  };
}

export async function performTransaction(params: { id: string }) {
  const supabase = createAdminClient();

  const { data: tx } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("provider_transaction_id", params.id)
    .maybeSingle();
  if (!tx) throw new PaymeError(ERR.TRANSACTION_NOT_FOUND, "Transaction not found");

  if (tx.state === "performed") {
    const times = toMs(tx);
    return { transaction: tx.id, perform_time: times.perform_time, state: 2 };
  }
  if (tx.state !== "created") {
    throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Transaction is not performable");
  }

  const isExpired = Date.now() - new Date(tx.created_at).getTime() > TRANSACTION_EXPIRY_MS;
  if (isExpired) {
    await supabase
      .from("payment_transactions")
      .update({ state: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", tx.id);
    throw new PaymeError(ERR.UNABLE_TO_PERFORM, "Transaction expired");
  }

  const performedAt = new Date().toISOString();
  const { data: updated } = await supabase
    .from("payment_transactions")
    .update({ state: "performed", performed_at: performedAt })
    .eq("id", tx.id)
    .select("*")
    .single();

  const { data: order } = await supabase
    .from("orders")
    .update({ product_payment_status: "paid" })
    .eq("id", tx.order_id)
    .select("*, order_items(*)")
    .single();

  if (order) {
    for (const item of order.order_items) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("stock_qty")
        .eq("id", item.variant_id)
        .single();
      if (variant) {
        await supabase
          .from("product_variants")
          .update({ stock_qty: Math.max(0, variant.stock_qty - item.qty) })
          .eq("id", item.variant_id);
      }
    }

    await sendTelegramMessage(newOrderPaidMessage(order));
  }

  const times = toMs(updated ?? tx);
  return { transaction: tx.id, perform_time: times.perform_time || Date.now(), state: 2 };
}

export async function cancelTransaction(params: { id: string; reason: number }) {
  const supabase = createAdminClient();

  const { data: tx } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("provider_transaction_id", params.id)
    .maybeSingle();
  if (!tx) throw new PaymeError(ERR.TRANSACTION_NOT_FOUND, "Transaction not found");

  if (tx.state === "cancelled" || tx.state === "cancelled_after_perform") {
    const times = toMs(tx);
    return {
      transaction: tx.id,
      cancel_time: times.cancel_time,
      state: STATE_TO_PAYME[tx.state],
    };
  }

  const wasPerformed = tx.state === "performed";
  const newState = wasPerformed ? "cancelled_after_perform" : "cancelled";
  const cancelledAt = new Date().toISOString();

  await supabase
    .from("payment_transactions")
    .update({ state: newState, cancelled_at: cancelledAt })
    .eq("id", tx.id);

  await supabase
    .from("orders")
    .update({ product_payment_status: wasPerformed ? "refunded" : "failed" })
    .eq("id", tx.order_id);

  return {
    transaction: tx.id,
    cancel_time: new Date(cancelledAt).getTime(),
    state: STATE_TO_PAYME[newState],
  };
}

export async function checkTransaction(params: { id: string }) {
  const supabase = createAdminClient();
  const { data: tx } = await supabase
    .from("payment_transactions")
    .select("*")
    .eq("provider_transaction_id", params.id)
    .maybeSingle();
  if (!tx) throw new PaymeError(ERR.TRANSACTION_NOT_FOUND, "Transaction not found");

  const times = toMs(tx);
  return {
    create_time: times.create_time,
    perform_time: times.perform_time,
    cancel_time: times.cancel_time,
    transaction: tx.id,
    state: STATE_TO_PAYME[tx.state],
    reason: null,
  };
}

export { PaymeError };
