export default function ExitPage() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div
        className="w-full max-w-md rounded-2xl p-8 space-y-5"
        style={{
          background: "linear-gradient(145deg,rgba(14,20,16,0.88) 0%,rgba(8,12,9,0.95) 100%)",
          border: "1px solid rgba(52,211,153,0.1)",
        }}
      >
        <p className="text-4xl">👋</p>
        <h1 className="text-xl font-extrabold text-white">You chose not to continue.</h1>
        <p className="text-sm text-neutral-400 leading-relaxed">
          That&apos;s valid. Proceeding without the right mindset is worse than not proceeding at all.
        </p>
        <a
          href="/why-deposits-fail"
          className="text-sm text-emerald-400 underline hover:text-emerald-300 block"
        >
          Read: Why most deposits fail →
        </a>
        <a
          href="/"
          className="text-xs text-neutral-600 hover:text-neutral-400 underline block"
        >
          Back to start
        </a>
      </div>
    </main>
  );
}
