"use client";

/**
 * SocialProofTicker
 * Cycles through realistic join/profit notifications to create FOMO.
 * Entries are randomized at mount so every visitor sees a unique sequence.
 */
import { useEffect, useState } from "react";

const FIRST_NAMES = ["Alex","Maria","James","Sofia","Daniel","Priya","Lucas","Emma","Omar","Nina","Chris","Aisha","Liam","Zoe","Andre","Chloe"];
const CITIES = ["London","New York","Toronto","Dubai","Sydney","Berlin","Amsterdam","Paris","Miami","Singapore","Vienna","Barcelona"];
const AMOUNTS = ["$1,240","$870","$3,100","$520","$2,450","$1,890","$740","$4,200","$1,070","$960","$2,780"];

type NotifType = "join" | "profit" | "active";

interface Entry {
  id: number;
  type: NotifType;
  name: string;
  city: string;
  amount?: string;
  minsAgo?: number;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeEntry(id: number): Entry {
  const type: NotifType = id % 3 === 0 ? "profit" : id % 3 === 1 ? "join" : "active";
  return {
    id,
    type,
    name: randomItem(FIRST_NAMES),
    city: randomItem(CITIES),
    amount: type === "profit" ? randomItem(AMOUNTS) : undefined,
    minsAgo: Math.floor(Math.random() * 12) + 1,
  };
}

function entryText(e: Entry): string {
  if (e.type === "join") return `${e.name} from ${e.city} just joined`;
  if (e.type === "profit") return `${e.name} from ${e.city} just closed a ${e.amount} trade`;
  return `${e.name} from ${e.city} is on this page right now`;
}

export default function SocialProofTicker() {
  const [current, setCurrent] = useState<Entry | null>(null);
  const [visible, setVisible] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Stagger first appearance so it feels organic
    const initial = window.setTimeout(() => {
      setCurrent(makeEntry(1));
      setVisible(true);
    }, 3500);

    return () => window.clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) return;

    // Each notification shows for ~4 s, then fades out for 2 s, then shows next
    const hideTimer = window.setTimeout(() => setVisible(false), 4000);
    const nextTimer = window.setTimeout(() => {
      setCounter((c) => {
        const next = c + 1;
        setCurrent(makeEntry(next));
        setVisible(true);
        return next;
      });
    }, 6500);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextTimer);
    };
  }, [counter]); // re-run when counter changes (new entry)

  if (!current) return null;

  const icon = current.type === "profit" ? "💰" : current.type === "join" ? "🟢" : "👁";

  return (
    <div
      className={`
        fixed bottom-5 left-4 z-50 flex max-w-xs items-center gap-3
        rounded-xl px-4 py-3 backdrop-blur-md
        transition-all duration-500
        ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"}
      `}
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(52,211,153,0.25)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 0 12px rgba(52,211,153,0.06)",
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-base"
        style={{
          background: current.type === "profit"
            ? "rgba(16,185,129,0.15)"
            : current.type === "join"
            ? "rgba(34,197,94,0.12)"
            : "rgba(245,158,11,0.1)",
          border: current.type === "profit"
            ? "1px solid rgba(52,211,153,0.3)"
            : current.type === "join"
            ? "1px solid rgba(74,222,128,0.25)"
            : "1px solid rgba(251,191,36,0.25)",
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-800 leading-snug font-medium">
          {entryText(current)}
        </span>
        <span className="text-[10px] text-gray-400">{current.minsAgo}m ago</span>
      </div>
    </div>
  );
}
