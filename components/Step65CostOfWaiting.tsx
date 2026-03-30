"use client";

import { motion } from "framer-motion";
import StepBlock from "@/components/StepBlock";

const lines = [
  "There’s another option you haven’t chosen yet.",
  "You can keep waiting. Not because you’re careless  but because you want to feel ready.",
  "Most people do this. They watch markets. They read news. They replay scenarios in their head.",
  "Nothing compounds. Not experience. Not judgment. Not emotional control.",
  "The same questions return. The same hesitation repeats. Just later.",
  "Waiting doesn’t remove risk. It only postpones learning how to handle it.",
  "When action finally happens, it happens without structure  and the patterns you just recognized show up again.",
  "You don’t have to trade today. But at some point, you will decide to try  or to stop thinking about it entirely.",
  "Doing nothing keeps you exactly where you are.",
];

export default function Step65CostOfWaiting() {
  return (
    <StepBlock title="Step 6.5" subtitle="The Cost of Waiting">
      <div className="space-y-3 text-neutral-300">
        {lines.map((line, idx) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.25, duration: 0.35 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </StepBlock>
  );
}
