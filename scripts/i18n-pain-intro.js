// Applies useT() i18n to SectionPainIntro.tsx
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "components", "funnel", "SectionPainIntro.tsx");
let code = fs.readFileSync(filePath, "utf8");

// 1. Add useT import
code = code.replace(
  `import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";`,
  `import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";\nimport { useT } from "@/components/LocaleProvider";`
);

// 2. Remove the static PAIN_POINTS array (from comment to closing ];)
code = code.replace(
  /\/\/ ── Pain point data ─+[\s\S]*?\n\];\n/,
  ""
);

// 3. Add useT() + dynamic PAIN_POINTS inside component (before useState)
code = code.replace(
  `  const [revealed, setRevealed] = useState(false);`,
  `  const t = useT();
  const PAIN_POINTS = [
    { icon: "💸", title: t.s2b_p1_title, body: t.s2b_p1_body, stat: t.s2b_p1_stat },
    { icon: "📈", title: t.s2b_p2_title, body: t.s2b_p2_body, stat: t.s2b_p2_stat },
    { icon: "⛽", title: t.s2b_p3_title, body: t.s2b_p3_body, stat: t.s2b_p3_stat },
    { icon: "⏰", title: t.s2b_p4_title, body: t.s2b_p4_body, stat: t.s2b_p4_stat },
    { icon: "🏦", title: t.s2b_p5_title, body: t.s2b_p5_body, stat: t.s2b_p5_stat },
    { icon: "👴", title: t.s2b_p6_title, body: t.s2b_p6_body, stat: t.s2b_p6_stat },
  ];
  const [revealed, setRevealed] = useState(false);`
);

// 4. Step indicator text
code = code.replace(
  `        <span>Why this matters to you</span>`,
  `        <span>{t.s2b_step_label}</span>`
);
code = code.replace(
  `        <span className="bg-gray-100 rounded-full px-2 py-0.5">2 min read</span>`,
  `        <span className="bg-gray-100 rounded-full px-2 py-0.5">{t.s2b_step_duration}</span>`
);

// 5. Opening headline (multiline with JSX)
code = code.replace(
  /The system is designed to<br \/>\s+<span className="text-red-500">keep your money working for them<\/span>,<br \/>\s+not for you\./,
  `{t.s2b_headline}<br />\n          <span className="text-red-500">{t.s2b_headline_em}</span>,<br />\n          {t.s2b_headline_end}`
);

// 6. Subtext paragraph
code = code.replace(
  /You go to work\. You save\. You try to do the right thing\.[\s\S]*?right now\./,
  `{t.s2b_subtext}`
);

// 7. Counter label
code = code.replace(
  `          Value lost to inflation since you opened this page`,
  `          {t.s2b_counter_label}`
);

// 8. Counter subscript
code = code.replace(
  /Globally, inflation destroys purchasing power every second\.[\s\S]*?that\./,
  `{t.s2b_counter_sub}`
);

// 9. "The dirty secret" heading
code = code.replace(
  `          The dirty secret`,
  `          {t.s2b_why_headline}`
);

// 10. Pivot paragraph 1 (with yellow span) → plain text from t
code = code.replace(
  /<p className="text-base font-semibold leading-relaxed">[\s\S]*?their lives\.\s*<\/p>/,
  `        <p className="text-base font-semibold leading-relaxed">\n          {t.s2b_why_text1}\n        </p>`
);

// 11. Pivot paragraph 2 (Jim Simons)
code = code.replace(
  /<p className="text-sm text-gray-400">\s*Jim Simons'[\s\S]*?ordinary people\.\s*\n?\s*<\/p>/,
  `        <p className="text-sm text-gray-400">\n          {t.s2b_why_text2}\n        </p>`
);

// 12. Until Trading Pilot
code = code.replace(
  /<p className="text-sm font-bold text-white">Until Trading Pilot\.<\/p>/,
  `        <p className="text-sm font-bold text-white">{t.s2b_why_text3}</p>`
);

// 13. "The solution" label
code = code.replace(/>\s*The solution\s*<\/div>/, `>{t.s2b_solution_label}</div>`);

// 14. "Meet Trading Pilot" heading
code = code.replace(/>\s*Meet Trading Pilot\s*<\/h3>/, `>{t.s2b_tp_headline}</h3>`);

// 15. TP sub paragraph
code = code.replace(
  /The first autonomous trading intelligence engine[\s\S]*?no human can sustain\./,
  `{t.s2b_tp_sub}`
);

// 16. Claude AI title
code = code.replace(
  />Claude AI Sentiment Engine<\/div>/,
  `>{t.s2b_claude_title}</div>`
);

// 17. Claude AI body
code = code.replace(
  /Before every trade, Pilot queries Claude AI[\s\S]*?full conviction\./,
  `{t.s2b_claude_body}`
);

// 18. Three facts inline array → use t keys
code = code.replace(
  /\{(\s*)\[\s*\{\s*num:\s*"01",\s*heading:\s*"It watches[\s\S]*?"Hard stop-loss[\s\S]*?},\s*\]\.map\(\(item\)/,
  `{$1[\n            { num: "01", heading: t.s2b_fact1_heading, detail: t.s2b_fact1_detail },\n            { num: "02", heading: t.s2b_fact2_heading, detail: t.s2b_fact2_detail },\n            { num: "03", heading: t.s2b_fact3_heading, detail: t.s2b_fact3_detail },\n          ].map((item)`
);

// 19. Advocates label
code = code.replace(
  />\s*Who has been doing this for decades\s*<\/div>/,
  `>{t.s2b_advocates_label}</div>`
);

// 20. Advocates disclaimer
code = code.replace(
  /These individuals are not affiliated with or endorsing Trading Pilot\.[\s\S]*?demonstrates the power of automation\./,
  `{t.s2b_adv_disclaimer}`
);

// 21. CTA box p1
code = code.replace(
  /Now let's show you exactly how Trading Pilot would have acted on last[\s\S]*?week's market\./,
  `{t.s2b_cta_box_p1}`
);

// 22. CTA box p2
code = code.replace(
  `Real strategy logic. Real chart data. Claude AI sentiment live.`,
  `{t.s2b_cta_box_p2}`
);

// 23. CTA button text
code = code.replace(
  />\s*Show me how it works →\s*<\/button>/,
  `>\n          {t.s2b_cta}\n        </button>`
);

// 24. CTA sub
code = code.replace(
  `          Free to access · No credit card · Takes 60 seconds to set up`,
  `          {t.s2b_cta_sub}`
);

fs.writeFileSync(filePath, code, "utf8");
console.log("SectionPainIntro.tsx updated successfully.");
