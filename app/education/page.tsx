const CONCEPTS = [
  {
    term: "Leverage",
    def: "A tool that allows you to control a larger position with a smaller initial deposit. Leverage amplifies both profits and losses equally.",
  },
  {
    term: "Margin",
    def: "The deposit required by a broker to open and maintain a leveraged position. If your account falls below the margin requirement, your position may be closed automatically.",
  },
  {
    term: "Spread",
    def: "The difference between the buy (ask) price and the sell (bid) price of an instrument. This is the primary cost of each trade.",
  },
  {
    term: "Stop-Loss Order",
    def: "An instruction to close a trade automatically once it reaches a specified loss level. Stop-loss orders help manage downside risk but are not guaranteed in fast-moving markets.",
  },
  {
    term: "Take-Profit Order",
    def: "An instruction to close a trade automatically when it reaches a target profit level.",
  },
  {
    term: "Volatility",
    def: "A measure of how much and how quickly a market price changes. Higher volatility means larger potential moves in both directions.",
  },
  {
    term: "Pip",
    def: "The smallest standard price move in a forex pair. For most currency pairs, one pip equals 0.0001 of the quoted price.",
  },
  {
    term: "Long / Short",
    def: "Going 'long' means buying an asset expecting the price to rise. Going 'short' means selling an asset expecting the price to fall.",
  },
];

const ASSET_CLASSES = [
  {
    name: "Forex (Currency Pairs)",
    desc: "The foreign exchange market is the largest and most liquid financial market in the world. Traders speculate on the relative value of one currency against another, such as EUR/USD or GBP/JPY. The forex market operates 24 hours a day, five days a week.",
  },
  {
    name: "Commodities",
    desc: "Commodities include physical goods such as gold, silver, crude oil, and natural gas. They are traded on global exchanges and their prices are influenced by supply and demand, geopolitical events, and macroeconomic data.",
  },
  {
    name: "Stock Indices",
    desc: "An index tracks the performance of a group of stocks, such as the S&P 500 (US), FTSE 100 (UK), or DAX (Germany). Trading indices provides exposure to an entire economy or sector rather than a single company.",
  },
  {
    name: "Shares (Equities)",
    desc: "Shares represent ownership in a publicly listed company. They can be bought and held as investments, or traded as CFDs to speculate on short-term price movements without owning the underlying stock.",
  },
];

const RISKS = [
  "You can lose more than your initial deposit when using leverage.",
  "Markets can move against your position rapidly and without warning.",
  "Past performance of any strategy or instrument does not indicate future results.",
  "Overnight financing costs (swap rates) can erode returns on longer-held positions.",
  "Market volatility during economic data releases can cause slippage or gaps in pricing.",
  "CFDs and forex instruments are complex products that carry a high level of risk.",
  "A large percentage of retail traders lose money when trading leveraged products.",
  "Trading should only be undertaken with capital you can afford to lose entirely.",
];

