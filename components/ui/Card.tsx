import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
};

export default function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {title ? (
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
      ) : null}
      {children}
    </div>
  );
}
