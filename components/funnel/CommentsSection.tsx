"use client";

import { useState, useEffect, useRef } from "react";

/* ── Seed data ─────────────────────────────────────────────────────────────── */
interface Reply {
  id: string;
  author: string;
  avatar: string;
  photoUrl?: string;
  text: string;
  minutesAgo: number;
  likes: number;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  photoUrl?: string;
  location: string;
  text: string;
  minutesAgo: number; // seed value  rendered as relative label
  likes: number;
  replies?: Reply[];
}

// Avatars: initials-based colours (no external deps)
const AVATARS: Record<string, string> = {
  A: "bg-violet-700", B: "bg-blue-700", C: "bg-emerald-700",
  D: "bg-amber-700",  E: "bg-rose-700", F: "bg-cyan-700",
  G: "bg-pink-700",   H: "bg-indigo-700",
};
function avatarColor(name: string) {
  return AVATARS[name[0].toUpperCase()] ?? "bg-neutral-700";
}

const SEED_COMMENTS: Comment[] = [
  {
    id: "c1", author: "James H.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/52.jpg", location: "🇬🇧 UK",
    text: "Just registered  finally took the step after seeing this for the third time in my feed. Nervous but excited.",
    minutesAgo: 2, likes: 14,
    replies: [
      { id: "r1a", author: "Support Team", avatar: "", text: "Welcome James! Your specialist will be in touch within a few hours. You're going to love the onboarding.", minutesAgo: 2, likes: 4 },
    ],
  },
  {
    id: "c2", author: "Rania K.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/women/58.jpg", location: "🇦🇪 UAE",
    text: "I was sceptical at first  I've been burned by 'get rich quick' stuff before. But this felt different. The quiz actually made me think. Signed up 3 weeks ago and already up $960.",
    minutesAgo: 47, likes: 89,
    replies: [
      { id: "r2a", author: "Marco V.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/30.jpg", text: "Same experience here. The quiz part was what got me  felt personalised.", minutesAgo: 38, likes: 12 },
      { id: "r2b", author: "Rania K.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/women/58.jpg", text: "@Marco exactly! Good luck with yours 🙌", minutesAgo: 35, likes: 7 },
    ],
  },
  {
    id: "c3", author: "Tyler B.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/33.jpg", location: "🇨🇦 Canada",
    text: "Does this work if you have literally zero experience? Like I don't even know what a pip is lol",
    minutesAgo: 112, likes: 31,
    replies: [
      { id: "r3a", author: "Support Team", avatar: "", text: "100% Tyler  most people who join have never traded before. Your specialist walks you through everything step by step. No jargon.", minutesAgo: 108, likes: 19 },
      { id: "r3b", author: "Tyler B.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/33.jpg", text: "Ok I'm in 😂 just filled the form", minutesAgo: 95, likes: 22 },
    ],
  },
  {
    id: "c4", author: "Priya M.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/women/16.jpg", location: "🇸🇬 Singapore",
    text: "My colleague showed me this last month. I was too busy to try. Came back today and she's already up $2,200. Filling the form now before I talk myself out of it again.",
    minutesAgo: 180, likes: 67,
  },
  {
    id: "c5", author: "Chris D.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/8.jpg", location: "🇦🇺 Australia",
    text: "Had a call with my specialist yesterday. Super helpful, no pressure at all. He explained the platform for about 40 minutes and answered every question. Really good experience so far.",
    minutesAgo: 390, likes: 103,
    replies: [
      { id: "r5a", author: "Sarah L.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/women/26.jpg", text: "Good to hear  I've been waiting for my call. Signed up 2 days ago.", minutesAgo: 370, likes: 8 },
    ],
  },
  {
    id: "c6", author: "Fatima A.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/women/65.jpg", location: "🇳🇬 Nigeria",
    text: "Honest question  does the minimum $250 have to go in all at once or can it be split?",
    minutesAgo: 820, likes: 24,
    replies: [
      { id: "r6a", author: "Support Team", avatar: "", text: "Hi Fatima  the $250 is the minimum to open a live account, and yes it goes in as a single deposit. Your specialist can walk you through exactly how it works on your onboarding call.", minutesAgo: 810, likes: 18 },
    ],
  },
  {
    id: "c7", author: "Luca F.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/57.jpg", location: "🇮🇹 Italy",
    text: "Week 6 for me. Took some time to get comfortable but the last two weeks have been consistently green. First withdrawal done ✅",
    minutesAgo: 2880, likes: 194,
    replies: [
      { id: "r7a", author: "Ben O.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/11.jpg", text: "This is the comment that made me sign up lol 😭", minutesAgo: 2700, likes: 41 },
      { id: "r7b", author: "Luca F.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/57.jpg", text: "@Ben haha good luck! Take it slow at the start.", minutesAgo: 2690, likes: 15 },
    ],
  },
];

