export type CartItem = {
  variantId: string;
  productId: string;
  productSlug: string;
  name: string;
  variantLabel: string | null;
  price: number;
  image: string | null;
  qty: number;
  maxStock: number;
};

const STORAGE_KEY = "flexsport_cart";
const EVENT_NAME = "flexsport:cart-updated";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(item: Omit<CartItem, "qty">, qty: number) {
  const items = read();
  const existing = items.find((i) => i.variantId === item.variantId);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, item.maxStock);
  } else {
    items.push({ ...item, qty: Math.min(qty, item.maxStock) });
  }
  write(items);
}

export function updateCartQty(variantId: string, qty: number) {
  const items = read();
  const existing = items.find((i) => i.variantId === variantId);
  if (!existing) return;
  if (qty <= 0) {
    write(items.filter((i) => i.variantId !== variantId));
    return;
  }
  existing.qty = Math.min(qty, existing.maxStock);
  write(items);
}

export function removeFromCart(variantId: string) {
  write(read().filter((i) => i.variantId !== variantId));
}

export function clearCart() {
  write([]);
}

export function getCartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function getCartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty * i.price, 0);
}

export function subscribeToCart(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}
