import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center space-y-5"
        style={{
          background: "linear-gradient(145deg,rgba(14,20,16,0.9) 0%,rgba(8,12,9,0.95) 100%)",
          border: "1px solid rgba(52,211,153,0.12)",
        }}
      >
        <p
          className="text-7xl font-black"
          style={{ color: "#34d399", textShadow: "0 0 40px rgba(52,211,153,0.3)" }}
        >
          404
        </p>
        <h1 className="text-xl font-bold text-white">Page not found</h1>
        <p className="text-sm text-neutral-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="btn-emerald-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
        >
          Back to home →
        </Link>
      </div>
    </main>
  );
}