// Comments that auto-appear while the user is on the page
const LIVE_COMMENTS: Omit<Comment, "id">[] = [
  {
    author: "Noah W.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/60.jpg", location: "🇿🇦 South Africa",
    text: "Just submitted the form. Super smooth process  took me about 2 minutes.",
    minutesAgo: 0, likes: 1,
  },
  {
    author: "Diana C.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/women/38.jpg", location: "🇧🇷 Brazil",
    text: "The video section was what convinced me. Really clear explanation of how it all works.",
    minutesAgo: 0, likes: 2,
  },
  {
    author: "Arjun P.", avatar: "", photoUrl: "https://randomuser.me/api/portraits/men/17.jpg", location: "🇮🇳 India",
    text: "Anyone here from India? Just wondering if the platform is fully supported here.",
    minutesAgo: 0, likes: 3,
    replies: [
      { id: "live-r1", author: "Support Team", avatar: "", text: "Yes Arjun  fully supported in India. Your specialist will confirm everything on your call.", minutesAgo: 0, likes: 5 },
    ],
  },
];

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function fmtAge(minutes: number): string {
  if (minutes < 1)  return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const h = Math.floor(minutes / 60);
  if (h < 24)       return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

function Avatar({ name, photoUrl, size = "md" }: { name: string; photoUrl?: string; size?: "sm" | "md" }) {
  const isTeam = name === "Support Team";
  const sz = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  if (isTeam) {
    return (
      <div className={`shrink-0 ${sz} rounded-full flex items-center justify-center font-bold text-white bg-emerald-700`}>
        ✦
      </div>
    );
  }
  if (photoUrl) {
    return (
      <div className={`relative shrink-0 ${sz} rounded-full overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={name}
          width={size === "sm" ? 28 : 36}
          height={size === "sm" ? 28 : 36}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fb) fb.style.display = "flex";
          }}
        />
        <div className={`hidden absolute inset-0 ${sz} rounded-full items-center justify-center font-bold text-white ${avatarColor(name)}`}>
          {name[0]}
        </div>
      </div>
    );
  }
  return (
    <div className={`shrink-0 ${sz} rounded-full flex items-center justify-center font-bold text-white ${avatarColor(name)}`}>
      {name[0]}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function CommentsSection() {
  const [comments, setComments] = useState<Comment[]>(() =>
    SEED_COMMENTS.map((c) => ({ ...c, likes: c.likes + Math.floor(Math.random() * 8) }))
  );
  const [draftText, setDraftText] = useState("");
  const [draftName, setDraftName] = useState("");
  const [posting, setPosting]     = useState(false);
  const [posted, setPosted]       = useState(false);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set(["c1", "c2", "c7"]));
  const liveIdx = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Tick up likes occasionally
  useEffect(() => {
    const id = setInterval(() => {
      setComments((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((c, i) => i === idx ? { ...c, likes: c.likes + 1 } : c);
      });
    }, 7000);
    return () => clearInterval(id);
  }, []);

  // Auto-inject a live comment every ~28s
  useEffect(() => {
    const id = setInterval(() => {
      if (liveIdx.current >= LIVE_COMMENTS.length) return;
      const next = LIVE_COMMENTS[liveIdx.current];
      liveIdx.current += 1;
      setComments((prev) => [
        { ...next, id: `live-${Date.now()}` },
        ...prev,
      ]);
    }, 28000);
    return () => clearInterval(id);
  }, []);

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function handleLike(id: string) {
    setComments((prev) =>
      prev.map((c) => c.id === id ? { ...c, likes: c.likes + 1 } : c)
    );
  }

  function handlePost() {
    const text = draftText.trim();
    const name = draftName.trim() || "Anonymous";
    if (!text) return;
    setPosting(true);
    window.setTimeout(() => {
      const newComment: Comment = {
        id: `user-${Date.now()}`,
        author: name,
        avatar: "",
        location: "",
        text,
        minutesAgo: 0,
        likes: 0,
      };
      setComments((prev) => [newComment, ...prev]);
      setDraftText("");
      setDraftName("");
      setPosting(false);
      setPosted(true);
      window.setTimeout(() => setPosted(false), 3000);
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 800);
  }

  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length ?? 0), 0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">
          Community <span className="text-gray-400 font-normal text-sm">({totalComments} comments)</span>
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          Live
        </span>
      </div>

      {/* Post a comment */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Add your comment</p>
        <input
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
        />
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Share your thoughts or ask a question…"
          rows={3}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          {posted && (
            <p className="text-xs text-emerald-400 font-medium">✓ Comment posted!</p>
          )}
          {!posted && <span />}
          <button
            onClick={handlePost}
            disabled={!draftText.trim() || posting}
            className="shrink-0 rounded-xl btn-emerald-gradient px-4 py-2 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all duration-150 flex items-center gap-2"
          >
            {posting ? (
              <><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" /> Posting…</>
            ) : "Post comment"}
          </button>
        </div>
      </div>

      {/* Comment list */}
      <div ref={listRef} className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="space-y-3">
            {/* Main comment */}
            <div className="flex gap-3">
              <Avatar name={c.author} photoUrl={c.photoUrl} />
              <div className="flex-1 min-w-0">
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{
                    background: "#f9fafb",
                    border: "1px solid rgba(0,0,0,0.07)",
                  }}
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1.5">
                    <span className="text-sm font-semibold text-gray-800">{c.author}</span>
                    {c.location && <span className="text-xs text-gray-400">{c.location}</span>}
                    {c.author === "Support Team" && (
                        <span className="rounded-full bg-emerald-100 px-2 py-px text-xs font-bold text-emerald-700">Team</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{c.text}</p>
                </div>
                {/* Actions row */}
                <div className="flex items-center gap-4 mt-1.5 px-1">
                  <span className="text-xs text-gray-400">{fmtAge(c.minutesAgo)}</span>
                  <button
                    onClick={() => handleLike(c.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    {c.likes}
                  </button>
                  {c.replies && c.replies.length > 0 && (
                    <button
                      onClick={() => toggleExpanded(c.id)}
                      className="text-xs text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      {expanded.has(c.id)
                        ? "Hide replies"
                        : `${c.replies.length} repl${c.replies.length === 1 ? "y" : "ies"} ↓`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            {expanded.has(c.id) && c.replies && c.replies.map((r) => (
              <div key={r.id} className="flex gap-2.5 pl-10 sm:pl-12">
                <Avatar name={r.author} photoUrl={r.photoUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <div
                    className="rounded-2xl rounded-tl-sm px-3.5 py-2.5"
                    style={{
                      background: "#f3f4f6",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                      <span className="text-xs font-semibold text-gray-800">{r.author}</span>
                      {r.author === "Support Team" && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-px text-xs font-bold text-emerald-700">Team</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{r.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-1">
                    <span className="text-xs text-gray-400">{fmtAge(r.minutesAgo)}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {r.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-neutral-700">Comments are moderated. Real community members only.</p>
    </div>
  );
}
