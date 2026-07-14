import { somToTiyin } from "./amounts";

/**
 * Builds the Payme hosted-checkout redirect URL.
 * Format: https://checkout.paycom.uz/base64("m=<merchant_id>;ac.order_id=<id>;a=<tiyin>;c=<returnUrl>")
 * https://developer.help.paycom.uz/initsializatsiya-platezhey/
 */
export function createPaymeCheckoutUrl(params: {
  orderId: string;
  amountSom: number;
  returnUrl: string;
}) {
  const merchantId = process.env.PAYME_MERCHANT_ID;
  if (!merchantId) return null;

  const base = process.env.PAYME_ENV === "production"
    ? "https://checkout.paycom.uz"
    : "https://checkout.test.paycom.uz";

  const query = [
    `m=${merchantId}`,
    `ac.order_id=${params.orderId}`,
    `a=${somToTiyin(params.amountSom)}`,
    `c=${params.returnUrl}`,
  ].join(";");

  const encoded = Buffer.from(query, "utf-8").toString("base64");
  return `${base}/${encoded}`;
}