export default function EducationPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#ffffff", color: "#111827", fontFamily: "'Segoe UI', system-ui, Arial, sans-serif", lineHeight: 1.6 }}>

      {/* ── Top risk banner ── */}
      <div style={{ background: "#fefce8", borderBottom: "2px solid #fde68a", padding: "10px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
          ⚠ Risk Warning: Trading leveraged financial instruments carries a high level of risk and may not be suitable for all investors.
          You may lose more than your initial investment. Please read our full{" "}
          <a href="/education#risk-disclosure" style={{ color: "#b45309", textDecoration: "underline" }}>Risk Disclosure</a> before proceeding.
        </p>
      </div>

      {/* ── Nav ── */}
      <header style={{ borderBottom: "1px solid #e5e7eb", padding: "14px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>
            TradeSmart <span style={{ color: "#059669", fontWeight: 400 }}>Education</span>
          </span>
          <nav style={{ display: "flex", gap: 24, fontSize: 13, color: "#6b7280" }}>
            <a href="#what-is-trading"  style={{ color: "#6b7280", textDecoration: "none" }}>What is Trading?</a>
            <a href="#asset-classes"    style={{ color: "#6b7280", textDecoration: "none" }}>Asset Classes</a>
            <a href="#key-concepts"     style={{ color: "#6b7280", textDecoration: "none" }}>Key Concepts</a>
            <a href="#risk-disclosure"  style={{ color: "#6b7280", textDecoration: "none" }}>Risk Disclosure</a>
            <a href="/terms"            style={{ color: "#6b7280", textDecoration: "none" }}>Terms</a>
            <a href="/privacy"          style={{ color: "#6b7280", textDecoration: "none" }}>Privacy</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "56px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#059669" }}>
            Free Educational Resource
          </p>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>
            Understanding Online Trading & Financial Markets
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 16, color: "#4b5563", maxWidth: 620, lineHeight: 1.75 }}>
            This page provides free, impartial educational information about how financial markets work, the instruments available to retail traders, and the risks involved in trading.
            No products are sold here. No investment advice is given.
          </p>
          <div style={{ display: "inline-block", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 20px", fontSize: 13, color: "#78350f", maxWidth: 620 }}>
            <strong>Important Notice:</strong> This content is for educational purposes only and does not constitute investment advice, financial guidance, or a recommendation to trade. Always seek independent financial advice before making investment decisions.
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>

        {/* ── What is Online Trading ── */}
        <section id="what-is-trading" style={{ padding: "56px 0 40px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>What is Online Trading?</h2>
          <div style={{ width: 48, height: 3, background: "#059669", borderRadius: 2, marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>What is a CFD?</h3>
              <p style={{ fontSize: 14, color: "#4b5563", margin: 0, lineHeight: 1.8 }}>
                A Contract for Difference (CFD) is a financial derivative that allows you to speculate on the price movement of an asset — such as a currency pair, commodity, index, or share — without owning the underlying asset. Your profit or loss is determined by the difference between the opening and closing price of your position.
              </p>
              <p style={{ fontSize: 14, color: "#4b5563", marginTop: 12, lineHeight: 1.8 }}>
                CFDs are leveraged instruments. This means a relatively small deposit (called margin) can control a much larger position. While leverage can magnify gains, it equally magnifies losses — often beyond your initial deposit.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>How Do Trading Platforms Work?</h3>
              <p style={{ fontSize: 14, color: "#4b5563", margin: 0, lineHeight: 1.8 }}>
                A trading platform is software provided by a regulated broker that connects you to financial markets in real time. Through the platform, you can view live price quotes, place buy and sell orders, set risk management parameters such as stop-loss levels, and monitor your open positions.
              </p>
              <p style={{ fontSize: 14, color: "#4b5563", marginTop: 12, lineHeight: 1.8 }}>
                Regulated brokers are authorised and supervised by financial authorities in their country of operation. Before opening an account, it is important to verify that a broker is properly licenced in your jurisdiction.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Who Trades Financial Markets?</h3>
              <p style={{ fontSize: 14, color: "#4b5563", margin: 0, lineHeight: 1.8 }}>
                Participants in financial markets range from large institutional investors (banks, hedge funds, pension funds) to individual retail traders. Retail participation has grown significantly with the availability of online platforms, but retail traders typically trade at a significant informational and resource disadvantage compared to professional institutions.
              </p>
              <p style={{ fontSize: 14, color: "#4b5563", marginTop: 12, lineHeight: 1.8 }}>
                Regulatory bodies in most countries require that brokers disclose the percentage of retail clients who lose money trading their products. This figure is typically between 67% and 80% across regulated brokers.
              </p>
            </div>
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />

        {/* ── Asset Classes ── */}
        <section id="asset-classes" style={{ padding: "48px 0 40px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Common Asset Classes</h2>
          <div style={{ width: 48, height: 3, background: "#059669", borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontSize: 14, color: "#4b5563", maxWidth: 680, marginBottom: 28, lineHeight: 1.8 }}>
            The following are the main categories of financial instruments available to retail traders through online platforms. Each carries its own risk profile and market characteristics.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {ASSET_CLASSES.map((a) => (
              <div
                key={a.name}
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "22px 20px" }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 10, marginTop: 0 }}>{a.name}</h3>
                <p style={{ fontSize: 13, color: "#4b5563", margin: 0, lineHeight: 1.8 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />

        {/* ── Key Concepts ── */}
        <section id="key-concepts" style={{ padding: "48px 0 40px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Key Concepts & Terminology</h2>
          <div style={{ width: 48, height: 3, background: "#059669", borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontSize: 14, color: "#4b5563", maxWidth: 680, marginBottom: 28, lineHeight: 1.8 }}>
            Before placing any trade, it is essential to understand the following terms. A failure to fully understand how leveraged products work is one of the most common causes of losses among new traders.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {CONCEPTS.map((c) => (
              <div
                key={c.term}
                style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "18px 18px" }}
              >
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#111827" }}>{c.term}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.75 }}>{c.def}</p>
              </div>
            ))}
          </div>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />

        {/* ── Risks Section ── */}
        <section style={{ padding: "48px 0 40px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Understanding the Risks</h2>
          <div style={{ width: 48, height: 3, background: "#dc2626", borderRadius: 2, marginBottom: 24 }} />
          <p style={{ fontSize: 14, color: "#4b5563", maxWidth: 680, marginBottom: 28, lineHeight: 1.8 }}>
            Retail traders must understand that trading leveraged financial products is inherently risky. The following points represent important risk factors that every person should consider before trading any live account:
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {RISKS.map((r) => (
              <li
                key={r}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#fff7f7", border: "1px solid #fecaca", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#374151", lineHeight: 1.75 }}
              >
                <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />

        {/* ── Before You Trade ── */}
        <section style={{ padding: "48px 0 40px" }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Before You Start Trading</h2>
          <div style={{ width: 48, height: 3, background: "#059669", borderRadius: 2, marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              {
                title: "Use a Demo Account First",
                body: "Most regulated brokers offer a free demo (paper trading) account that simulates live market conditions with virtual funds. Spending time on a demo account before trading real capital is strongly recommended for all beginners.",
              },
              {
                title: "Only Trade with Money You Can Afford to Lose",
                body: "You should only allocate capital to trading that, if entirely lost, would not affect your standard of living, financial security, or ability to meet essential obligations such as rent, bills, or loan payments.",
              },
              {
                title: "Understand the Product Before You Trade It",
                body: "Each broker is required to provide a Key Information Document (KID) or equivalent disclosure for each product. Read these documents carefully. If you do not understand how a product works, do not trade it.",
              },
              {
                title: "Seek Independent Financial Advice",
                body: "This page is for educational purposes only and does not constitute financial advice. If you are uncertain about whether trading is appropriate for your personal financial situation, consult a qualified and independently regulated financial adviser.",
              },
            ].map((item) => (
              <div key={item.title} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "22px 20px" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#065f46" }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── CTA Bridge ── */}
      <section style={{ background: "#f0fdf4", borderTop: "1px solid #bbf7d0", borderBottom: "1px solid #bbf7d0", padding: "48px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#059669" }}>
            Ready to Explore the Platform?
          </p>
          <h2 style={{ margin: "0 0 14px", fontSize: 24, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>
            See How TradePilot Works
          </h2>
          <p style={{ margin: "0 0 28px", fontSize: 14, color: "#4b5563", lineHeight: 1.75 }}>
            Now that you understand the basics of online trading, you can explore the TradePilot platform.
            Remember: only trade with capital you can afford to lose and always use a demo account first.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#059669,#10b981)",
              color: "#ffffff",
              padding: "14px 36px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(5,150,105,0.3)",
            }}
          >
            Explore TradePilot →
          </a>
          <p style={{ margin: "16px 0 0", fontSize: 11, color: "#9ca3af" }}>
            By continuing, you confirm you have read and understood the risk disclosure above.
            Trading involves significant risk of loss.
          </p>
        </div>
      </section>

      {/* ── Full Risk Disclosure ── */}
      <section id="risk-disclosure" style={{ background: "#fafafa", borderTop: "1px solid #e5e7eb", padding: "48px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Full Risk Disclosure
          </h2>
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.9, margin: "0 0 12px" }}>
            Trading foreign exchange (forex), contracts for difference (CFDs), and other leveraged financial instruments on margin carries a high degree of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade leveraged financial products, you should carefully consider your investment objectives, level of trading experience, and risk appetite.
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.9, margin: "0 0 12px" }}>
            There is a possibility that you could sustain a loss of some or all of your initial investment. Therefore, you should not invest money that you cannot afford to lose entirely. You should be aware of all the risks associated with trading leveraged products and seek advice from an independent, authorised financial adviser if you have any doubts.
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.9, margin: "0 0 12px" }}>
            Past performance — whether of a trading strategy, signal service, algorithm, or individual instrument — is not indicative of future results. Any examples, simulations, or historical data presented for educational or illustrative purposes should not be interpreted as a guarantee of future outcomes.
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.9, margin: 0 }}>
            The content on this page is intended solely for educational and informational purposes. It does not constitute investment advice, a solicitation, or an offer to buy or sell any financial instrument. Regulatory requirements for trading leveraged products vary by country. It is your responsibility to ensure that your use of any trading platform or service complies with the laws and regulations applicable in your jurisdiction.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid #e5e7eb", padding: "20px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 12, color: "#9ca3af" }}>
          <span>© {new Date().getFullYear()} TradeSmart Education. This site provides educational content only and does not offer financial advice.</span>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="/terms"   style={{ color: "#9ca3af", textDecoration: "none" }}>Terms of Service</a>
            <a href="/privacy" style={{ color: "#9ca3af", textDecoration: "none" }}>Privacy Policy</a>
          </div>
        </div>
      </footer>

    </main>
  );
}
