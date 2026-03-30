import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
      <span>{label}</span>
      <input
        className={`rounded-xl border px-4 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-white ${
          error ? " border-red-500" : " border-zinc-200"
        }`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-red-500">{error}</span>
      ) : null}
    </label>
  );
}
