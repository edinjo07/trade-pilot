// ── Locale configuration ──────────────────────────────────────────────────────
export type Locale = "en" | "it" | "de" | "fr" | "es";

export const SUPPORTED_LOCALES: Locale[] = ["en", "it", "de", "fr", "es"];

/** Detect locale from Accept-Language header string. */
export function detectLocale(acceptLang: string, cfCountry?: string | null): Locale {
  // Accept-Language takes priority for Switzerland (4 official languages) —
  // country header alone can't distinguish de/fr/it Swiss users.
  // For all other mapped countries, country header wins.
  const primary = acceptLang.split(",")[0]?.split(";")[0]?.split("-")[0]?.toLowerCase();
  const langMap: Record<string, Locale> = {
    it: "it",
    de: "de",
    fr: "fr",
    es: "es",
    ca: "es", // Catalan → Spanish
  };

  if (cfCountry && cfCountry.toUpperCase() !== "CH") {
    const countryMap: Record<string, Locale> = {
      IT: "it",
      DE: "de", AT: "de", // Austria → German
      FR: "fr",
      BE: "fr",           // Belgium → French
      LU: "fr",           // Luxembourg → French
      ES: "es",
      MX: "es", AR: "es", CO: "es", CL: "es", // LATAM → Spanish
    };
    const mapped = countryMap[cfCountry.toUpperCase()];
    if (mapped) return mapped;
  }

  // Switzerland and all unmapped countries: use Accept-Language
  return langMap[primary ?? ""] ?? "en";
}

// ── Translation type (every key required in all locales) ──────────────────────
export type T = {
  // Common
  live: string;
  watching: string;      // "{n} watching right now"
  ssl_secured: string;

  // Footer
  footer_risk_prefix: string;
  footer_risk_body: string;
  footer_terms: string;
  footer_privacy: string;
  footer_deposits: string;
  footer_copyright: string;

  // Section 1 – Hook
  s1_headline: string;
  s1_subtext: string;
  s1_cta_above: string;
  s1_profit_label: string;
  s1_profit_sublabel: string;
  s1_real_accounts: string;
  s1_challenge_title: string;
  s1_challenge_headline: string; // "{n}" placeholder
  s1_challenge_sub: string;
  s1_daily_cap: string;
  s1_mind_label: string;
  s1_mind_question: string;
  s1_mind_nothing: string;
  s1_mind_works: string;
  s1_mind_nothing_title: string;
  s1_mind_nothing_body: string;
  s1_mind_nothing_footer: string;
  s1_mind_works_title: string;
  s1_mind_works_body: string;
  s1_activity_title: string;
  s1_activity_verified: string;
  s1_trust_t1: string; s1_trust_t2: string;
  s1_trust_c1: string; s1_trust_c2: string;
  s1_trust_f1: string; s1_trust_f2: string;
  s1_deposit_title: string;
  s1_deposit_body: string;
  s1_deposit_own1: string; s1_deposit_own2: string;
  s1_deposit_with1: string; s1_deposit_with2: string;
  s1_deposit_reg1: string; s1_deposit_reg2: string;
  s1_cta_main: string;
  s1_cta_sub: string;

  // Section 2 – Pain
  s2_step1: string; s2_step2: string; s2_step3: string;
  s2_missed_label: string;
  s2_missed_sub: string;
  s2_question_label: string;
  s2_headline: string;
  s2_subtext: string;
  s2_opt1_head: string; s2_opt1_sub: string;
  s2_opt2_head: string; s2_opt2_sub: string;
  s2_opt3_head: string; s2_opt3_sub: string;
  s2_footer: string;

  // Section 3 – Quiz
  s3_progress_label: string;
  s3_question_label: string; // "Question {q} of {total}"
  s3_footer: string;
  s3_q1: string; s3_a1_1: string; s3_a1_2: string; s3_a1_3: string; s3_a1_4: string;
  s3_q2: string; s3_a2_1: string; s3_a2_2: string; s3_a2_3: string; s3_a2_4: string;
  s3_q3: string; s3_a3_1: string; s3_a3_2: string; s3_a3_3: string; s3_a3_4: string;

  // Section 4 – Reveal
  s4_loading_1: string; s4_loading_2: string; s4_loading_3: string;
  s4_loading_4: string; s4_loading_5: string;
  s4_fit_label: string;
  s4_fit_sub: string;
  s4_result_headline: string;
  s4_result_watching: string;
  s4_result_tried: string;
  s4_result_no_time: string;
  s4_modes_label: string;
  s4_mode1_title: string; s4_mode1_badge: string; s4_mode1_desc: string;
  s4_mode2_title: string; s4_mode2_badge: string; s4_mode2_desc: string;
  s4_mode3_title: string; s4_mode3_badge: string; s4_mode3_desc: string;
  s4_mode_recommended: string;
  s4_test1_text: string; s4_test2_text: string; s4_test3_text: string;
  s4_stat1_label: string; s4_stat2_label: string; s4_stat3_label: string;
  s4_urgency_title: string; s4_urgency_sub1: string; s4_urgency_sub2: string;
  s4_cta: string;

  // Section 5 – Scarcity
  s5_spots_one: string;   // "1 spot remaining today"
  s5_spots_many: string;  // "{n} spots remaining today"
  s5_countdown_label: string;
  s5_expired: string;
  s5_expired_sub: string;
  s5_spots_title: string;
  s5_spots_sub: string;
  s5_spots_total: string;
  s5_what_happens: string;
  s5_c1: string; s5_c2: string; s5_c3: string; s5_c4: string;
  s5_qualify_label: string;
  s5_q1: string; s5_q2: string; s5_q3: string; s5_q4: string;
  s5_qualify_footer: string;
  s5_cta: string;
  s5_cta_sub: string;

  // Section 6 – Lead Capture
  s6_progress_label: string;
  s6_headline: string;
  s6_subtext: string;
  s6_min_deposit_label: string;
  s6_specialist_role: string;
  s6_specialist_quote: string;
  s6_specialist_online: string;
  s6_step1_title: string;
  s6_step1_sub: string;
  s6_email_label: string;
  s6_email_placeholder: string;
  s6_continue_btn: string;
  s6_no_spam: string;
  s6_confirmed_label: string;
  s6_change: string;
  s6_first_name_label: string; s6_last_name_label: string;
  s6_fname_placeholder: string; s6_lname_placeholder: string;
  s6_phone_label: string;
  s6_phone_sub: string;
  s6_loading_btn: string;
  s6_confirm_btn: string;
  s6_consent_text: string;
  s6_trust1: string; s6_trust2: string; s6_trust3: string;
  s6_privacy_note: string;
  s6_min_note: string;
  s6_terms_note: string;
  s6_terms_link: string;
  s6_and: string;
  s6_privacy_link: string;

  // Validation errors
  err_email: string;
  err_email_personal: string;
  err_first_name: string;
  err_last_name: string;
  err_full_name: string;
  err_phone: string;
  err_phone_invalid: string;
  err_too_many: string;
  err_rate_limit: string;
  err_generic: string;
  err_network: string;
};

