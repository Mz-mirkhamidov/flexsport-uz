import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-[#8DC63F] hover:text-gray-900",
  secondary:
    "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50",
  danger:
    "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
  ghost: "text-gray-500 hover:text-gray-900",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
