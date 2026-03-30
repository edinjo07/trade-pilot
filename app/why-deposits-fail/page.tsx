export default function WhyDepositsFailPage() {
  const points = [
    { icon: "📉", title: "Overconfidence", body: "Most new traders believe they'll beat the market immediately. Overconfidence leads to oversized positions and fast wipeouts." },
    { icon: "💸", title: "Wrong capital", body: "Depositing money you actually need for rent, bills, or emergencies puts emotional pressure on every trade. Pressure causes bad decisions." },
    { icon: "⏱", title: "Unrealistic timeline", body: "Small deposits paired with big return expectations amplify stress. Most traders quit within 60 days because they can't tolerate the learning curve." },
    { icon: "📊", title: "No risk management", body: "Entering without a stop-loss strategy means one bad trade can erase weeks of gains. Discipline matters more than any tool." },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1
            className="text-2xl md:text-3xl font-extrabold text-white"
            style={{ textShadow: "0 0 30px rgba(52,211,153,0.2)" }}
          >
            Why most deposits fail
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            This isn&apos;t about the broker. It&apos;s about behaviour.
          </p>
        </div>

        <div className="space-y-4">
          {points.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl px-5 py-4 flex gap-4 items-start"
              style={{
                background: "linear-gradient(145deg,rgba(14,20,16,0.88) 0%,rgba(8,12,9,0.95) 100%)",
                border: "1px solid rgba(52,211,153,0.1)",
              }}
            >
              <span className="text-2xl shrink-0">{p.icon}</span>
              <div>
                <p className="text-sm font-bold text-neutral-100">{p.title}</p>
                <p className="mt-1 text-sm text-neutral-400 leading-relaxed">{p.body}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="/"
          className="btn-emerald-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white"
        >
          Back to start
        </a>
      </div>
    </main>
  );
}