// ── ENGLISH ───────────────────────────────────────────────────────────────────
const en: T = {
  live: "Live",
  watching: "{n} watching right now",
  ssl_secured: "SSL Secured",

  footer_risk_prefix: "Risk Warning:",
  footer_risk_body: "Trading in financial instruments involves significant risk. Prices may fluctuate and you may lose more than your initial deposit. Only trade with capital you can afford to lose. Past performance is not indicative of future results. The minimum starting deposit is $250.",
  footer_terms: "Terms",
  footer_privacy: "Privacy",
  footer_deposits: "Why Deposits Fail",
  footer_copyright: "© 2026 TradePilot",

  s1_headline: "The AI that trades for you. 24/7. Four proven strategies. Zero emotion.",
  s1_subtext: "Trading Pilot is the first autonomous trading intelligence engine that fuses real-time technical signals with Claude AI news sentiment, executing trades around the clock with the discipline no human can sustain. Four battle-tested strategies. Six layers of risk protection. One click to deploy.",
  s1_cta_above: "Activate Trading Pilot →",
  s1_profit_label: "Generated by Trading Pilot bots today",
  s1_profit_sublabel: "Live · updates every few seconds · 20+ instruments",
  s1_real_accounts: "Live bots",
  s1_challenge_title: "Happening right now",
  s1_challenge_headline: "While you're reading this, {n} people activated their first Trading Pilot bot today.",
  s1_challenge_sub: "Not professional traders. Regular people who set their risk level, picked a strategy, and let the AI handle the rest. The only thing separating them from you is that they clicked activate.",
  s1_daily_cap: "Daily activations: 100 limit",
  s1_mind_label: "Quick question",
  s1_mind_question: "What happens to the market while you sleep?",
  s1_mind_nothing: "It moves without me",
  s1_mind_works: "I have a bot running",
  s1_mind_nothing_title: "The market never sleeps. Trading Pilot doesn't either.",
  s1_mind_nothing_body: "While you sleep, Trading Pilot scans every price tick across 20+ instruments, fires precise entry signals, and manages open positions 24/7, with no emotion, no hesitation, and sub-millisecond execution. That's the edge people are using right now.",
  s1_mind_nothing_footer: "That's exactly what we're going to show you in under 60 seconds.",
  s1_mind_works_title: "Trading Pilot gives that edge a Claude AI brain.",
  s1_mind_works_body: "Every signal Trading Pilot fires is cross-checked against live market news via Claude AI sentiment analysis before a single trade is placed. A perfect technical setup against negative headlines? Pilot waits. Confirmed signal with bullish sentiment? Pilot acts with full conviction.",
  s1_activity_title: "Live withdrawals",
  s1_activity_verified: "verified · real accounts",
  s1_trust_t1: "4", s1_trust_t2: "AI strategies",
  s1_trust_c1: "24/7", s1_trust_c2: "Autonomous ops",
  s1_trust_f1: "< 1ms", s1_trust_f2: "Signal latency",
  s1_deposit_title: "One thing to know before you activate",
  s1_deposit_body: "To deploy Trading Pilot on a live account, brokers require a minimum starting capital of $250. That's not a fee. It's your own trading capital, sitting in your brokerage account, that you control and can withdraw at any time. Trading Pilot itself is included free.",
  s1_deposit_own1: "Your money", s1_deposit_own2: "Not a fee",
  s1_deposit_with1: "Withdrawable", s1_deposit_with2: "Anytime",
  s1_deposit_reg1: "Regulated", s1_deposit_reg2: "Broker held",
  s1_cta_main: "Activate Trading Pilot. See it live →",
  s1_cta_sub: "Zero to operating in under 60 seconds · no credit card needed",

  s2_step1: "Your situation", s2_step2: "Quick quiz", s2_step3: "Get access",
  s2_missed_label: "While you read this, our traders made",
  s2_missed_sub: "The market doesn't pause for anyone.",
  s2_question_label: "Quick question",
  s2_headline: "Be honest: which one is you?",
  s2_subtext: "Either way, we've got you covered. Just pick what feels closest.",
  s2_opt1_head: "I keep seeing people make money from trading and wonder why I haven't started yet",
  s2_opt1_sub: "I know it's possible. I just haven't taken the first step",
  s2_opt2_head: "I've tried trading before. I lost money and got discouraged",
  s2_opt2_sub: "I still believe it works, I just didn't have the right approach",
  s2_opt3_head: "I don't have time to watch charts all day. I have a job, a family, a life",
  s2_opt3_sub: "If there's a way to do this without it becoming a second job, I'm interested",
  s2_footer: "Your answer helps us tailor what you see next",

  s3_progress_label: "Putting together your profile…",
  s3_question_label: "Question {q} of {total}",
  s3_footer: "No right or wrong here, just helps us show you what's relevant to you",
  s3_q1: "What's really holding you back from trading right now?",
  s3_a1_1: "Honestly, I don't know where to begin",
  s3_a1_2: "I'm scared of losing money",
  s3_a1_3: "I just don't have time to figure it all out",
  s3_a1_4: "I tried once before and it went badly",
  s3_q2: "If something showed you a clear, low-risk trade, would you take it?",
  s3_a2_1: "Yes, straight away",
  s3_a2_2: "Probably. I'd want a quick explanation first",
  s3_a2_3: "Maybe. I'd think about it for a bit",
  s3_a2_4: "Probably not, I'd overthink it",
  s3_q3: "What would an extra $1,000–$3,000 a month genuinely mean for your life?",
  s3_a3_1: "Finally clearing my debt",
  s3_a3_2: "Cutting down my working hours",
  s3_a3_3: "Just breathing easier every month",
  s3_a3_4: "Building something real for my future",

  s4_loading_1: "Reading your answers…",
  s4_loading_2: "Finding traders with a similar background…",
  s4_loading_3: "Checking what worked for them…",
  s4_loading_4: "Working out your fit score…",
  s4_loading_5: "Done. Here's what we found.",
  s4_fit_label: "Your fit score",
  s4_fit_sub: "How closely you match traders who are actually profitable",
  s4_result_headline: "What your answers actually mean:",
  s4_result_watching: "People who research before they act tend to run bots that last. That's you. You're not here chasing hype, you want to understand how the system works. Trading Pilot is exactly built for that mindset: set your strategy parameters once, let the AI execute with discipline, review the equity curve as it compounds.",
  s4_result_tried: "Manual trading fails because humans can't maintain the discipline an algorithm can. You likely had the right instincts, just the wrong execution. Trading Pilot removes the emotion entirely. Hard stop-losses fire automatically. The bot halts if daily limits are hit. The strategy you pick has a documented win rate, and it sticks to it, every time.",
  s4_result_no_time: "This is exactly what Trading Pilot was built for. Zero charts to watch. Zero screen time required. You activate a strategy, set your risk level and trade size, and the bot handles entry, management, and exit 24/7 across 20+ instruments. Most users spend under 10 minutes a week reviewing results.",
  s4_modes_label: "Four Trading Pilot strategies. Pick your weapon.",
  s4_mode1_title: "MA Crossover", s4_mode1_badge: "61% win rate",
  s4_mode1_desc: "Trend Detection Engine. Two intelligent moving averages track momentum. Fast MA crosses above slow MA: Pilot enters. Crosses below: exits. Clean, precise, relentless. Works on any asset class.",
  s4_mode2_title: "RSI Reversal", s4_mode2_badge: "58% win rate · avg +1.9R",
  s4_mode2_desc: "Mean Reversion Detector. Measures market exhaustion. When the crowd has sold too aggressively, Pilot buys the rebound. When euphoria peaks, it sells the top: a discipline no human can maintain.",
  s4_mode3_title: "MACD Momentum", s4_mode3_badge: "63% win rate · avg +2.7R",
  s4_mode3_desc: "Momentum Shift Interceptor. Watches for MACD line convergence and catches momentum shifts early, often before the rest of the market even notices the move has begun.",
  s4_mode_recommended: "Highest win rate",
  s4_test1_text: "I set up the MA Crossover strategy on BTCUSD and walked away. Woke up to three closed trades and a positive equity curve. I genuinely didn't touch anything. The bot just did it.",
  s4_test2_text: "I'd lost money twice trading manually. The difference with Trading Pilot is the Claude AI filter: it stopped me entering a trade right before a bad news drop. That alone saved me more than I made in my first month.",
  s4_test3_text: "I run the MACD strategy on EURUSD during the London session and the RSI strategy on Gold overnight. Two bots, set once, running while I work. This is what I thought automated trading was supposed to be.",
  s4_stat1_label: "Instruments supported", s4_stat2_label: "Risk controls per trade", s4_stat3_label: "To get started",
  s4_urgency_title: "Limited activations today", s4_urgency_sub1: "Spots filling fast", s4_urgency_sub2: "Resets every 24 hours",
  s4_cta: "Activate Trading Pilot →",

  s5_spots_one: "1 spot remaining today",
  s5_spots_many: "{n} spots remaining today",
  s5_countdown_label: "Your spot is held for",
  s5_expired: "Time expired",
  s5_expired_sub: "Once this runs out your profile resets and you'd have to start from scratch.",
  s5_spots_title: "Trading Pilot activations in your area",
  s5_spots_sub: "Refreshes every 24 hours",
  s5_spots_total: "/ 10 total",
  s5_what_happens: "What actually happens if you close this?",
  s5_c1: "The market keeps moving 24/7, with or without a bot running for you.",
  s5_c2: "Your Trading Pilot profile disappears and you'd have to start from scratch.",
  s5_c3: "Someone else in your area claims your activation slot.",
  s5_c4: "People who activated last week already have live bots running their strategies.",
  s5_qualify_label: "Before you claim your spot, make sure you qualify",
  s5_q1: "You have a device with internet access",
  s5_q2: "You can spare 10 minutes to set up your account",
  s5_q3: "You understand trading involves risk",
  s5_q4: "You're able to start with a $250 minimum (your trading capital, not a fee, fully withdrawable)",
  s5_qualify_footer: "If all of the above applies to you, your spot is reserved below.",
  s5_cta: "Activate Trading Pilot now →",
  s5_cta_sub: "Included free · works on all 20+ instruments · no credit card needed",

  s6_progress_label: "Almost done…",
  s6_headline: "Last step. Activate your Trading Pilot.",
  s6_subtext: "Your strategy profile is ready. Tell us where to send your access details and a Trading Pilot specialist will personally walk you through deploying your first bot.",
  s6_min_deposit_label: "Minimum starting amount:",
  s6_specialist_role: "Senior Trading Pilot Specialist",
  s6_specialist_quote: "I'll review your strategy selection and walk you through activating your first bot on our 20-minute onboarding call. We'll set your risk parameters, configure the Claude AI filter, and get you live. No pressure, just getting you set up.",
  s6_specialist_online: "Online now, usually replies within 2 hrs",
  s6_step1_title: "Where should we send your Trading Pilot access?",
  s6_step1_sub: "Takes 10 seconds. No card needed. Included free.",
  s6_email_label: "Email address",
  s6_email_placeholder: "you@example.com",
  s6_continue_btn: "Continue →",
  s6_no_spam: "🔒 We never spam or sell your data.",
  s6_confirmed_label: "Email confirmed",
  s6_change: "Change",
  s6_first_name_label: "First name", s6_last_name_label: "Last name",
  s6_fname_placeholder: "First", s6_lname_placeholder: "Last",
  s6_phone_label: "Phone number",
  s6_phone_sub: "A real person will text you to help with setup.",
  s6_loading_btn: "Setting things up…",
  s6_confirm_btn: "Let's go →",
  s6_consent_text: "I agree to be contacted by a trading specialist and confirm I have read the Terms and Privacy Policy. I understand trading involves risk, the minimum starting deposit is $250, and I am 18 or older.",
  s6_trust1: "🔒 Secure & private", s6_trust2: "No credit card", s6_trust3: "No commitment",
  s6_privacy_note: "🔒 Your details are kept private and never shared or sold.",
  s6_min_note: "Minimum deposit to get started:",
  s6_terms_note: "By continuing you agree to our",
  s6_terms_link: "Terms",
  s6_and: "and",
  s6_privacy_link: "Privacy Policy",

  err_email: "Please enter a valid email address.",
  err_email_personal: "Please use your personal email.",
  err_first_name: "Please enter your first name.",
  err_last_name: "Please enter your last name.",
  err_full_name: "Please enter your full name.",
  err_phone: "Please enter your phone number.",
  err_phone_invalid: "Please enter a valid phone number.",
  err_too_many: "Too many attempts. Please refresh and try again.",
  err_rate_limit: "Too many attempts. Please wait a minute and try again.",
  err_generic: "Something went wrong. Please refresh the page and try again.",
  err_network: "Network issue. Please check your connection and try again.",
};

