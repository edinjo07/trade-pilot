import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
  secondary:
    "bg-zinc-100 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
  ghost:
    "bg-transparent text-black hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800",
};

export default function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition ${
        variants[variant]
      } ${className ?? ""}`}
      {...props}
    />
  );
}
