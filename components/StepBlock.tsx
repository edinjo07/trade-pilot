import type { ReactNode } from "react";

export default function StepBlock(props: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-800/70 bg-neutral-950/60 p-6 md:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">{props.title}</div>
        {props.subtitle ? (
          <div className="text-2xl md:text-3xl font-semibold text-neutral-100">
            {props.subtitle}
          </div>
        ) : null}
      </div>
      <div className="mt-6 space-y-6 text-neutral-200 leading-relaxed">
        {props.children}
      </div>
    </section>
  );
}