// ── ITALIAN ───────────────────────────────────────────────────────────────────
const it: T = {
  live: "Live",
  watching: "{n} persone guardano adesso",
  ssl_secured: "Connessione sicura SSL",

  footer_risk_prefix: "Avvertenza sul rischio:",
  footer_risk_body: "Il trading in strumenti finanziari comporta rischi significativi. I prezzi possono variare e potresti perdere più del tuo deposito iniziale. Opera solo con capitale che puoi permetterti di perdere. I risultati passati non sono indicativi di quelli futuri. Il deposito iniziale minimo è di $250.",
  footer_terms: "Termini",
  footer_privacy: "Privacy",
  footer_deposits: "Perché i depositi falliscono",
  footer_copyright: "© 2026 TradePilot",

  s1_headline: "Persone comuni stanno guadagnando davvero con il trading. E tu perché no?",
  s1_subtext: "Non banchieri. Non hedge fund. Persone normali insegnanti, autisti, genitori che si sono stancati di guardare dalla finestra. Hanno tutti iniziato esattamente da dove sei tu adesso.",
  s1_cta_above: "Mostrami come funziona",
  s1_profit_label: "Totale guadagnato dai nostri trader oggi",
  s1_profit_sublabel: "In diretta · si aggiorna ogni pochi secondi",
  s1_real_accounts: "Account reali",
  s1_challenge_title: "Sta succedendo adesso",
  s1_challenge_headline: "Mentre leggi questo, {n} persone hanno effettuato il loro primo trade oggi.",
  s1_challenge_sub: "Non investitori professionisti. Non persone ricche. Solo persone che hanno smesso di dire \"forse un giorno\" e hanno premuto un bottone. L'unica cosa che le differenzia da te in questo momento è quel bottone.",
  s1_daily_cap: "Limite giornaliero: 100 posti",
  s1_mind_label: "Domanda veloce",
  s1_mind_question: "Cosa fa il tuo denaro mentre dormi?",
  s1_mind_nothing: "Praticamente niente",
  s1_mind_works: "Lavora per me",
  s1_mind_nothing_title: "Questo è il divario. Ed è colmabile.",
  s1_mind_nothing_body: "Un conto di risparmio ti rende circa lo 0,5% all'anno. Il mercato si muove di quella cifra in pochi minuti. Le persone che guadagnano non sono più intelligenti hanno solo imparato a stare dalla parte giusta di quei movimenti.",
  s1_mind_nothing_footer: "È esattamente quello che ti mostreremo.",
  s1_mind_works_title: "Allora sai già perché sei qui.",
  s1_mind_works_body: "Conosci il principio. Quello che ti mostreremo è il modo più veloce e con meno rischi per applicarlo senza esperienza, senza laurea in finanza, senza ore davanti ai grafici.",
  s1_activity_title: "Prelievi in diretta",
  s1_activity_verified: "verificato · account reali",
  s1_trust_t1: "47.000+", s1_trust_t2: "Trader iscritti",
  s1_trust_c1: "Disponibile nel", s1_trust_c2: "tuo paese",
  s1_trust_f1: "Gratuito", s1_trust_f2: "Per iniziare",
  s1_deposit_title: "Una cosa da sapere prima di continuare",
  s1_deposit_body: "Per fare trading, i broker richiedono un deposito minimo di avvio di $250. Non è una commissione per noi è il tuo capitale personale, sul tuo conto, che controlli tu e puoi prelevare in qualsiasi momento.",
  s1_deposit_own1: "I tuoi soldi", s1_deposit_own2: "Non una commissione",
  s1_deposit_with1: "Prelevabile", s1_deposit_with2: "In qualsiasi momento",
  s1_deposit_reg1: "Regolamentato", s1_deposit_reg2: "Broker autorizzato",
  s1_cta_main: "Mostrami esattamente come funziona",
  s1_cta_sub: "60 secondi per iniziare · nessuna carta di credito",

  s2_step1: "La tua situazione", s2_step2: "Quiz veloce", s2_step3: "Ottieni accesso",
  s2_missed_label: "Mentre leggi questo, i nostri trader hanno guadagnato",
  s2_missed_sub: "Il mercato non aspetta nessuno.",
  s2_question_label: "Domanda veloce",
  s2_headline: "Sii onesto qual è la tua situazione?",
  s2_subtext: "In entrambi i casi ti aiutiamo noi. Scegli quella che ti somiglia di più.",
  s2_opt1_head: "Vedo gente guadagnare con il trading e mi chiedo perché non ho ancora iniziato",
  s2_opt1_sub: "So che è possibile non ho ancora fatto il primo passo",
  s2_opt2_head: "Ho già provato a fare trading e non è andata bene ho perso soldi e mi sono scoraggiato",
  s2_opt2_sub: "Credo ancora che funzioni, semplicemente non avevo l'approccio giusto",
  s2_opt3_head: "Non ho tempo di stare tutto il giorno davanti ai grafici ho un lavoro, una famiglia, una vita",
  s2_opt3_sub: "Se c'è un modo per farlo senza che diventi un secondo lavoro, sono interessato",
  s2_footer: "La tua risposta ci aiuta a personalizzare quello che vedrai",

  s3_progress_label: "Stiamo costruendo il tuo profilo…",
  s3_question_label: "Domanda {q} di {total}",
  s3_footer: "Non ci sono risposte giuste o sbagliate ci aiutano solo a mostrarti quello che è davvero rilevante per te",
  s3_q1: "Cosa ti frena davvero dal fare trading in questo momento?",
  s3_a1_1: "Onestamente, non so da dove cominciare",
  s3_a1_2: "Ho paura di perdere soldi",
  s3_a1_3: "Non ho tempo per capire tutto",
  s3_a1_4: "Ho già provato una volta ed è andata male",
  s3_q2: "Se qualcosa ti mostrasse un trade chiaro e a basso rischio lo faresti?",
  s3_a2_1: "Sì, subito",
  s3_a2_2: "Probabilmente vorrei prima una rapida spiegazione",
  s3_a2_3: "Forse ci penserei un po'",
  s3_a2_4: "Probabilmente no, ci penserei troppo",
  s3_q3: "Cosa significherebbe davvero per la tua vita avere 1.000–3.000 $ in più al mese?",
  s3_a3_1: "Finalmente azzerare i miei debiti",
  s3_a3_2: "Ridurre le ore di lavoro",
  s3_a3_3: "Respirare meglio ogni mese",
  s3_a3_4: "Costruire qualcosa di concreto per il mio futuro",

  s4_loading_1: "Leggendo le tue risposte…",
  s4_loading_2: "Trovando trader con un background simile al tuo…",
  s4_loading_3: "Verificando cosa ha funzionato per loro…",
  s4_loading_4: "Calcolando il tuo punteggio di compatibilità…",
  s4_loading_5: "Fatto ecco cosa abbiamo trovato.",
  s4_fit_label: "Il tuo punteggio di compatibilità",
  s4_fit_sub: "Quanto sei simile ai trader che ottengono profitti reali",
  s4_result_headline: "Cosa significano davvero le tue risposte:",
  s4_result_watching: "Chi si prende il tempo di informarsi prima di buttarsi tende a restare più a lungo e a fare meglio. Sei tu. Non ti sei lanciato alla cieca e questo ti favorisce una volta che hai la configurazione giusta.",
  s4_result_tried: "Ecco il punto aver perso soldi prima non significa che il trading non fa per te. Di solito significa solo che gli strumenti non erano configurati bene. I trader che hanno avuto difficoltà all'inizio e poi si sono ripresi sono spesso tra i più costanti. Sai già cosa non fare, e questo ti mette avanti.",
  s4_result_no_time: "Buona notizia è esattamente per questo che è stata costruita la piattaforma. La maggior parte delle persone al suo interno ha un lavoro a tempo pieno, una famiglia e zero tempo libero per fissare i grafici. Ecco perché esistono il trading automatizzato e il copy trading: il lavoro pesante è già fatto per te. Tu decidi quanto allocare, il sistema fa il resto.",
  s4_modes_label: "Tre modi di fare trading scegli quello adatto alla tua vita",
  s4_mode1_title: "Trading automatizzato", s4_mode1_badge: "Più popolare",
  s4_mode1_desc: "Imposta il tuo livello di rischio una volta sola. La piattaforma apre e gestisce automaticamente i trade 24/5 basandosi su strategie collaudate. Non devi monitorare niente.",
  s4_mode2_title: "Copy trading", s4_mode2_badge: "Ideale per principianti",
  s4_mode2_desc: "Scegli un trader esperto da seguire. Ogni trade che fa viene automaticamente replicato nel tuo conto, in proporzione al tuo saldo.",
  s4_mode3_title: "Trading manuale", s4_mode3_badge: "Controllo totale",
  s4_mode3_desc: "Apri i tuoi trade usando grafici in tempo reale, segnali e strumenti di analisi. Ideale per chi vuole essere operativo e imparare i mercati attivamente.",
  s4_mode_recommended: "Consigliato per te",
  s4_test1_text: "Quattro mesi fa ero esattamente dove sei tu adesso. Non avevo la minima idea. Ora la prima cosa che controllo al mattino non è la sveglia è cosa è successo durante la notte.",
  s4_test2_text: "Avevo bruciato soldi due volte provando a fare trading da solo. Questo era diverso fin dall'inizio ti dice cosa fare invece di lasciarti a indovinare.",
  s4_test3_text: "Un mio collega me lo ha mostrato e ero scettico. Tre settimane dopo avevo recuperato tutto quello che avevo perso al primo tentativo. Avrei voluto trovarlo prima.",
  s4_stat1_label: "Persone già iscritte", s4_stat2_label: "Redditizi entro 90 giorni", s4_stat3_label: "Per iniziare",
  s4_urgency_title: "Posti limitati oggi", s4_urgency_sub1: "Ne restano solo pochi", s4_urgency_sub2: "Si resetta ogni 24 ore",
  s4_cta: "Prenota il mio posto gratuito",

  s5_spots_one: "1 posto rimanente oggi",
  s5_spots_many: "{n} posti rimanenti oggi",
  s5_countdown_label: "Il tuo posto è riservato per",
  s5_expired: "Tempo scaduto",
  s5_expired_sub: "Quando questo scade, il tuo profilo si azzera e dovresti ricominciare da capo.",
  s5_spots_title: "Posti disponibili nella tua area",
  s5_spots_sub: "Si aggiorna ogni 24 ore",
  s5_spots_total: "/ 10 totali",
  s5_what_happens: "Cosa succede davvero se chiudi questa pagina?",
  s5_c1: "Il mercato continua a muoversi con o senza di te.",
  s5_c2: "Il tuo profilo scompare e dovresti rispondere a tutto di nuovo.",
  s5_c3: "Qualcun altro nella tua area occuperà il tuo posto.",
  s5_c4: "Le persone che si sono iscritte la settimana scorsa stanno già vedendo i primi risultati.",
  s5_qualify_label: "Prima di reclamare il tuo posto assicurati di avere i requisiti",
  s5_q1: "Hai un dispositivo con accesso a internet",
  s5_q2: "Puoi dedicare 10 minuti alla configurazione del tuo conto",
  s5_q3: "Capisci che il trading comporta dei rischi",
  s5_q4: "Puoi iniziare con un minimo di $250 (il tuo capitale di trading non una commissione, prelevabile in qualsiasi momento)",
  s5_qualify_footer: "Se tutto quanto sopra si applica a te, il tuo posto è riservato qui sotto.",
  s5_cta: "Prenota il mio posto gratuito adesso",
  s5_cta_sub: "Gratuito · nessun obbligo · occorrono circa 45 secondi",

  s6_progress_label: "Quasi fatto…",
  s6_headline: "Ultimo passaggio configura il tuo conto",
  s6_subtext: "Il tuo profilo è pronto. Dicci solo dove inviare il tuo accesso e uno specialista di trading ti contatterà per iniziare.",
  s6_min_deposit_label: "Importo minimo iniziale:",
  s6_specialist_role: "Specialista Trading Senior",
  s6_specialist_quote: "Esaminerò personalmente il tuo profilo e ti guiderò nella configurazione del tuo primo trade durante la chiamata di onboarding. Circa 20 minuti. Nessuna pressione, solo rispondere alle tue domande.",
  s6_specialist_online: "Online adesso di solito risponde entro 2 ore",
  s6_step1_title: "Dove dobbiamo inviare il tuo accesso?",
  s6_step1_sub: "10 secondi. Nessuna carta richiesta.",
  s6_email_label: "Indirizzo email",
  s6_email_placeholder: "tu@esempio.com",
  s6_continue_btn: "Continua →",
  s6_no_spam: "🔒 Non inviamo spam né vendiamo i tuoi dati.",
  s6_confirmed_label: "Email confermata",
  s6_change: "Modifica",
  s6_first_name_label: "Nome", s6_last_name_label: "Cognome",
  s6_fname_placeholder: "Nome", s6_lname_placeholder: "Cognome",
  s6_phone_label: "Numero di telefono",
  s6_phone_sub: "Uno specialista ti contatterà su questo numero.",
  s6_loading_btn: "Configurazione in corso…",
  s6_confirm_btn: "Andiamo →",
  s6_consent_text: "Acconsento a essere contattato da uno specialista di trading e confermo di aver letto i Termini e l'Informativa sulla Privacy. Comprendo che il trading comporta rischi, il deposito minimo iniziale è di $250 e ho 18 anni o più.",
  s6_trust1: "🔒 Sicuro e privato", s6_trust2: "Nessuna carta di credito", s6_trust3: "Nessun impegno",
  s6_privacy_note: "🔒 I tuoi dati sono privati e non verranno mai condivisi o venduti.",
  s6_min_note: "Deposito minimo per iniziare:",
  s6_terms_note: "Continuando accetti i nostri",
  s6_terms_link: "Termini",
  s6_and: "e",
  s6_privacy_link: "Informativa sulla Privacy",

  err_email: "Inserisci un indirizzo email valido.",
  err_email_personal: "Usa il tuo indirizzo email personale.",
  err_first_name: "Inserisci il tuo nome.",
  err_last_name: "Inserisci il tuo cognome.",
  err_full_name: "Inserisci il tuo nome completo.",
  err_phone: "Inserisci il tuo numero di telefono.",
  err_phone_invalid: "Inserisci un numero di telefono valido.",
  err_too_many: "Troppi tentativi. Aggiorna la pagina e riprova.",
  err_rate_limit: "Troppi tentativi. Attendi un minuto e riprova.",
  err_generic: "Qualcosa è andato storto. Aggiorna la pagina e riprova.",
  err_network: "Problema di rete. Controlla la connessione e riprova.",
};

