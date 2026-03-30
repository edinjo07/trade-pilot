// Applies useT() i18n to SectionLiveProof.tsx
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "components", "funnel", "SectionLiveProof.tsx");
let code = fs.readFileSync(filePath, "utf8");

// 1. Add useT import
code = code.replace(
  `import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";`,
  `import RiskDisclaimer from "@/components/funnel/RiskDisclaimer";\nimport { useT } from "@/components/LocaleProvider";`
);

// 2. Add const t = useT() as first line of component
code = code.replace(
  `export default function SectionLiveProof({ onContinue }: { onContinue: () => void }) {\n  const [phase, setPhase]`,
  `export default function SectionLiveProof({ onContinue }: { onContinue: () => void }) {\n  const t = useT();\n  const [phase, setPhase]`
);

// 3. useState initial statusText
code = code.replace(
  `  const [statusText, setStatusText] = useState("TradePilot is watching the market...");`,
  `  const [statusText, setStatusText] = useState(t.s2d_status_initial);`
);

// 4. setStatusText calls inside startSim callback
code = code.replace(
  `    setStatusText("TradePilot is watching the market...");`,
  `    setStatusText(t.s2d_status_initial);`
);
code = code.replace(
  `        setStatusText("Bot detected a signal. Buying EUR/USD automatically...");`,
  `        setStatusText(t.s2d_status_trade1);`
);
code = code.replace(
  `        setStatusText("Profit target hit! Closed automatically.");`,
  `        setStatusText(t.s2d_status_tp1);`
);
code = code.replace(
  `        setStatusText("Second signal detected. Bot entered a new trade...");`,
  `        setStatusText(t.s2d_status_trade2);`
);
code = code.replace(
  `        setStatusText("Second trade closed with profit!");`,
  `        setStatusText(t.s2d_status_tp2);`
);
code = code.replace(
  `        setStatusText("Session complete. 2 trades. 2 wins. Zero effort from you.");`,
  `        setStatusText(t.s2d_status_done);`
);

// 5. addMilestone calls inside startSim
code = code.replace(
  `        addMilestone("TradePilot bought EUR/USD", "Automated entry. No action needed from you.", "#10b981");`,
  `        addMilestone(t.s2d_milestone_trade1, t.s2d_milestone_trade1_sub, "#10b981");`
);
code = code.replace(
  `        addMilestone(\`+\$\${TP1_PROFIT.toFixed(2)} profit locked\`, "Take-profit triggered. No action needed.", "#10b981");`,
  `        addMilestone(t.s2d_milestone_tp1.replace("{amount}", TP1_PROFIT.toFixed(2)), t.s2d_milestone_tp1_sub, "#10b981");`
);
code = code.replace(
  `        addMilestone("Second trade opened", "EUR/USD again. Bot never sleeps.", "#3b82f6");`,
  `        addMilestone(t.s2d_milestone_trade2, t.s2d_milestone_trade2_sub, "#3b82f6");`
);
code = code.replace(
  `        addMilestone(\`+\$\${TP2_PROFIT.toFixed(2)} more profit\`, "Both trades closed in the green.", "#10b981");`,
  `        addMilestone(t.s2d_milestone_tp1.replace("{amount}", TP2_PROFIT.toFixed(2)), t.s2d_milestone_tp2_sub, "#10b981");`
);

// 6. at() timed status updates
code = code.replace(
  `    at(2000, () => setStatusText("Scanning every price tick. Looking for the right moment..."));`,
  `    at(2000, () => setStatusText(t.s2d_status_scanning));`
);
code = code.replace(
  `    at(8000, () => setStatusText("Spotted a pattern forming. Fast line crossing above slow line..."));`,
  `    at(8000, () => setStatusText(t.s2d_status_pattern));`
);

// 7. Add t to startSim dependency array
code = code.replace(
  `  }, [cleanup, animateBalance, addMilestone, at]);`,
  `  }, [cleanup, animateBalance, addMilestone, at, t]);`
);

// 8. Watch-again button inline statusText reset
code = code.replace(
  `              setStatusText("TradePilot is watching the market...");`,
  `              setStatusText(t.s2d_status_initial);`
);

