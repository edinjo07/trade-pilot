const fs   = require("fs");
const path = require("path");

// Matches JS/TS single-quoted, double-quoted, and template-literal strings (single-line)
const STRING_RE = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;

const FILES = [
  "lib/i18n/index.ts",
  "components/funnel/SectionPainIntro.tsx",
  "components/funnel/SectionPilotSim.tsx",
];

const root = path.resolve(__dirname, "..");
let totalFixed = 0;

for (const rel of FILES) {
  const full = path.join(root, rel);
  const src  = fs.readFileSync(full, "utf8");

  let count = 0;
  const out = src.replace(STRING_RE, (match) => {
    if (!match.includes("  ")) return match;
    count++;
    return match.replace(/  +/g, " ");
  });

  if (count > 0) {
    fs.writeFileSync(full, out, "utf8");
    console.log("Fixed " + count + " strings in: " + rel);
    totalFixed += count;
  } else {
    console.log("No double-spaces found in: " + rel);
  }
}

console.log("Done. Total strings fixed: " + totalFixed);