// ── GERMAN ────────────────────────────────────────────────────────────────────
const de: T = {
  live: "Live",
  watching: "{n} schauen gerade zu",
  ssl_secured: "SSL-gesichert",

  footer_risk_prefix: "Risikohinweis:",
  footer_risk_body: "Der Handel mit Finanzinstrumenten ist mit erheblichen Risiken verbunden. Preise können schwanken und Sie könnten mehr als Ihre anfängliche Einzahlung verlieren. Handeln Sie nur mit Kapital, das Sie sich leisten können zu verlieren. Vergangene Ergebnisse sind kein Indikator für zukünftige Resultate. Die Mindesteinzahlung beträgt $250.",
  footer_terms: "AGB",
  footer_privacy: "Datenschutz",
  footer_deposits: "Warum Einzahlungen scheitern",
  footer_copyright: "© 2026 TradePilot",

  s1_headline: "Ganz normale Menschen verdienen echtes Geld mit Trading. Warum du nicht?",
  s1_subtext: "Keine Banker. Keine Hedgefonds. Normale Menschen Lehrer, Fahrer, Eltern die es leid waren, nur zuzuschauen. Sie alle haben genau dort angefangen, wo du jetzt bist.",
  s1_cta_above: "Zeig mir, wie es funktioniert",
  s1_profit_label: "Heute von unseren Tradern verdient",
  s1_profit_sublabel: "Live · aktualisiert sich alle paar Sekunden",
  s1_real_accounts: "Echte Konten",
  s1_challenge_title: "Passiert gerade jetzt",
  s1_challenge_headline: "Während du das liest, haben {n} Personen heute ihren ersten Trade gemacht.",
  s1_challenge_sub: "Keine Profi-Investoren. Keine Reichen. Nur Menschen, die aufgehört haben zu sagen \"vielleicht eines Tages\" und einen Knopf gedrückt haben. Das Einzige, was sie gerade von dir trennt, ist dieser Knopf.",
  s1_daily_cap: "Tägliches Limit: 100 Plätze",
  s1_mind_label: "Kurze Frage",
  s1_mind_question: "Was macht dein Geld, während du schläfst?",
  s1_mind_nothing: "Praktisch nichts",
  s1_mind_works: "Es arbeitet für mich",
  s1_mind_nothing_title: "Das ist die Lücke. Und sie ist schließbar.",
  s1_mind_nothing_body: "Ein Sparkonto zahlt dir ~0,5% pro Jahr. Der Markt bewegt sich genauso viel in Minuten. Die Leute, die Geld verdienen, sind nicht klüger sie haben nur gelernt, auf der richtigen Seite dieser Bewegungen zu sein.",
  s1_mind_nothing_footer: "Genau das werden wir dir zeigen.",
  s1_mind_works_title: "Dann weißt du schon, warum du hier bist.",
  s1_mind_works_body: "Du verstehst das Prinzip. Was wir dir zeigen werden, ist der schnellste Weg mit dem geringsten Risiko, es anzuwenden ohne Erfahrung, ohne Finanzstudium, ohne stundenlang vor Charts zu sitzen.",
  s1_activity_title: "Live-Auszahlungen",
  s1_activity_verified: "verifiziert · echte Konten",
  s1_trust_t1: "47.000+", s1_trust_t2: "Trader dabei",
  s1_trust_c1: "Verfügbar in", s1_trust_c2: "deinem Land",
  s1_trust_f1: "Kostenlos", s1_trust_f2: "Beitreten",
  s1_deposit_title: "Eine Sache, die du vor dem Weitermachen wissen solltest",
  s1_deposit_body: "Um tatsächlich zu traden, verlangen Broker eine Mindesteinzahlung von $250. Das ist keine Gebühr an uns es ist dein eigenes Handelskapital, das auf deinem Konto liegt, das du kontrollierst und jederzeit abheben kannst.",
  s1_deposit_own1: "Dein Geld", s1_deposit_own2: "Keine Gebühr",
  s1_deposit_with1: "Auszahlbar", s1_deposit_with2: "Jederzeit",
  s1_deposit_reg1: "Reguliert", s1_deposit_reg2: "Broker-verwahrt",
  s1_cta_main: "Zeig mir genau, wie das funktioniert",
  s1_cta_sub: "60 Sekunden Einrichtung · keine Kreditkarte nötig",

  s2_step1: "Deine Situation", s2_step2: "Kurzes Quiz", s2_step3: "Zugang erhalten",
  s2_missed_label: "Während du das liest, haben unsere Trader verdient",
  s2_missed_sub: "Der Markt macht keine Pause für niemanden.",
  s2_question_label: "Kurze Frage",
  s2_headline: "Sei ehrlich welche Aussage passt zu dir?",
  s2_subtext: "In jedem Fall sind wir für dich da. Wähle einfach, was am nächsten drankommt.",
  s2_opt1_head: "Ich sehe, wie andere mit Trading Geld verdienen, und frage mich, warum ich noch nicht angefangen habe",
  s2_opt1_sub: "Ich weiß, dass es möglich ist ich habe den ersten Schritt noch nicht gemacht",
  s2_opt2_head: "Ich habe Trading schon mal versucht und es lief nicht gut ich habe Geld verloren und war entmutigt",
  s2_opt2_sub: "Ich glaube immer noch daran, ich hatte nur nicht den richtigen Ansatz",
  s2_opt3_head: "Ich habe keine Zeit, den ganzen Tag auf Charts zu starren ich habe einen Job, eine Familie, ein Leben",
  s2_opt3_sub: "Wenn es einen Weg gibt, das zu tun, ohne es zum Zweitjob zu machen, bin ich dabei",
  s2_footer: "Deine Antwort hilft uns, das anzupassen, was du als nächstes siehst",

  s3_progress_label: "Dein Profil wird erstellt…",
  s3_question_label: "Frage {q} von {total}",
  s3_footer: "Es gibt keine richtigen oder falschen Antworten sie helfen uns nur, dir das Relevante zu zeigen",
  s3_q1: "Was hält dich wirklich davon ab, jetzt mit dem Trading anzufangen?",
  s3_a1_1: "Ehrlich gesagt weiß ich nicht, wo ich anfangen soll",
  s3_a1_2: "Ich habe Angst, Geld zu verlieren",
  s3_a1_3: "Ich habe einfach keine Zeit, alles herauszufinden",
  s3_a1_4: "Ich habe es einmal versucht und es lief schlecht",
  s3_q2: "Wenn dir etwas einen klaren, risikoarmen Trade zeigen würde würdest du ihn machen?",
  s3_a2_1: "Ja, sofort",
  s3_a2_2: "Wahrscheinlich ich hätte gerne erst eine kurze Erklärung",
  s3_a2_3: "Vielleicht ich würde kurz darüber nachdenken",
  s3_a2_4: "Eher nicht, ich würde zu viel nachdenken",
  s3_q3: "Was würde ein Extra-Einkommen von $1.000–$3.000 pro Monat wirklich für dein Leben bedeuten?",
  s3_a3_1: "Endlich meine Schulden abbezahlen",
  s3_a3_2: "Meine Arbeitsstunden reduzieren",
  s3_a3_3: "Jeden Monat etwas entspannter sein",
  s3_a3_4: "Etwas Echtes für meine Zukunft aufbauen",

  s4_loading_1: "Deine Antworten werden gelesen…",
  s4_loading_2: "Trader mit ähnlichem Hintergrund werden gesucht…",
  s4_loading_3: "Es wird geprüft, was bei ihnen funktioniert hat…",
  s4_loading_4: "Dein Passgenauigkeitswert wird berechnet…",
  s4_loading_5: "Fertig hier ist, was wir gefunden haben.",
  s4_fit_label: "Dein Passgenauigkeitswert",
  s4_fit_sub: "Wie gut du zu Tradern passt, die tatsächlich profitabel sind",
  s4_result_headline: "Was deine Antworten wirklich bedeuten:",
  s4_result_watching: "Menschen, die sich ein bisschen Zeit nehmen, um sich zu informieren, bevor sie einsteigen, bleiben tendenziell länger dabei und machen es besser. Das bist du. Du bist nicht blindlings reingestürzt und das kommt dir zugute, sobald du die richtige Einrichtung hast.",
  s4_result_tried: "Hier ist die Sache vorher Geld verloren zu haben bedeutet nicht, dass Trading nichts für dich ist. Es bedeutet meist nur, dass die Werkzeuge nicht richtig eingestellt waren. Trader, die am Anfang Schwierigkeiten hatten und dann die Wende schafften, sind oft die konstantesten. Du weißt schon, was du nicht tun solltest das bringt dich nach vorne.",
  s4_result_no_time: "Gute Neuigkeit genau dafür wurde die Plattform gebaut. Die meisten Menschen drin haben Vollzeitjobs, Familien und null Freizeit, um auf Charts zu starren. Deshalb gibt es automatisiertes und Copy-Trading: die schwere Arbeit wird für dich erledigt. Du entscheidest, wie viel du einsetzt, das System übernimmt den Rest.",
  s4_modes_label: "Drei Wege zu traden wähle, was zu deinem Leben passt",
  s4_mode1_title: "Automatisiertes Trading", s4_mode1_badge: "Am beliebtesten",
  s4_mode1_desc: "Stelle dein Risikolevel einmal ein. Die Plattform platziert und verwaltet Trades automatisch 24/5 basierend auf bewährten Strategien. Du musst nichts beobachten.",
  s4_mode2_title: "Copy-Trading", s4_mode2_badge: "Ideal für Einsteiger",
  s4_mode2_desc: "Wähle einen erfahrenen Trader zum Folgen. Jeder Trade, den er macht, wird automatisch proportional auf deinem Konto gespiegelt.",
  s4_mode3_title: "Manuelles Trading", s4_mode3_badge: "Volle Kontrolle",
  s4_mode3_desc: "Setze eigene Trades mithilfe von Live-Charts, Signalen und Analysetools. Am besten für diejenigen, die aktiv sein und die Märkte lernen wollen.",
  s4_mode_recommended: "Für dich empfohlen",
  s4_test1_text: "Vor vier Monaten war ich genau dort, wo du jetzt bist. Hatte wirklich keine Ahnung. Jetzt ist das Erste, was ich morgens überprüfe, nicht der Wecker sondern was über Nacht passiert ist.",
  s4_test2_text: "Ich hatte zweimal Geld verbrannt, indem ich alleine versuchte zu traden. Das fühlte sich von Anfang an anders an es sagt dir, was du tun sollst, anstatt dich raten zu lassen.",
  s4_test3_text: "Ein Kollege hat mir das gezeigt und ich war skeptisch. Drei Wochen später hatte ich alles zurückgewonnen, was ich beim ersten Versuch verloren hatte. Hätte ich es früher gefunden.",
  s4_stat1_label: "Personen bereits dabei", s4_stat2_label: "Profitabel innerhalb von 90 Tagen", s4_stat3_label: "Zum Starten",
  s4_urgency_title: "Begrenzte Plätze heute", s4_urgency_sub1: "Nur noch wenige übrig", s4_urgency_sub2: "Wird alle 24 Stunden zurückgesetzt",
  s4_cta: "Meinen kostenlosen Platz sichern",

  s5_spots_one: "1 Platz heute noch verfügbar",
  s5_spots_many: "{n} Plätze heute noch verfügbar",
  s5_countdown_label: "Dein Platz ist reserviert für",
  s5_expired: "Zeit abgelaufen",
  s5_expired_sub: "Wenn das abläuft, wird dein Profil zurückgesetzt und du müsstest von vorne anfangen.",
  s5_spots_title: "Freie Plätze in deiner Region",
  s5_spots_sub: "Wird alle 24 Stunden aktualisiert",
  s5_spots_total: "/ 10 gesamt",
  s5_what_happens: "Was passiert wirklich, wenn du das schließt?",
  s5_c1: "Der Markt bewegt sich weiter mit oder ohne dich.",
  s5_c2: "Dein Profil verschwindet und du müsstest alles erneut beantworten.",
  s5_c3: "Jemand anderes in deiner Region nimmt deinen Platz.",
  s5_c4: "Menschen, die letzte Woche angemeldet haben, sehen bereits erste Ergebnisse.",
  s5_qualify_label: "Bevor du deinen Platz beanspruchst stelle sicher, dass du qualifiziert bist",
  s5_q1: "Du hast ein Gerät mit Internetzugang",
  s5_q2: "Du kannst 10 Minuten für die Kontoeinrichtung entbehren",
  s5_q3: "Du verstehst, dass Trading mit Risiken verbunden ist",
  s5_q4: "Du kannst mit mindestens $250 beginnen (dein Handelskapital keine Gebühr, jederzeit auszahlbar)",
  s5_qualify_footer: "Wenn all das oben auf dich zutrifft, ist dein Platz unten reserviert.",
  s5_cta: "Meinen kostenlosen Platz jetzt sichern",
  s5_cta_sub: "Kostenlos · kein Risiko · dauert etwa 45 Sekunden",

  s6_progress_label: "Fast fertig…",
  s6_headline: "Letzter Schritt richte dein Konto ein",
  s6_subtext: "Dein Profil ist fertig. Sag uns einfach, wohin wir deinen Zugang schicken sollen, und ein Trading-Spezialist wird sich melden, um dich zu starten.",
  s6_min_deposit_label: "Mindestanlagebetrag:",
  s6_specialist_role: "Senior Trading-Spezialist",
  s6_specialist_quote: "Ich werde dein Profil persönlich prüfen und dich beim Einrichten deines ersten Trades in unserem Onboarding-Gespräch begleiten. Etwa 20 Minuten. Kein Druck, nur deine Fragen beantworten.",
  s6_specialist_online: "Jetzt online antwortet normalerweise innerhalb von 2 Std.",
  s6_step1_title: "Wohin sollen wir deinen Zugang schicken?",
  s6_step1_sub: "10 Sekunden. Keine Karte nötig.",
  s6_email_label: "E-Mail-Adresse",
  s6_email_placeholder: "du@beispiel.com",
  s6_continue_btn: "Weiter →",
  s6_no_spam: "🔒 Wir spammen nicht und verkaufen keine Daten.",
  s6_confirmed_label: "E-Mail bestätigt",
  s6_change: "Ändern",
  s6_first_name_label: "Vorname", s6_last_name_label: "Nachname",
  s6_fname_placeholder: "Vorname", s6_lname_placeholder: "Nachname",
  s6_phone_label: "Telefonnummer",
  s6_phone_sub: "Ein echter Mensch wird dich zur Einrichtung kontaktieren.",
  s6_loading_btn: "Wird eingerichtet…",
  s6_confirm_btn: "Los geht's →",
  s6_consent_text: "Ich stimme zu, von einem Trading-Spezialisten kontaktiert zu werden, und bestätige, dass ich die AGB und Datenschutzerklärung gelesen habe. Ich verstehe, dass Trading Risiken beinhaltet, die Mindesteinzahlung $250 beträgt und ich 18 Jahre oder älter bin.",
  s6_trust1: "🔒 Sicher & privat", s6_trust2: "Keine Kreditkarte", s6_trust3: "Keine Verpflichtung",
  s6_privacy_note: "🔒 Deine Daten werden privat gehalten und niemals geteilt oder verkauft.",
  s6_min_note: "Mindesteinzahlung zum Starten:",
  s6_terms_note: "Mit dem Fortfahren stimmst du unseren",
  s6_terms_link: "AGB",
  s6_and: "und der",
  s6_privacy_link: "Datenschutzerklärung zu",

  err_email: "Bitte gib eine gültige E-Mail-Adresse ein.",
  err_email_personal: "Bitte verwende deine persönliche E-Mail-Adresse.",
  err_first_name: "Bitte gib deinen Vornamen ein.",
  err_last_name: "Bitte gib deinen Nachnamen ein.",
  err_full_name: "Bitte gib deinen vollständigen Namen ein.",
  err_phone: "Bitte gib deine Telefonnummer ein.",
  err_phone_invalid: "Bitte gib eine gültige Telefonnummer ein.",
  err_too_many: "Zu viele Versuche. Bitte aktualisiere die Seite und versuche es erneut.",
  err_rate_limit: "Zu viele Versuche. Bitte warte eine Minute und versuche es erneut.",
  err_generic: "Etwas ist schiefgelaufen. Bitte aktualisiere die Seite und versuche es erneut.",
  err_network: "Netzwerkproblem. Bitte überprüfe deine Verbindung und versuche es erneut.",
};