// 9. JSX header badge
code = code.replace(
  `          Watch it trade live\n        </div>`,
  `          {t.s2d_badge}\n        </div>`
);

// 10. JSX header h2 (split onto two lines in source)
code = code.replace(
  /\$250 account\. Bot trading<br \/>\s+EUR\/USD\. Fully automated\./,
  `{t.s2d_headline}`
);

// 11. JSX header p
code = code.replace(
  /Watch TradePilot spot opportunities and make trades in real time\s+while you do absolutely nothing\./,
  `{t.s2d_subtext}`
);

// 12. "Account Balance"
code = code.replace(
  `            Account Balance\n            </div>`,
  `            {t.s2d_balance_label}\n            </div>`
);

// 13. Trade status indicator inside the running indicator div
code = code.replace(
  `            {inTrade ? "TRADE OPEN" : phase === "running" ? "SCANNING" : phase === "done" ? "COMPLETE" : "STANDBY"}`,
  `            {inTrade ? t.s2d_trade_open : phase === "running" ? t.s2d_scanning : phase === "done" ? t.s2d_complete : t.s2d_standby}`
);

// 14. 3-step explainer inline array
code = code.replace(
  `          {[\n            ["\ud83d\udc41\ufe0f", "Bot watches", "Every price movement, 24/7"],\n            ["\u26a1", "Spots opportunity", "Detects the right moment automatically"],\n            ["\ud83d\udcb0", "Locks profit", "Exits the trade at your target price"],\n          ].map(([icon, title, desc]) => (`,
  `          {[\n            ["\ud83d\udc41\ufe0f", t.s2d_watch_step1_title, t.s2d_watch_step1_desc],\n            ["\u26a1", t.s2d_watch_step2_title, t.s2d_watch_step2_desc],\n            ["\ud83d\udcb0", t.s2d_watch_step3_title, t.s2d_watch_step3_desc],\n          ].map(([icon, title, desc]) => (`
);

// 15. "Simulation complete" label
code = code.replace(
  `            Simulation complete\n          </div>`,
  `            {t.s2d_sim_complete_label}\n          </div>`
);

// 16. "Started with"
code = code.replace(
  `              <div className="text-xs text-gray-400 mb-0.5">Started with</div>`,
  `              <div className="text-xs text-gray-400 mb-0.5">{t.s2d_started_with}</div>`
);

// 17. "Ended with"
code = code.replace(
  `              <div className="text-xs text-gray-400 mb-0.5">Ended with</div>`,
  `              <div className="text-xs text-gray-400 mb-0.5">{t.s2d_ended_with}</div>`
);

// 18. Trade labels
code = code.replace(
  `                <span className="text-emerald-500 font-bold">\u2713</span> Trade 1: EUR/USD`,
  `                <span className="text-emerald-500 font-bold">\u2713</span> {t.s2d_trade1_label}`
);
code = code.replace(
  `                <span className="text-emerald-500 font-bold">\u2713</span> Trade 2: EUR/USD`,
  `                <span className="text-emerald-500 font-bold">\u2713</span> {t.s2d_trade2_label}`
);

// 19. Result box paragraph
code = code.replace(
  /You did nothing\. The bot watched the chart[\s\S]*?every day\./,
  `{t.s2d_result_box}`
);

// 20. Start button
code = code.replace(
  />\s*▶\s*&nbsp;\s*Watch it trade live\s*<\/button>/,
  `>\n          {t.s2d_start_btn}\n        </button>`
);

// 21. Running note
code = code.replace(
  /Simulation running\s+watch the chart above\.\.\./,
  `{t.s2d_running_note}`
);

// 22. CTA done button
code = code.replace(
  `            I want this running on my account \u2192`,
  `            {t.s2d_cta}`
);

// 23. Watch again button
code = code.replace(
  `            \u21ba Watch again`,
  `            {t.s2d_watch_again}`
);

fs.writeFileSync(filePath, code, "utf8");
console.log("SectionLiveProof.tsx updated successfully.");
