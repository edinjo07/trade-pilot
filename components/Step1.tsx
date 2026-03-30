"use client";

import { motion } from "framer-motion";
import StepBlock from "@/components/StepBlock";

const lines = [
  "Trading isn’t difficult because of the market. The market isn’t the hardest part.",
  "Most losses begin long before a position is opened.",
  "Information rarely fails first.",
];

export default function Step1() {
  return (
    <StepBlock title="Step 1" subtitle="Pattern Break">
      <div className="space-y-3 text-2xl md:text-3xl font-semibold text-neutral-100">
        {lines.map((line, idx) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.4, duration: 0.4 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </StepBlock>
  );
}
