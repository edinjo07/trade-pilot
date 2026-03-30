export default function EducationPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 font-sans">
      {/* Nav */}
      <header className="border-b border-neutral-200 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-neutral-900">TradeSmart Education</span>
          <nav className="hidden md:flex gap-6 text-sm text-neutral-500">
            <a href="/education" className="hover:text-neutral-900">Home</a>
            <a href="/terms" className="hover:text-neutral-900">Terms</a>
            <a href="/privacy" className="hover:text-neutral-900">Privacy</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-neutral-50 border-b border-neutral-200 px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Free Trading Education</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-neutral-900">
            Learn How Online Trading Works
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl leading-relaxed">
            Understand the fundamentals of CFD and forex trading  how markets move,
            how platforms work, and what experienced traders know that beginners often miss.
          </p>
          <div className="inline-block rounded-full bg-amber-100 border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800">
            ⚠️ Risk Warning: Trading CFDs and forex carries a high level of risk and may not be suitable for all investors.
            You may lose more than your initial investment. Please trade responsibly.
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">What is CFD Trading?</h2>
            <p className="text-neutral-600 leading-relaxed text-sm">
              A Contract for Difference (CFD) is a financial derivative that lets you speculate on the
              price movement of an asset  stocks, forex, commodities, or indices  without owning
              the underlying asset. You profit (or lose) based on the difference between the opening
              and closing price of your position.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm">
              CFDs are leveraged products, which means a small deposit controls a larger position.
              This amplifies both potential gains and potential losses.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">How Do Trading Platforms Work?</h2>
            <p className="text-neutral-600 leading-relaxed text-sm">
              Trading platforms connect you to global markets in real time. You can open long (buy) or
              short (sell) positions, set stop-loss orders to limit downside, and monitor your portfolio
              24 hours a day on weekdays.
            </p>
            <p className="text-neutral-600 leading-relaxed text-sm">
              Most regulated brokers require identity verification and a minimum deposit before you
              can begin trading live markets.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Key Concepts to Understand</h2>
            <ul className="text-sm text-neutral-600 space-y-2">
              {[
                "Leverage  amplifies exposure with a smaller capital outlay",
                "Margin  the deposit required to open a leveraged position",
                "Spread  the difference between buy and sell price; your transaction cost",
                "Stop-Loss  an order that automatically closes a losing trade at a set level",
                "Take-Profit  locks in gains when price reaches your target",
                "Volatility  how quickly and unpredictably a market price changes",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-neutral-900">Common Beginner Mistakes</h2>
            <ul className="text-sm text-neutral-600 space-y-2">
              {[
                "Trading without a plan or defined risk per trade",
                "Over-leveraging  using maximum leverage on every trade",
                "Ignoring the economic calendar (news events move markets fast)",
                "Letting losing trades run while cutting winners too early",
                "Trading with money you cannot afford to lose",
                "Skipping a demo account and going straight to live funds",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Risk disclaimer */}
      <section className="bg-neutral-50 border-t border-neutral-200 px-6 py-10">
        <div className="mx-auto max-w-4xl space-y-3">
          <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Risk Disclosure</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Trading foreign exchange, CFDs, and other leveraged financial products on margin carries a high degree of risk
            and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.
            Before deciding to trade, you should carefully consider your investment objectives, level of experience, and
            risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment
            and therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks
            associated with trading and seek advice from an independent financial advisor if you have any doubts.
            Past performance is not indicative of future results.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 px-6 py-6">
        <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} TradeSmart Education. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-neutral-600">Terms of Service</a>
            <a href="/privacy" className="hover:text-neutral-600">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
