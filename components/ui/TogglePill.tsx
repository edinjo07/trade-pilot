import type { ButtonHTMLAttributes, ReactNode } from "react";

type TogglePillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
};

export default function TogglePill({
  selected,
  className,
  ...props
}: TogglePillProps) {
  return (
    <button
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
          : "border-zinc-200 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-200"
      } ${className ?? ""}`}
      {...props}
    />
  );
}
