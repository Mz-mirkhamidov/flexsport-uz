"use client";

type Props = {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
};

export function DeleteButton({ action, confirmMessage, label = "O'chirish" }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:underline"
      >
        {label}
      </button>
    </form>
  );
}
