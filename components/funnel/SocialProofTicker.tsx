"use client";

/**
 * SocialProofTicker
 * Cycles through realistic join/profit notifications to create FOMO.
 * Entries are randomized at mount so every visitor sees a unique sequence.
 */
import { useEffect, useState } from "react";

const PEOPLE: { name: string; city: string; avatar: string }[] = [
  { name: "Alex",    city: "London",       avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Maria",   city: "Barcelona",    avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "James",   city: "Toronto",      avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
  { name: "Sofia",   city: "Vienna",       avatar: "https://randomuser.me/api/portraits/women/21.jpg" },
  { name: "Daniel",  city: "Sydney",       avatar: "https://randomuser.me/api/portraits/men/11.jpg" },
  { name: "Priya",   city: "Dubai",        avatar: "https://randomuser.me/api/portraits/women/63.jpg" },
  { name: "Lucas",   city: "Amsterdam",    avatar: "https://randomuser.me/api/portraits/men/45.jpg" },
  { name: "Emma",    city: "New York",     avatar: "https://randomuser.me/api/portraits/women/17.jpg" },
  { name: "Omar",    city: "Paris",        avatar: "https://randomuser.me/api/portraits/men/78.jpg" },
  { name: "Nina",    city: "Berlin",       avatar: "https://randomuser.me/api/portraits/women/55.jpg" },
  { name: "Chris",   city: "Miami",        avatar: "https://randomuser.me/api/portraits/men/23.jpg" },
  { name: "Aisha",   city: "Singapore",    avatar: "https://randomuser.me/api/portraits/women/37.jpg" },
  { name: "Liam",    city: "Dublin",       avatar: "https://randomuser.me/api/portraits/men/56.jpg" },
  { name: "Zoe",     city: "Melbourne",    avatar: "https://randomuser.me/api/portraits/women/8.jpg" },
  { name: "Andre",   city: "Lisbon",       avatar: "https://randomuser.me/api/portraits/men/88.jpg" },
  { name: "Chloe",   city: "Brussels",     avatar: "https://randomuser.me/api/portraits/women/29.jpg" },
];

const AMOUNTS = ["$1,240","$870","$3,100","$520","$2,450","$1,890","$740","$4,200","$1,070","$960","$2,780"];

type NotifType = "join" | "profit" | "active";

interface Entry {
  id: number;
  type: NotifType;
  name: string;
  city: string;
  avatar: string;
  amount?: string;
  minsAgo?: number;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeEntry(id: number): Entry {
  const type: NotifType = id % 3 === 0 ? "profit" : id % 3 === 1 ? "join" : "active";
  const person = randomItem(PEOPLE);
  return {
    id,
    type,
    name: person.name,
    city: person.city,
    avatar: person.avatar,
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
        className="shrink-0 h-9 w-9 rounded-full overflow-hidden border-2"
        style={{
          borderColor: current.type === "profit"
            ? "rgba(52,211,153,0.5)"
            : current.type === "join"
            ? "rgba(74,222,128,0.4)"
            : "rgba(251,191,36,0.4)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.avatar}
          alt={current.name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
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
