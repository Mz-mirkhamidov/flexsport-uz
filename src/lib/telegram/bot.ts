export async function sendTelegramMessage(
  text: string,
  chatId: string | undefined = process.env.TELEGRAM_ADMIN_GROUP_CHAT_ID,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    console.warn("Telegram bot token yoki chat ID sozlanmagan — xabar yuborilmadi");
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    if (!res.ok) {
      console.error("Telegram xabari yuborilmadi:", await res.text());
    }
  } catch (e) {
    // Non-blocking: a failed notification must never break the checkout/webhook flow.
    console.error("Telegram xabari yuborishda xato:", e);
  }
}
