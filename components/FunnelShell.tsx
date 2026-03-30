"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";

export type FunnelStep = {
  id: string;
  title: string;
  component: React.ReactNode;
};

export default function FunnelShell({ steps }: { steps: FunnelStep[] }) {
  return (
    <div className="space-y-10">
      {steps.map((step, idx) => (
        <StepSection key={step.id} index={idx} total={steps.length} step={step} />
      ))}
    </div>
  );
}

function StepSection({
  step,
  index,
  total,
}: {
  step: FunnelStep;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-10% 0px -10% 0px", once: true });
  const delay = useMemo(() => index * 0.05, [index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="mb-3 text-xs text-neutral-500">Step {index + 1} of {total}</div>
      {step.component}
    </motion.div>
  );
}
