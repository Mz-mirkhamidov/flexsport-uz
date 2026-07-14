import { NextResponse, type NextRequest } from "next/server";
import {
  PaymeError,
  cancelTransaction,
  checkPerformTransaction,
  checkTransaction,
  createTransaction,
  performTransaction,
} from "@/lib/payme/webhook-handlers";

function isAuthorized(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const [login, key] = decoded.split(":");
  return login === "Paycom" && key === process.env.PAYME_MERCHANT_KEY;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { method, params, id } = body ?? {};

  if (!isAuthorized(request)) {
    return NextResponse.json({
      error: { code: -32504, message: "Insufficient privilege to perform this method" },
      id: id ?? null,
    });
  }

  try {
    let result: unknown;
    switch (method) {
      case "CheckPerformTransaction":
        result = await checkPerformTransaction(params);
        break;
      case "CreateTransaction":
        result = await createTransaction(params);
        break;
      case "PerformTransaction":
        result = await performTransaction(params);
        break;
      case "CancelTransaction":
        result = await cancelTransaction(params);
        break;
      case "CheckTransaction":
        result = await checkTransaction(params);
        break;
      default:
        return NextResponse.json({
          error: { code: -32601, message: "Method not found" },
          id: id ?? null,
        });
    }
    return NextResponse.json({ result, id });
  } catch (e) {
    if (e instanceof PaymeError) {
      return NextResponse.json({
        error: { code: e.code, message: e.message, data: e.data },
        id: id ?? null,
      });
    }
    console.error("Payme webhook error:", e);
    return NextResponse.json({
      error: { code: -32400, message: "Internal error" },
      id: id ?? null,
    });
  }
}