// ── FRENCH ────────────────────────────────────────────────────────────────────
const fr: T = {
  live: "Live",
  watching: "{n} personnes regardent maintenant",
  ssl_secured: "Connexion SSL sécurisée",

  footer_risk_prefix: "Avertissement sur les risques :",
  footer_risk_body: "Le trading d'instruments financiers comporte des risques importants. Les prix peuvent fluctuer et vous pourriez perdre plus que votre dépôt initial. Ne tradez qu'avec du capital que vous pouvez vous permettre de perdre. Les performances passées ne préjugent pas des résultats futurs. Le dépôt minimum de départ est de 250 $.",
  footer_terms: "CGU",
  footer_privacy: "Confidentialité",
  footer_deposits: "Pourquoi les dépôts échouent",
  footer_copyright: "© 2026 TradePilot",

  s1_headline: "Des gens ordinaires gagnent vraiment de l'argent avec le trading. Alors pourquoi pas toi ?",
  s1_subtext: "Pas des banquiers. Pas des hedge funds. Des gens normaux des enseignants, des chauffeurs, des parents qui en avaient assez de regarder depuis les coulisses. Ils ont tous commencé exactement là où tu es maintenant.",
  s1_cta_above: "Montre-moi comment ça marche",
  s1_profit_label: "Total gagné par nos traders aujourd'hui",
  s1_profit_sublabel: "En direct · se met à jour toutes les quelques secondes",
  s1_real_accounts: "Comptes réels",
  s1_challenge_title: "Ça se passe maintenant",
  s1_challenge_headline: "Pendant que tu lis ceci, {n} personnes ont passé leur premier trade aujourd'hui.",
  s1_challenge_sub: "Pas des investisseurs. Pas des riches. Juste des gens qui ont arrêté de dire \"peut-être un jour\" et ont cliqué sur un bouton. La seule chose qui les distingue de toi en ce moment, c'est ce bouton.",
  s1_daily_cap: "Limite journalière : 100 places",
  s1_mind_label: "Question rapide",
  s1_mind_question: "Qu'est-ce que ton argent fait pendant que tu dors ?",
  s1_mind_nothing: "Pratiquement rien",
  s1_mind_works: "Il travaille pour moi",
  s1_mind_nothing_title: "C'est le fossé. Et il est comblable.",
  s1_mind_nothing_body: "Un compte épargne te rapporte ~0,5 % par an. Le marché bouge autant en quelques minutes. Les gens qui gagnent de l'argent ne sont pas plus intelligents ils ont juste appris à être du bon côté de ces mouvements.",
  s1_mind_nothing_footer: "C'est exactement ce que nous allons te montrer.",
  s1_mind_works_title: "Alors tu sais déjà pourquoi tu es là.",
  s1_mind_works_body: "Tu comprends le principe. Ce que nous te montrerons, c'est la façon la plus rapide et la moins risquée de l'appliquer sans expérience, sans diplôme de finance, sans passer des heures devant des graphiques.",
  s1_activity_title: "Retraits en direct",
  s1_activity_verified: "vérifié · comptes réels",
  s1_trust_t1: "47 000+", s1_trust_t2: "Traders inscrits",
  s1_trust_c1: "Disponible dans", s1_trust_c2: "ton pays",
  s1_trust_f1: "Gratuit", s1_trust_f2: "Pour s'inscrire",
  s1_deposit_title: "Une chose à savoir avant de continuer",
  s1_deposit_body: "Pour trader, les brokers exigent un dépôt de départ minimum de 250 $. Ce n'est pas des frais versés à nous c'est ton propre capital de trading, sur ton compte, que tu contrôles et peux retirer à tout moment.",
  s1_deposit_own1: "Ton argent", s1_deposit_own2: "Pas des frais",
  s1_deposit_with1: "Retirable", s1_deposit_with2: "À tout moment",
  s1_deposit_reg1: "Régulé", s1_deposit_reg2: "Détenu par le broker",
  s1_cta_main: "Montre-moi exactement comment ça fonctionne",
  s1_cta_sub: "60 secondes pour s'inscrire · aucune carte requise",

  s2_step1: "Ta situation", s2_step2: "Quiz rapide", s2_step3: "Obtenir l'accès",
  s2_missed_label: "Pendant que tu lis ceci, nos traders ont gagné",
  s2_missed_sub: "Le marché ne s'arrête pour personne.",
  s2_question_label: "Question rapide",
  s2_headline: "Sois honnête laquelle c'est toi ?",
  s2_subtext: "Dans tous les cas, on est là pour toi. Choisis juste ce qui te ressemble le plus.",
  s2_opt1_head: "Je vois des gens gagner de l'argent avec le trading et je me demande pourquoi je n'ai pas encore commencé",
  s2_opt1_sub: "Je sais que c'est possible je n'ai juste pas encore fait le premier pas",
  s2_opt2_head: "J'ai déjà essayé le trading sans succès j'ai perdu de l'argent et je me suis découragé",
  s2_opt2_sub: "Je crois toujours que ça marche, je n'avais juste pas la bonne approche",
  s2_opt3_head: "Je n'ai pas le temps de passer mes journées à regarder des graphiques j'ai un travail, une famille, une vie",
  s2_opt3_sub: "S'il y a un moyen de le faire sans que ça devienne un second emploi, je suis intéressé",
  s2_footer: "Ta réponse nous aide à personnaliser ce que tu verras ensuite",

  s3_progress_label: "Création de ton profil en cours…",
  s3_question_label: "Question {q} sur {total}",
  s3_footer: "Il n'y a pas de bonne ou mauvaise réponse elles nous aident juste à te montrer ce qui est vraiment pertinent pour toi",
  s3_q1: "Qu'est-ce qui te retient vraiment de trader en ce moment ?",
  s3_a1_1: "Honnêtement, je ne sais pas par où commencer",
  s3_a1_2: "J'ai peur de perdre de l'argent",
  s3_a1_3: "Je n'ai tout simplement pas le temps de tout comprendre",
  s3_a1_4: "J'ai déjà essayé une fois et ça s'est mal passé",
  s3_q2: "Si quelque chose te montrait un trade clair et à faible risque est-ce que tu le ferais ?",
  s3_a2_1: "Oui, tout de suite",
  s3_a2_2: "Probablement j'aurais besoin d'une explication rapide d'abord",
  s3_a2_3: "Peut-être j'y réfléchirais un peu",
  s3_a2_4: "Probablement pas, j'y réfléchirais trop",
  s3_q3: "Que signifierait vraiment un revenu supplémentaire de 1 000 à 3 000 $ par mois pour ta vie ?",
  s3_a3_1: "Enfin rembourser mes dettes",
  s3_a3_2: "Réduire mes heures de travail",
  s3_a3_3: "Simplement respirer plus librement chaque mois",
  s3_a3_4: "Construire quelque chose de concret pour mon avenir",

  s4_loading_1: "Lecture de tes réponses…",
  s4_loading_2: "Recherche de traders avec un profil similaire…",
  s4_loading_3: "Vérification de ce qui a fonctionné pour eux…",
  s4_loading_4: "Calcul de ton score de compatibilité…",
  s4_loading_5: "Terminé voici ce que nous avons trouvé.",
  s4_fit_label: "Ton score de compatibilité",
  s4_fit_sub: "À quel point tu ressembles aux traders qui sont réellement profitables",
  s4_result_headline: "Ce que tes réponses signifient vraiment :",
  s4_result_watching: "Les personnes qui prennent le temps de se renseigner avant de se lancer ont tendance à rester plus longtemps et à mieux s'en sortir. C'est toi. Tu ne t'es pas lancé aveuglément et ça joue en ta faveur une fois que tu as la bonne configuration.",
  s4_result_tried: "Voilà la chose avoir perdu de l'argent avant ne signifie pas que le trading n'est pas fait pour toi. Ça signifie généralement juste que les outils n'étaient pas bien configurés. Les traders qui ont eu des difficultés au début et qui ont ensuite retourné la situation sont souvent les plus constants. Tu sais déjà ce qu'il ne faut pas faire ce qui t'avantage.",
  s4_result_no_time: "Bonne nouvelle c'est exactement pour ça que la plateforme a été construite. La majorité des personnes qui l'utilisent ont un emploi à temps plein, une famille et zéro temps libre pour regarder des graphiques. C'est pourquoi le trading automatisé et le copy trading existent : le travail lourd est fait pour toi. Tu décides combien allouer, le système s'occupe du reste.",
  s4_modes_label: "Trois façons de trader tu choisis ce qui correspond à ta vie",
  s4_mode1_title: "Trading automatisé", s4_mode1_badge: "Le plus populaire",
  s4_mode1_desc: "Règle ton niveau de risque une seule fois. La plateforme place et gère automatiquement les trades 24h/5j basé sur des stratégies éprouvées. Tu n'as rien à surveiller.",
  s4_mode2_title: "Copy trading", s4_mode2_badge: "Idéal pour les débutants",
  s4_mode2_desc: "Choisis un trader expert à suivre. Chaque trade qu'il fait est automatiquement copié sur ton compte, proportionnellement à ton solde.",
  s4_mode3_title: "Trading manuel", s4_mode3_badge: "Contrôle total",
  s4_mode3_desc: "Place tes propres trades en utilisant des graphiques en direct, des signaux et des outils d'analyse. Idéal pour ceux qui veulent être actifs et apprendre les marchés.",
  s4_mode_recommended: "Recommandé pour toi",
  s4_test1_text: "Il y a quatre mois j'étais exactement là où tu es maintenant. Vraiment aucune idée. Maintenant la première chose que je vérifie le matin ce n'est pas mon réveil c'est ce qui s'est fermé pendant la nuit.",
  s4_test2_text: "J'avais brûlé de l'argent deux fois en essayant de trader seul. Ça semblait différent dès le début ça te dit quoi faire au lieu de te laisser deviner.",
  s4_test3_text: "Un collègue m'a montré ça et j'étais sceptique. Trois semaines plus tard j'avais récupéré tout ce que j'avais perdu lors de ma première tentative. J'aurais aimé le trouver plus tôt.",
  s4_stat1_label: "Personnes déjà inscrites", s4_stat2_label: "Profitable sous 90 jours", s4_stat3_label: "Pour démarrer",
  s4_urgency_title: "Places limitées aujourd'hui", s4_urgency_sub1: "Il n'en reste que quelques-unes", s4_urgency_sub2: "Se réinitialise toutes les 24 heures",
  s4_cta: "Réserver ma place gratuite",

  s5_spots_one: "1 place restante aujourd'hui",
  s5_spots_many: "{n} places restantes aujourd'hui",
  s5_countdown_label: "Ta place est réservée pendant",
  s5_expired: "Temps expiré",
  s5_expired_sub: "Une fois expiré, ton profil se réinitialise et tu devrais tout recommencer.",
  s5_spots_title: "Places disponibles dans ta zone",
  s5_spots_sub: "Se rafraîchit toutes les 24 heures",
  s5_spots_total: "/ 10 au total",
  s5_what_happens: "Que se passe-t-il vraiment si tu fermes ceci ?",
  s5_c1: "Le marché continue de bouger avec ou sans toi.",
  s5_c2: "Ton profil disparaît et tu devrais tout répondre à nouveau.",
  s5_c3: "Quelqu'un d'autre dans ta zone prend ta place.",
  s5_c4: "Les personnes inscrites la semaine dernière voient déjà leurs premiers résultats.",
  s5_qualify_label: "Avant de réclamer ta place vérifie que tu es qualifié",
  s5_q1: "Tu as un appareil avec accès à internet",
  s5_q2: "Tu peux consacrer 10 minutes à la configuration de ton compte",
  s5_q3: "Tu comprends que le trading comporte des risques",
  s5_q4: "Tu es capable de commencer avec un minimum de 250 $ (ton capital de trading pas des frais, entièrement retirable)",
  s5_qualify_footer: "Si tout ce qui précède s'applique à toi, ta place est réservée ci-dessous.",
  s5_cta: "Réserver ma place gratuite maintenant",
  s5_cta_sub: "Gratuit · sans engagement · prend environ 45 secondes",

  s6_progress_label: "Presque terminé…",
  s6_headline: "Dernière étape configurons ton compte",
  s6_subtext: "Ton profil est prêt. Dis-nous juste où envoyer ton accès et un spécialiste du trading te contactera pour te lancer.",
  s6_min_deposit_label: "Montant minimum de départ :",
  s6_specialist_role: "Spécialiste Trading Senior",
  s6_specialist_quote: "Je vais personnellement examiner ton profil et te guider dans la configuration de ton premier trade lors de notre appel d'intégration. Environ 20 minutes. Aucune pression, juste répondre à tes questions.",
  s6_specialist_online: "En ligne maintenant répond généralement sous 2 h",
  s6_step1_title: "Où doit-on envoyer ton accès ?",
  s6_step1_sub: "10 secondes. Aucune carte requise.",
  s6_email_label: "Adresse e-mail",
  s6_email_placeholder: "toi@exemple.com",
  s6_continue_btn: "Continuer →",
  s6_no_spam: "🔒 Nous ne spammons jamais ni ne vendons tes données.",
  s6_confirmed_label: "E-mail confirmé",
  s6_change: "Modifier",
  s6_first_name_label: "Prénom", s6_last_name_label: "Nom de famille",
  s6_fname_placeholder: "Prénom", s6_lname_placeholder: "Nom",
  s6_phone_label: "Numéro de téléphone",
  s6_phone_sub: "Un vrai spécialiste te contactera pour t'aider à t'installer.",
  s6_loading_btn: "Configuration en cours…",
  s6_confirm_btn: "C'est parti →",
  s6_consent_text: "J'accepte d'être contacté par un spécialiste du trading et confirme avoir lu les CGU et la Politique de confidentialité. Je comprends que le trading comporte des risques, le dépôt minimum de départ est de 250 $ et j'ai 18 ans ou plus.",
  s6_trust1: "🔒 Sécurisé et privé", s6_trust2: "Sans carte de crédit", s6_trust3: "Sans engagement",
  s6_privacy_note: "🔒 Tes informations sont privées et ne seront jamais partagées ni vendues.",
  s6_min_note: "Dépôt minimum pour commencer :",
  s6_terms_note: "En continuant tu acceptes nos",
  s6_terms_link: "CGU",
  s6_and: "et notre",
  s6_privacy_link: "Politique de confidentialité",

  err_email: "Veuillez entrer une adresse e-mail valide.",
  err_email_personal: "Veuillez utiliser ton adresse e-mail personnelle.",
  err_first_name: "Veuillez entrer ton prénom.",
  err_last_name: "Veuillez entrer ton nom de famille.",
  err_full_name: "Veuillez entrer ton nom complet.",
  err_phone: "Veuillez entrer ton numéro de téléphone.",
  err_phone_invalid: "Veuillez entrer un numéro de téléphone valide.",
  err_too_many: "Trop de tentatives. Veuillez actualiser la page et réessayer.",
  err_rate_limit: "Trop de tentatives. Veuillez attendre une minute et réessayer.",
  err_generic: "Une erreur s'est produite. Veuillez actualiser la page et réessayer.",
  err_network: "Problème de réseau. Veuillez vérifier ta connexion et réessayer.",
};

// ── SPANISH ───────────────────────────────────────────────────────────────────
const es: T = {
  live: "En vivo",
  watching: "{n} personas viendo ahora",
  ssl_secured: "Conexión SSL segura",

  footer_risk_prefix: "Advertencia de riesgo:",
  footer_risk_body: "El trading de instrumentos financieros conlleva riesgos significativos. Los precios pueden fluctuar y podrías perder más de tu depósito inicial. Opera solo con capital que puedas permitirte perder. El rendimiento pasado no es indicativo de resultados futuros. El depósito mínimo de inicio es de $250.",
  footer_terms: "Términos",
  footer_privacy: "Privacidad",
  footer_deposits: "Por qué fallan los depósitos",
  footer_copyright: "© 2026 TradePilot",

  s1_headline: "Personas normales están ganando dinero real con el trading. ¿Y tú por qué no?",
  s1_subtext: "No son banqueros. No son fondos de inversión. Personas normales maestros, conductores, padres que se cansaron de mirar desde las gradas. Todos empezaron exactamente donde estás tú ahora.",
  s1_cta_above: "Muéstrame cómo funciona",
  s1_profit_label: "Total ganado por nuestros traders hoy",
  s1_profit_sublabel: "En directo · se actualiza cada pocos segundos",
  s1_real_accounts: "Cuentas reales",
  s1_challenge_title: "Está pasando ahora mismo",
  s1_challenge_headline: "Mientras lees esto, {n} personas han hecho su primer trade hoy.",
  s1_challenge_sub: "No son inversores. No son ricos. Solo personas que dejaron de decir \"quizás algún día\" y pulsaron un botón. Lo único que les separa de ti ahora mismo es ese botón.",
  s1_daily_cap: "Límite diario: 100 plazas",
  s1_mind_label: "Pregunta rápida",
  s1_mind_question: "¿Qué hace tu dinero mientras duermes?",
  s1_mind_nothing: "Prácticamente nada",
  s1_mind_works: "Trabaja para mí",
  s1_mind_nothing_title: "Esa es la brecha. Y se puede cerrar.",
  s1_mind_nothing_body: "Una cuenta de ahorro te da ~0,5% al año. El mercado se mueve esa cantidad en minutos. Las personas que ganan dinero no son más inteligentes simplemente aprendieron a estar en el lado correcto de esos movimientos.",
  s1_mind_nothing_footer: "Eso es exactamente lo que te vamos a mostrar.",
  s1_mind_works_title: "Entonces ya sabes por qué estás aquí.",
  s1_mind_works_body: "Entiendes el principio. Lo que te mostraremos es la forma más rápida y con menos riesgo de aplicarlo sin experiencia, sin título de finanzas, sin pasar horas delante de gráficos.",
  s1_activity_title: "Retiros en directo",
  s1_activity_verified: "verificado · cuentas reales",
  s1_trust_t1: "47.000+", s1_trust_t2: "Traders dentro",
  s1_trust_c1: "Disponible en", s1_trust_c2: "tu país",
  s1_trust_f1: "Gratis", s1_trust_f2: "Para unirse",
  s1_deposit_title: "Una cosa que debes saber antes de continuar",
  s1_deposit_body: "Para operar, los brokers requieren un depósito mínimo de inicio de $250. No es una comisión para nosotros es tu propio capital de trading, en tu cuenta, que controlas tú y puedes retirar en cualquier momento.",
  s1_deposit_own1: "Tu dinero", s1_deposit_own2: "No es una comisión",
  s1_deposit_with1: "Retirable", s1_deposit_with2: "En cualquier momento",
  s1_deposit_reg1: "Regulado", s1_deposit_reg2: "Custodiado por broker",
  s1_cta_main: "Muéstrame exactamente cómo funciona esto",
  s1_cta_sub: "60 segundos para empezar · sin tarjeta de crédito",

  s2_step1: "Tu situación", s2_step2: "Quiz rápido", s2_step3: "Obtener acceso",
  s2_missed_label: "Mientras lees esto, nuestros traders han ganado",
  s2_missed_sub: "El mercado no hace pausas por nadie.",
  s2_question_label: "Pregunta rápida",
  s2_headline: "Sé honesto ¿cuál eres tú?",
  s2_subtext: "De cualquier manera te tenemos cubierto. Elige la que más se acerque.",
  s2_opt1_head: "Veo a gente ganar dinero con el trading y me pregunto por qué yo no he empezado todavía",
  s2_opt1_sub: "Sé que es posible simplemente no he dado el primer paso",
  s2_opt2_head: "Ya intenté hacer trading y no me fue bien perdí dinero y me desanimé",
  s2_opt2_sub: "Sigo creyendo que funciona, solo que no tenía el enfoque correcto",
  s2_opt3_head: "No tengo tiempo para estar todo el día mirando gráficos tengo trabajo, familia, vida",
  s2_opt3_sub: "Si hay una forma de hacerlo sin que se convierta en un segundo trabajo, me interesa",
  s2_footer: "Tu respuesta nos ayuda a personalizar lo que verás a continuación",

  s3_progress_label: "Creando tu perfil…",
  s3_question_label: "Pregunta {q} de {total}",
  s3_footer: "No hay respuestas correctas o incorrectas solo nos ayudan a mostrarte lo que es realmente relevante para ti",
  s3_q1: "¿Qué te frena realmente de hacer trading ahora mismo?",
  s3_a1_1: "Honestamente, no sé por dónde empezar",
  s3_a1_2: "Tengo miedo de perder dinero",
  s3_a1_3: "Simplemente no tengo tiempo para entenderlo todo",
  s3_a1_4: "Lo intenté una vez antes y salió mal",
  s3_q2: "Si algo te mostrara un trade claro y de bajo riesgo ¿lo harías?",
  s3_a2_1: "Sí, enseguida",
  s3_a2_2: "Probablemente querría una explicación rápida primero",
  s3_a2_3: "Quizás lo pensaría un poco",
  s3_a2_4: "Probablemente no, le daría demasiadas vueltas",
  s3_q3: "¿Qué significaría de verdad para tu vida tener $1.000–$3.000 extra al mes?",
  s3_a3_1: "Por fin liquidar mis deudas",
  s3_a3_2: "Reducir mis horas de trabajo",
  s3_a3_3: "Simplemente respirar más tranquilo cada mes",
  s3_a3_4: "Construir algo real para mi futuro",

  s4_loading_1: "Leyendo tus respuestas…",
  s4_loading_2: "Buscando traders con un perfil similar…",
  s4_loading_3: "Comprobando qué funcionó para ellos…",
  s4_loading_4: "Calculando tu puntuación de compatibilidad…",
  s4_loading_5: "Listo esto es lo que encontramos.",
  s4_fit_label: "Tu puntuación de compatibilidad",
  s4_fit_sub: "Cuánto te pareces a los traders que son realmente rentables",
  s4_result_headline: "Lo que realmente significan tus respuestas:",
  s4_result_watching: "Las personas que se toman un poco de tiempo para informarse antes de lanzarse tienden a quedarse más tiempo y a ir mejor. Eres tú. No te has lanzado a ciegas y eso juega a tu favor una vez que tienes la configuración adecuada.",
  s4_result_tried: "Aquí está la cuestión haber perdido dinero antes no significa que el trading no sea para ti. Generalmente solo significa que las herramientas no estaban bien configuradas. Los traders que tuvieron dificultades al principio y luego dieron la vuelta son a menudo los más consistentes. Ya sabes qué no hacer, lo que te pone por delante.",
  s4_result_no_time: "Buena noticia para esto exactamente fue construida la plataforma. La mayoría de las personas dentro tienen trabajos a tiempo completo, familias y cero tiempo libre para mirar gráficos. Por eso existen el trading automatizado y el copy trading: el trabajo pesado se hace por ti. Tú decides cuánto asignar, el sistema se encarga del resto.",
  s4_modes_label: "Tres formas de hacer trading tú eliges la que encaja con tu vida",
  s4_mode1_title: "Trading automatizado", s4_mode1_badge: "El más popular",
  s4_mode1_desc: "Configura tu nivel de riesgo una vez. La plataforma coloca y gestiona trades automáticamente 24/5 basándose en estrategias probadas. No necesitas vigilar nada.",
  s4_mode2_title: "Copy trading", s4_mode2_badge: "Ideal para principiantes",
  s4_mode2_desc: "Elige a un trader experto para seguir. Cada trade que hace se replica automáticamente en tu cuenta, en proporción a tu saldo.",
  s4_mode3_title: "Trading manual", s4_mode3_badge: "Control total",
  s4_mode3_desc: "Coloca tus propios trades usando gráficos en directo, señales y herramientas de análisis. Ideal para quienes quieren ser activos y aprender los mercados.",
  s4_mode_recommended: "Recomendado para ti",
  s4_test1_text: "Hace cuatro meses estaba exactamente donde tú estás ahora. De verdad no tenía ni idea. Ahora lo primero que reviso por la mañana no es la alarma sino lo que cerró durante la noche.",
  s4_test2_text: "Había quemado dinero dos veces intentando hacer trading solo. Esto se sentía diferente desde el principio te dice qué hacer en lugar de dejarte adivinar.",
  s4_test3_text: "Un compañero del trabajo me mostró esto y era escéptico. Tres semanas después había recuperado todo lo que perdí en mi primer intento. Ojalá lo hubiera encontrado antes.",
  s4_stat1_label: "Personas ya dentro", s4_stat2_label: "Rentables en 90 días", s4_stat3_label: "Para empezar",
  s4_urgency_title: "Plazas limitadas hoy", s4_urgency_sub1: "Solo quedan unas pocas", s4_urgency_sub2: "Se reinicia cada 24 horas",
  s4_cta: "Reservar mi plaza gratuita",

  s5_spots_one: "1 plaza restante hoy",
  s5_spots_many: "{n} plazas restantes hoy",
  s5_countdown_label: "Tu plaza está reservada durante",
  s5_expired: "Tiempo expirado",
  s5_expired_sub: "Cuando esto expire tu perfil se reinicia y tendrías que empezar desde cero.",
  s5_spots_title: "Plazas abiertas en tu área",
  s5_spots_sub: "Se actualiza cada 24 horas",
  s5_spots_total: "/ 10 en total",
  s5_what_happens: "¿Qué pasa realmente si cierras esto?",
  s5_c1: "El mercado sigue moviéndose con o sin ti.",
  s5_c2: "Tu perfil desaparece y tendrías que responder todo de nuevo.",
  s5_c3: "Alguien más en tu área ocupa tu plaza.",
  s5_c4: "Las personas que se registraron la semana pasada ya están viendo sus primeros resultados.",
  s5_qualify_label: "Antes de reclamar tu plaza asegúrate de que cumples los requisitos",
  s5_q1: "Tienes un dispositivo con acceso a internet",
  s5_q2: "Puedes dedicar 10 minutos a configurar tu cuenta",
  s5_q3: "Entiendes que el trading conlleva riesgos",
  s5_q4: "Puedes empezar con un mínimo de $250 (tu capital de trading no una comisión, totalmente retirable)",
  s5_qualify_footer: "Si todo lo anterior se aplica a ti, tu plaza está reservada abajo.",
  s5_cta: "Asegurar mi plaza gratuita ahora",
  s5_cta_sub: "Gratis · sin obligación · tarda unos 45 segundos",

  s6_progress_label: "Casi listo…",
  s6_headline: "Último paso configuremos tu cuenta",
  s6_subtext: "Tu perfil está listo. Solo dinos dónde enviarte el acceso y un especialista en trading se pondrá en contacto contigo para empezar.",
  s6_min_deposit_label: "Importe mínimo de inicio:",
  s6_specialist_role: "Especialista Trading Senior",
  s6_specialist_quote: "Voy a revisar personalmente tu perfil y a guiarte en la configuración de tu primer trade en nuestra llamada de incorporación. Unos 20 minutos. Sin presión, solo respondiendo tus preguntas.",
  s6_specialist_online: "En línea ahora normalmente responde en 2 h",
  s6_step1_title: "¿Dónde debemos enviarte el acceso?",
  s6_step1_sub: "10 segundos. Sin tarjeta.",
  s6_email_label: "Dirección de correo electrónico",
  s6_email_placeholder: "tu@ejemplo.com",
  s6_continue_btn: "Continuar →",
  s6_no_spam: "🔒 Nunca enviamos spam ni vendemos tus datos.",
  s6_confirmed_label: "Correo confirmado",
  s6_change: "Cambiar",
  s6_first_name_label: "Nombre", s6_last_name_label: "Apellido",
  s6_fname_placeholder: "Nombre", s6_lname_placeholder: "Apellido",
  s6_phone_label: "Número de teléfono",
  s6_phone_sub: "Un especialista real te contactará para ayudarte con la configuración.",
  s6_loading_btn: "Configurando…",
  s6_confirm_btn: "¡Vamos! →",
  s6_consent_text: "Acepto ser contactado por un especialista en trading y confirmo haber leído los Términos y la Política de privacidad. Entiendo que el trading conlleva riesgos, el depósito mínimo de inicio es de $250 y tengo 18 años o más.",
  s6_trust1: "🔒 Seguro y privado", s6_trust2: "Sin tarjeta de crédito", s6_trust3: "Sin compromiso",
  s6_privacy_note: "🔒 Tus datos son privados y nunca se compartirán ni venderán.",
  s6_min_note: "Depósito mínimo para empezar:",
  s6_terms_note: "Al continuar aceptas nuestros",
  s6_terms_link: "Términos",
  s6_and: "y nuestra",
  s6_privacy_link: "Política de privacidad",

  err_email: "Por favor introduce una dirección de correo válida.",
  err_email_personal: "Por favor usa tu dirección de correo personal.",
  err_first_name: "Por favor introduce tu nombre.",
  err_last_name: "Por favor introduce tu apellido.",
  err_full_name: "Por favor introduce tu nombre completo.",
  err_phone: "Por favor introduce tu número de teléfono.",
  err_phone_invalid: "Por favor introduce un número de teléfono válido.",
  err_too_many: "Demasiados intentos. Por favor recarga la página e inténtalo de nuevo.",
  err_rate_limit: "Demasiados intentos. Por favor espera un minuto e inténtalo de nuevo.",
  err_generic: "Algo salió mal. Por favor recarga la página e inténtalo de nuevo.",
  err_network: "Problema de red. Por favor comprueba tu conexión e inténtalo de nuevo.",
};

// ── Export ────────────────────────────────────────────────────────────────────
export const locales: Record<Locale, T> = { en, it, de, fr, es };
