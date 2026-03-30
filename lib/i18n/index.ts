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

  // SocialProofTicker
  ticker_joined: string;
  ticker_trade: string;
  ticker_on_page: string;
  ticker_mins_ago: string;

  // ExitIntentModal
  exit_warning: string;
  exit_headline: string;
  exit_body_1: string;
  exit_still_climbing: string;
  exit_body_2: string;
  exit_cta: string;
  exit_or: string;
  exit_soft_prompt: string;
  exit_email_placeholder: string;
  exit_send_btn: string;
  exit_sent: string;
  exit_no_thanks: string;

  // RiskDisclaimer
  risk_label: string;
  risk_body: string;
  risk_compact: string;
  risk_regulated_by: string;

  // SectionPainIntro (S2B)
  s2b_step_label: string;
  s2b_step_duration: string;
  s2b_headline: string;
  s2b_headline_em: string;
  s2b_headline_end: string;
  s2b_subtext: string;
  s2b_counter_label: string;
  s2b_counter_sub: string;
  s2b_p1_title: string; s2b_p1_body: string; s2b_p1_stat: string;
  s2b_p2_title: string; s2b_p2_body: string; s2b_p2_stat: string;
  s2b_p3_title: string; s2b_p3_body: string; s2b_p3_stat: string;
  s2b_p4_title: string; s2b_p4_body: string; s2b_p4_stat: string;
  s2b_p5_title: string; s2b_p5_body: string; s2b_p5_stat: string;
  s2b_p6_title: string; s2b_p6_body: string; s2b_p6_stat: string;
  s2b_why_headline: string;
  s2b_why_text1: string;
  s2b_why_text2: string;
  s2b_why_text3: string;
  s2b_solution_label: string;
  s2b_tp_headline: string;
  s2b_tp_sub: string;
  s2b_claude_title: string;
  s2b_claude_body: string;
  s2b_fact1_heading: string; s2b_fact1_detail: string;
  s2b_fact2_heading: string; s2b_fact2_detail: string;
  s2b_fact3_heading: string; s2b_fact3_detail: string;
  s2b_advocates_label: string;
  s2b_adv_disclaimer: string;
  s2b_cta_box_p1: string;
  s2b_cta_box_p2: string;
  s2b_cta: string;
  s2b_cta_sub: string;

  // SectionPilotSim (S2C)
  s2c_badge: string;
  s2c_headline: string;
  s2c_subtext: string;
  s2c_win_rate: string;
  s2c_how_works: string;
  s2c_risk_label: string;
  s2c_sl_title: string; s2c_sl_desc: string;
  s2c_tp_title: string; s2c_tp_desc: string;
  s2c_dl_title: string; s2c_dl_desc: string;
  s2c_mt_title: string; s2c_mt_desc: string;
  s2c_running: string;
  s2c_replay: string;
  s2c_cta: string;
  s2c_cta_sub: string;
  s2c_scanning: string;
  s2c_complete: string;
  s2c_idle: string;
  s2c_buy_signal: string;
  s2c_sell_signal: string;

  // SectionLiveProof (S2D)
  s2d_badge: string;
  s2d_headline: string;
  s2d_subtext: string;
  s2d_balance_label: string;
  s2d_status_initial: string;
  s2d_status_scanning: string;
  s2d_status_pattern: string;
  s2d_status_trade1: string;
  s2d_status_tp1: string;
  s2d_status_trade2: string;
  s2d_status_tp2: string;
  s2d_status_done: string;
  s2d_trade_open: string;
  s2d_scanning: string;
  s2d_complete: string;
  s2d_standby: string;
  s2d_milestone_activated: string;
  s2d_milestone_activated_sub: string;
  s2d_milestone_trade1: string;
  s2d_milestone_trade1_sub: string;
  s2d_milestone_tp1: string;
  s2d_milestone_tp1_sub: string;
  s2d_milestone_trade2: string;
  s2d_milestone_trade2_sub: string;
  s2d_milestone_tp2_sub: string;
  s2d_watch_step1_title: string; s2d_watch_step1_desc: string;
  s2d_watch_step2_title: string; s2d_watch_step2_desc: string;
  s2d_watch_step3_title: string; s2d_watch_step3_desc: string;
  s2d_sim_complete_label: string;
  s2d_started_with: string;
  s2d_ended_with: string;
  s2d_trade1_label: string;
  s2d_trade2_label: string;
  s2d_result_box: string;
  s2d_start_btn: string;
  s2d_running_note: string;
  s2d_cta: string;
  s2d_watch_again: string;
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

  // ── SocialProofTicker ──────────────────────────────────────────────────────
  ticker_joined: "{name} from {city} just joined",
  ticker_trade: "{name} from {city} just closed a {amount} trade",
  ticker_on_page: "{name} from {city} is on this page right now",
  ticker_mins_ago: "{n}m ago",

  // ── ExitIntentModal ────────────────────────────────────────────────────────
  exit_warning: "Warning",
  exit_headline: "Hold on — you were so close",
  exit_body_1: "In the time since you opened this page, people on the same platform made:",
  exit_still_climbing: "That number is still climbing right now.",
  exit_body_2: "You don't have to commit to anything. Just finish the last step — it takes under 60 seconds and you can always decide later.",
  exit_cta: "OK, I'll finish the last step →",
  exit_or: "or",
  exit_soft_prompt: "Not ready? Drop your email and we'll send you the free guide.",
  exit_email_placeholder: "your@email.com",
  exit_send_btn: "Send",
  exit_sent: "✓ Got it! Check your inbox shortly.",
  exit_no_thanks: "No thanks, I'm not interested",

  // ── RiskDisclaimer ─────────────────────────────────────────────────────────
  risk_label: "Risk Warning:",
  risk_body: "Trading involves risk. Past performance is not indicative of future results. Capital at risk. The value of investments can go down as well as up. You should only trade with money you can afford to lose. Simulated and historical results do not guarantee future performance.",
  risk_compact: "Capital at risk. Past performance is not indicative of future results.",
  risk_regulated_by: "Regulated by",

  // ── SectionPainIntro (S2B) ─────────────────────────────────────────────────
  s2b_step_label: "Why this matters to you",
  s2b_step_duration: "2 min read",
  s2b_headline: "The system is designed to",
  s2b_headline_em: "keep your money working for them",
  s2b_headline_end: "not for you.",
  s2b_subtext: "You go to work. You save. You try to do the right thing. And at every turn, rising costs, low interest, and taxes eat away at your progress. Here's what's actually happening to your money right now.",
  s2b_counter_label: "Value lost to inflation since you opened this page",
  s2b_counter_sub: "Globally, inflation destroys purchasing power every second. Your idle savings are part of that.",
  s2b_p1_title: "Taxes take 20–45% of everything you earn",
  s2b_p1_body: "Before you see a penny, governments take their slice. The average worker loses nearly a third of their income before it ever touches their bank account.",
  s2b_p1_stat: "£12,570 lost annually on an average UK salary just to tax.",
  s2b_p2_title: "Inflation is silently destroying your savings",
  s2b_p2_body: "Your bank pays you 0.1%. Inflation runs at 4–6%. Every year your savings sit still, they lose real value. Saving harder doesn't fix this problem.",
  s2b_p2_stat: "£10,000 saved today is worth £9,400 in real terms next year.",
  s2b_p3_title: "Fuel, food, energy costs never stop rising",
  s2b_p3_body: "The price of everything you need keeps climbing. Your income doesn't keep pace. The gap between what you earn and what you spend grows wider every year.",
  s2b_p3_stat: "Average UK household bills rose by £1,800+ in a single year.",
  s2b_p4_title: "Self-employed? You don't have time to trade",
  s2b_p4_body: "Running your own business already consumes 60+ hours a week. Sitting in front of charts watching candles move isn't an option. Yet your money is still working against you.",
  s2b_p4_stat: "67% of self-employed people have no active investment strategy.",
  s2b_p5_title: "Your money in the bank is losing value every day",
  s2b_p5_body: "Banks don't reward loyalty — they reward your deposits by paying you almost nothing. Meanwhile they lend that same money out at 8–25% interest. You're doing them a favour.",
  s2b_p5_stat: "High street banks average 0.1–1.5% interest vs 5%+ inflation.",
  s2b_p6_title: "Pension payouts barely cover the basics",
  s2b_p6_body: "Decades of contributions. A lifetime of work. And a pension that barely covers rent, food, and heating. The retirement you were promised doesn't stretch as far as it should.",
  s2b_p6_stat: "Average UK pension income: £13,000/year. Average living cost: £17,000.",
  s2b_why_headline: "What they don't tell you",
  s2b_why_text1: "The ultra-wealthy figured this out decades ago. They don't manage money manually. They deploy automated systems that work for them 24 hours a day — whether they're asleep, on holiday, or living their lives.",
  s2b_why_text2: "Jim Simons' algorithms ran while he slept and made him a billionaire. Ray Dalio's machine never takes a day off. The difference is those systems weren't available to ordinary people.",
  s2b_why_text3: "Until Trading Pilot.",
  s2b_solution_label: "The solution",
  s2b_tp_headline: "Meet Trading Pilot",
  s2b_tp_sub: "The first autonomous trading intelligence engine that fuses real-time technical signals with Claude AI news sentiment — executing trades 24/7 with the discipline no human can sustain.",
  s2b_claude_title: "Claude AI Sentiment Engine",
  s2b_claude_body: "Before every trade, Pilot queries Claude AI for live news sentiment on that asset. A perfect crossover with negative headlines? Pilot waits. Confirmed signal with bullish sentiment? Pilot acts with full conviction.",
  s2b_fact1_heading: "It watches the market so you don't have to",
  s2b_fact1_detail: "Trading Pilot scans every price tick, every minute, across 20+ instruments — 24/7 with zero hesitation and sub-millisecond signal execution. The market never sleeps, and neither does Pilot.",
  s2b_fact2_heading: "Four battle-tested strategies, not guesswork",
  s2b_fact2_detail: "MA Crossover (61% win rate), RSI Reversal (58%), MACD Momentum (63%), Pure Momentum (55%). Each engineered for a different market condition. You pick one — or run multiple pilots simultaneously across different assets.",
  s2b_fact3_heading: "Six layers of institutional-grade risk protection",
  s2b_fact3_detail: "Hard stop-loss on every trade. Take-profit locking. Max daily loss circuit-breaker. Max daily trades cap. Confirmation bar filtering. Real-time equity curve monitoring. Your capital is always protected.",
  s2b_advocates_label: "Who has been doing this for decades",
  s2b_adv_disclaimer: "These individuals are not affiliated with or endorsing Trading Pilot. Their publicly documented use of algorithmic and rules-based trading systems demonstrates the power of automation.",
  s2b_cta_box_p1: "Now let's show you exactly how Trading Pilot would have acted on last week's market.",
  s2b_cta_box_p2: "Real strategy logic. Real chart data. Claude AI sentiment live.",
  s2b_cta: "Show me how it works →",
  s2b_cta_sub: "Free to access · No credit card · Takes 60 seconds to set up",

  // ── SectionPilotSim (S2C) ──────────────────────────────────────────────────
  s2c_badge: "Live Simulation · Claude AI Active",
  s2c_headline: "Watch Trading Pilot Think in Real-Time",
  s2c_subtext: "Pick a strategy. See how the bot detects a signal, checks live news sentiment via Claude AI, then fires or suppresses the trade — automatically.",
  s2c_win_rate: "{n}% win rate",
  s2c_how_works: "How {name} works",
  s2c_risk_label: "Built-in risk controls — every strategy",
  s2c_sl_title: "Stop-Loss", s2c_sl_desc: "Hard stop on every trade",
  s2c_tp_title: "Take-Profit", s2c_tp_desc: "Auto-exits at your target",
  s2c_dl_title: "Daily loss cap", s2c_dl_desc: "Bot halts if limit hit",
  s2c_mt_title: "Max daily trades", s2c_mt_desc: "No overtrading in noise",
  s2c_running: "Simulation running…",
  s2c_replay: "↺ Run simulation again",
  s2c_cta: "I want TradePilot working for me →",
  s2c_cta_sub: "Free to access · Takes 60 seconds · No credit card needed",
  s2c_scanning: "SCANNING",
  s2c_complete: "COMPLETE",
  s2c_idle: "IDLE",
  s2c_buy_signal: "BUY signal",
  s2c_sell_signal: "SELL signal",

  // ── SectionLiveProof (S2D) ─────────────────────────────────────────────────
  s2d_badge: "Watch it trade live",
  s2d_headline: "$250 account. Bot trading EUR/USD. Fully automated.",
  s2d_subtext: "Watch TradePilot spot opportunities and make trades in real time while you do absolutely nothing.",
  s2d_balance_label: "Account Balance",
  s2d_status_initial: "TradePilot is watching the market...",
  s2d_status_scanning: "Scanning every price tick. Looking for the right moment...",
  s2d_status_pattern: "Spotted a pattern forming. Fast line crossing above slow line...",
  s2d_status_trade1: "Trade #1 open — bot is in the market now.",
  s2d_status_tp1: "Trade #1 closed with profit!",
  s2d_status_trade2: "Second setup spotted — bot entering market again.",
  s2d_status_tp2: "Second trade closed with profit!",
  s2d_status_done: "Session complete. 2 trades. 2 wins. Zero effort from you.",
  s2d_trade_open: "TRADE OPEN",
  s2d_scanning: "SCANNING",
  s2d_complete: "COMPLETE",
  s2d_standby: "STANDBY",
  s2d_milestone_activated: "Bot activated — watching market",
  s2d_milestone_activated_sub: "Scanning every tick for a signal...",
  s2d_milestone_trade1: "Trade #1 opened",
  s2d_milestone_trade1_sub: "Bot entered at the right moment.",
  s2d_milestone_tp1: "+${amount} profit locked",
  s2d_milestone_tp1_sub: "First trade closed in the green.",
  s2d_milestone_trade2: "Second trade opened",
  s2d_milestone_trade2_sub: "Bot spotted another opportunity.",
  s2d_milestone_tp2_sub: "Both trades closed in the green.",
  s2d_watch_step1_title: "Bot watches",
  s2d_watch_step1_desc: "Every price movement, 24/7",
  s2d_watch_step2_title: "Spots opportunity",
  s2d_watch_step2_desc: "Detects the right moment automatically",
  s2d_watch_step3_title: "Locks profit",
  s2d_watch_step3_desc: "Exits the trade at your target price",
  s2d_sim_complete_label: "Simulation complete",
  s2d_started_with: "Started with",
  s2d_ended_with: "Ended with",
  s2d_trade1_label: "Trade 1: EUR/USD",
  s2d_trade2_label: "Trade 2: EUR/USD",
  s2d_result_box: "You did nothing. The bot watched the chart, spotted two opportunities, entered both trades, and closed them at a profit. That's what TradePilot does for you every day.",
  s2d_start_btn: "▶  Watch it trade live",
  s2d_running_note: "Simulation running — watch the chart above...",
  s2d_cta: "I want this running on my account →",
  s2d_watch_again: "↺ Watch again",
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

  ticker_joined: "{name} da {city} si è appena iscritto",
  ticker_trade: "{name} da {city} ha appena chiuso un trade da {amount}",
  ticker_on_page: "{name} da {city} è su questa pagina adesso",
  ticker_mins_ago: "{n} min fa",

  exit_warning: "Attenzione",
  exit_headline: "Aspetta — eri così vicino",
  exit_body_1: "Dal momento in cui hai aperto questa pagina, le persone sulla stessa piattaforma hanno guadagnato:",
  exit_still_climbing: "Quel numero sta ancora salendo adesso.",
  exit_body_2: "Non devi impegnarti a nulla. Completa solo l'ultimo passaggio — richiede meno di 60 secondi e puoi sempre decidere dopo.",
  exit_cta: "OK, completo l'ultimo passaggio →",
  exit_or: "oppure",
  exit_soft_prompt: "Non sei pronto? Lascia la tua email e ti mandiamo la guida gratuita.",
  exit_email_placeholder: "tua@email.it",
  exit_send_btn: "Invia",
  exit_sent: "✓ Ricevuto! Controlla la tua casella a breve.",
  exit_no_thanks: "No grazie, non sono interessato",

  risk_label: "Avvertenza sul rischio:",
  risk_body: "Il trading comporta rischi. Le performance passate non sono indicative dei risultati futuri. Capitale a rischio. Il valore degli investimenti può sia aumentare che diminuire. Dovresti fare trading solo con denaro che puoi permetterti di perdere. I risultati simulati e storici non garantiscono le performance future.",
  risk_compact: "Capitale a rischio. Le performance passate non sono indicative dei risultati futuri.",
  risk_regulated_by: "Regolamentato da",

  s2b_step_label: "Perché questo ti riguarda",
  s2b_step_duration: "2 min di lettura",
  s2b_headline: "Il sistema è progettato per",
  s2b_headline_em: "far lavorare i tuoi soldi per loro",
  s2b_headline_end: "non per te.",
  s2b_subtext: "Vai a lavorare. Risparmi. Cerchi di fare la cosa giusta. E ad ogni svolta, costi crescenti, bassi interessi e tasse erodono i tuoi progressi. Ecco cosa sta davvero succedendo ai tuoi soldi adesso.",
  s2b_counter_label: "Valore perso per inflazione da quando hai aperto questa pagina",
  s2b_counter_sub: "A livello globale, l'inflazione distrugge il potere d'acquisto ogni secondo. I tuoi risparmi fermi ne fanno parte.",
  s2b_p1_title: "Le tasse prendono il 20–45% di tutto quello che guadagni",
  s2b_p1_body: "Prima ancora che tu veda un centesimo, i governi si prendono la loro fetta. Il lavoratore medio perde quasi un terzo del reddito prima che arrivi sul conto.",
  s2b_p1_stat: "£12.570 persi ogni anno su uno stipendio medio UK solo di tasse.",
  s2b_p2_title: "L'inflazione sta silenziosamente distruggendo i tuoi risparmi",
  s2b_p2_body: "La tua banca ti paga lo 0,1%. L'inflazione corre al 4–6%. Ogni anno i tuoi risparmi restano fermi, perdono valore reale. Risparmiare di più non risolve questo problema.",
  s2b_p2_stat: "£10.000 risparmiati oggi valgono £9.400 in termini reali l'anno prossimo.",
  s2b_p3_title: "Carburante, cibo, energia: i costi non smettono mai di salire",
  s2b_p3_body: "Il prezzo di tutto quello di cui hai bisogno continua a crescere. Il tuo reddito non segue il passo. Il divario tra quanto guadagni e quanto spendi si allarga ogni anno.",
  s2b_p3_stat: "Le bollette medie delle famiglie UK sono aumentate di £1.800+ in un solo anno.",
  s2b_p4_title: "Lavori in proprio? Non hai tempo per fare trading",
  s2b_p4_body: "Gestire la tua attività consuma già 60+ ore alla settimana. Stare davanti ai grafici a guardare le candele non è un'opzione. Eppure i tuoi soldi lavorano ancora contro di te.",
  s2b_p4_stat: "Il 67% dei lavoratori autonomi non ha una strategia di investimento attiva.",
  s2b_p5_title: "I tuoi soldi in banca perdono valore ogni giorno",
  s2b_p5_body: "Le banche non premiano la fedeltà — premiano i tuoi depositi pagandoti quasi nulla. Nel frattempo prestano quei stessi soldi all'8–25% di interesse. Stai facendo loro un favore.",
  s2b_p5_stat: "Le banche tradizionali pagano in media lo 0,1–1,5% contro un'inflazione del 5%+.",
  s2b_p6_title: "La pensione copre a malapena l'essenziale",
  s2b_p6_body: "Decenni di contributi. Una vita di lavoro. E una pensione che copre a malapena affitto, cibo e riscaldamento. Il pensionamento che ti era stato promesso non basta quanto dovrebbe.",
  s2b_p6_stat: "Pensione media UK: £13.000/anno. Costo della vita medio: £17.000.",
  s2b_why_headline: "Quello che non ti dicono",
  s2b_why_text1: "I super-ricchi l'hanno capito decenni fa. Non gestiscono il denaro manualmente. Utilizzano sistemi automatizzati che lavorano per loro 24 ore al giorno — che dormano, siano in vacanza o vivano la loro vita.",
  s2b_why_text2: "Gli algoritmi di Jim Simons giravano mentre dormiva e lo hanno reso miliardario. La macchina di Ray Dalio non si prende mai un giorno libero. La differenza è che quei sistemi non erano disponibili alle persone comuni.",
  s2b_why_text3: "Fino a Trading Pilot.",
  s2b_solution_label: "La soluzione",
  s2b_tp_headline: "Ecco Trading Pilot",
  s2b_tp_sub: "Il primo motore di intelligenza di trading autonoma che fonde segnali tecnici in tempo reale con il sentiment delle notizie di Claude AI — eseguendo trade 24/7 con la disciplina che nessun essere umano può mantenere.",
  s2b_claude_title: "Motore di Sentiment Claude AI",
  s2b_claude_body: "Prima di ogni trade, Pilot interroga Claude AI per il sentiment live delle notizie su quell'asset. Un crossover perfetto con titoli negativi? Pilot aspetta. Segnale confermato con sentiment rialzista? Pilot agisce con piena convinzione.",
  s2b_fact1_heading: "Guarda il mercato al posto tuo",
  s2b_fact1_detail: "Trading Pilot scansiona ogni tick di prezzo, ogni minuto, su 20+ strumenti — 24/7 senza esitazione ed esecuzione dei segnali in sub-millisecondi. Il mercato non dorme mai, e nemmeno Pilot.",
  s2b_fact2_heading: "Quattro strategie collaudate, non congetture",
  s2b_fact2_detail: "MA Crossover (61% win rate), RSI Reversal (58%), MACD Momentum (63%), Pure Momentum (55%). Ognuna progettata per una diversa condizione di mercato. Ne scegli una — o fai girare più pilot contemporaneamente su asset diversi.",
  s2b_fact3_heading: "Sei livelli di protezione del rischio di grado istituzionale",
  s2b_fact3_detail: "Stop-loss fisso su ogni trade. Lock del take-profit. Interruttore automatico per la perdita giornaliera massima. Cap sul numero massimo di trade giornalieri. Filtraggio con barre di conferma. Monitoraggio in tempo reale della curva di equity. Il tuo capitale è sempre protetto.",
  s2b_advocates_label: "Chi lo fa da decenni",
  s2b_adv_disclaimer: "Questi individui non sono affiliati né approvano Trading Pilot. Il loro uso documentato pubblicamente di sistemi di trading algoritmico e basato su regole dimostra il potere dell'automazione.",
  s2b_cta_box_p1: "Ora ti mostriamo esattamente come Trading Pilot si sarebbe comportato sul mercato della settimana scorsa.",
  s2b_cta_box_p2: "Logica di strategia reale. Dati di grafico reali. Sentiment Claude AI live.",
  s2b_cta: "Mostrami come funziona →",
  s2b_cta_sub: "Accesso gratuito · Nessuna carta di credito · 60 secondi per configurare",

  s2c_badge: "Simulazione Live · Claude AI Attivo",
  s2c_headline: "Guarda Trading Pilot Pensare in Tempo Reale",
  s2c_subtext: "Scegli una strategia. Guarda come il bot rileva un segnale, verifica il sentiment live delle notizie tramite Claude AI, poi esegue o sopprime il trade — automaticamente.",
  s2c_win_rate: "{n}% win rate",
  s2c_how_works: "Come funziona {name}",
  s2c_risk_label: "Controlli di rischio integrati — ogni strategia",
  s2c_sl_title: "Stop-Loss", s2c_sl_desc: "Stop fisso su ogni trade",
  s2c_tp_title: "Take-Profit", s2c_tp_desc: "Uscita automatica al target",
  s2c_dl_title: "Cap perdita giornaliera", s2c_dl_desc: "Il bot si ferma se raggiunto il limite",
  s2c_mt_title: "Max trade giornalieri", s2c_mt_desc: "Nessun overtrading nel rumore",
  s2c_running: "Simulazione in corso…",
  s2c_replay: "↺ Riesegui la simulazione",
  s2c_cta: "Voglio Trading Pilot che lavori per me →",
  s2c_cta_sub: "Accesso gratuito · 60 secondi · Nessuna carta di credito",
  s2c_scanning: "IN SCANSIONE",
  s2c_complete: "COMPLETATO",
  s2c_idle: "INATTIVO",
  s2c_buy_signal: "Segnale BUY",
  s2c_sell_signal: "Segnale SELL",

  s2d_badge: "Guarda fare trading dal vivo",
  s2d_headline: "Conto da $250. Bot che fa trading EUR/USD. Completamente automatico.",
  s2d_subtext: "Guarda TradePilot individuare opportunità ed effettuare trade in tempo reale mentre tu non fai assolutamente nulla.",
  s2d_balance_label: "Saldo del Conto",
  s2d_status_initial: "TradePilot sta monitorando il mercato...",
  s2d_status_scanning: "Scansione di ogni tick di prezzo. In attesa del momento giusto...",
  s2d_status_pattern: "Individuato un pattern in formazione. La linea veloce incrocia quella lenta...",
  s2d_status_trade1: "Trade #1 aperto — il bot è nel mercato adesso.",
  s2d_status_tp1: "Trade #1 chiuso con profitto!",
  s2d_status_trade2: "Secondo setup individuato — il bot entra di nuovo nel mercato.",
  s2d_status_tp2: "Secondo trade chiuso con profitto!",
  s2d_status_done: "Sessione completata. 2 trade. 2 vittorie. Zero sforzo da parte tua.",
  s2d_trade_open: "TRADE APERTO",
  s2d_scanning: "IN SCANSIONE",
  s2d_complete: "COMPLETATO",
  s2d_standby: "IN ATTESA",
  s2d_milestone_activated: "Bot attivato — monitoraggio mercato",
  s2d_milestone_activated_sub: "Scansione di ogni tick in cerca di un segnale...",
  s2d_milestone_trade1: "Trade #1 aperto",
  s2d_milestone_trade1_sub: "Il bot è entrato al momento giusto.",
  s2d_milestone_tp1: "+${amount} profitto bloccato",
  s2d_milestone_tp1_sub: "Primo trade chiuso in positivo.",
  s2d_milestone_trade2: "Secondo trade aperto",
  s2d_milestone_trade2_sub: "Il bot ha individuato un'altra opportunità.",
  s2d_milestone_tp2_sub: "Entrambi i trade chiusi in positivo.",
  s2d_watch_step1_title: "Il bot guarda",
  s2d_watch_step1_desc: "Ogni movimento di prezzo, 24/7",
  s2d_watch_step2_title: "Individua l'opportunità",
  s2d_watch_step2_desc: "Rileva il momento giusto automaticamente",
  s2d_watch_step3_title: "Blocca il profitto",
  s2d_watch_step3_desc: "Chiude il trade al prezzo target",
  s2d_sim_complete_label: "Simulazione completata",
  s2d_started_with: "Iniziato con",
  s2d_ended_with: "Terminato con",
  s2d_trade1_label: "Trade 1: EUR/USD",
  s2d_trade2_label: "Trade 2: EUR/USD",
  s2d_result_box: "Non hai fatto nulla. Il bot ha monitorato il grafico, individuato due opportunità, aperto entrambi i trade e chiusi in profitto. Questo è quello che TradePilot fa per te ogni giorno.",
  s2d_start_btn: "▶  Guarda fare trading dal vivo",
  s2d_running_note: "Simulazione in corso — guarda il grafico sopra...",
  s2d_cta: "Voglio questo attivo sul mio conto →",
  s2d_watch_again: "↺ Guarda di nuovo",
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

  ticker_joined: "{name} aus {city} ist gerade beigetreten",
  ticker_trade: "{name} aus {city} hat gerade einen {amount} Trade geschlossen",
  ticker_on_page: "{name} aus {city} ist gerade auf dieser Seite",
  ticker_mins_ago: "vor {n} Min.",

  exit_warning: "Warnung",
  exit_headline: "Warte — du warst so nah dran",
  exit_body_1: "Seit du diese Seite geöffnet hast, haben Menschen auf derselben Plattform verdient:",
  exit_still_climbing: "Diese Zahl steigt gerade noch weiter.",
  exit_body_2: "Du musst dich zu nichts verpflichten. Schließ einfach den letzten Schritt ab — er dauert unter 60 Sekunden und du kannst danach immer noch entscheiden.",
  exit_cta: "OK, ich mache den letzten Schritt →",
  exit_or: "oder",
  exit_soft_prompt: "Noch nicht bereit? Hinterlasse deine E-Mail und wir schicken dir den kostenlosen Leitfaden.",
  exit_email_placeholder: "deine@email.de",
  exit_send_btn: "Senden",
  exit_sent: "✓ Erhalten! Schau bald in deinen Posteingang.",
  exit_no_thanks: "Nein danke, ich bin nicht interessiert",

  risk_label: "Risikohinweis:",
  risk_body: "Trading ist mit Risiken verbunden. Vergangene Ergebnisse sind kein Indikator für zukünftige Resultate. Kapital ist gefährdet. Der Wert von Investitionen kann steigen und fallen. Du solltest nur mit Geld handeln, das du dir leisten kannst zu verlieren. Simulierte und historische Ergebnisse garantieren keine zukünftige Performance.",
  risk_compact: "Kapital gefährdet. Vergangene Ergebnisse sind kein Indikator für zukünftige Resultate.",
  risk_regulated_by: "Reguliert von",

  s2b_step_label: "Warum das dich betrifft",
  s2b_step_duration: "2 Min. Lesen",
  s2b_headline: "Das System ist darauf ausgelegt,",
  s2b_headline_em: "dein Geld für sie arbeiten zu lassen",
  s2b_headline_end: "nicht für dich.",
  s2b_subtext: "Du gehst arbeiten. Du sparst. Du versuchst, das Richtige zu tun. Und bei jedem Schritt fressen steigende Kosten, niedrige Zinsen und Steuern deinen Fortschritt auf. Hier ist, was gerade wirklich mit deinem Geld passiert.",
  s2b_counter_label: "Wert seit Öffnung dieser Seite durch Inflation vernichtet",
  s2b_counter_sub: "Weltweit zerstört Inflation die Kaufkraft jede Sekunde. Deine brachliegenden Ersparnisse sind ein Teil davon.",
  s2b_p1_title: "Steuern nehmen 20–45% von allem, was du verdienst",
  s2b_p1_body: "Bevor du einen Cent siehst, nehmen sich die Behörden ihren Anteil. Der durchschnittliche Arbeitnehmer verliert fast ein Drittel seines Einkommens, bevor es jemals sein Konto berührt.",
  s2b_p1_stat: "£12.570 jährlich bei einem durchschnittlichen britischen Gehalt nur an Steuern verloren.",
  s2b_p2_title: "Inflation zerstört schweigend deine Ersparnisse",
  s2b_p2_body: "Deine Bank zahlt dir 0,1%. Die Inflation läuft bei 4–6%. Jedes Jahr, das deine Ersparnisse still stehen, verlieren sie realen Wert. Mehr zu sparen löst dieses Problem nicht.",
  s2b_p2_stat: "Heute gesparte £10.000 sind im nächsten Jahr real nur noch £9.400 wert.",
  s2b_p3_title: "Kraftstoff, Lebensmittel, Energie: Die Kosten steigen nie auf",
  s2b_p3_body: "Der Preis für alles, was du brauchst, steigt weiter. Dein Einkommen hält nicht Schritt. Die Lücke zwischen dem, was du verdienst und ausgibst, wird jedes Jahr größer.",
  s2b_p3_stat: "Durchschnittliche britische Haushaltsrechnungen stiegen in einem Jahr um £1.800+.",
  s2b_p4_title: "Selbstständig? Du hast keine Zeit zum Traden",
  s2b_p4_body: "Dein eigenes Unternehmen zu führen verbraucht bereits 60+ Stunden pro Woche. Vor Charts zu sitzen und Kerzen zu beobachten ist keine Option. Trotzdem arbeitet dein Geld noch gegen dich.",
  s2b_p4_stat: "67% der Selbstständigen haben keine aktive Anlagestrategie.",
  s2b_p5_title: "Dein Geld auf der Bank verliert jeden Tag an Wert",
  s2b_p5_body: "Banken belohnen keine Treue — sie belohnen deine Einlagen, indem sie dir fast nichts zahlen. Gleichzeitig verleihen sie dasselbe Geld zu 8–25% Zinsen. Du tust ihnen einen Gefallen.",
  s2b_p5_stat: "Direktbanken zahlen durchschnittlich 0,1–1,5% Zinsen vs. 5%+ Inflation.",
  s2b_p6_title: "Rentenleistungen decken kaum das Nötigste",
  s2b_p6_body: "Jahrzehnte an Beiträgen. Ein Leben voller Arbeit. Und eine Rente, die kaum Miete, Essen und Heizung abdeckt. Der Ruhestand, der dir versprochen wurde, reicht nicht so weit wie er sollte.",
  s2b_p6_stat: "Durchschnittliches britisches Renteneinkommen: £13.000/Jahr. Durchschnittliche Lebenshaltungskosten: £17.000.",
  s2b_why_headline: "Was sie dir verschweigen",
  s2b_why_text1: "Die Superreichen haben das vor Jahrzehnten herausgefunden. Sie verwalten Geld nicht manuell. Sie setzen automatisierte Systeme ein, die 24 Stunden am Tag für sie arbeiten — ob sie schlafen, im Urlaub sind oder ihr Leben leben.",
  s2b_why_text2: "Jim Simons' Algorithmen liefen während er schlief und machten ihn zum Milliardär. Ray Dalios Maschine nimmt nie einen freien Tag. Der Unterschied ist, dass diese Systeme für normale Menschen nicht verfügbar waren.",
  s2b_why_text3: "Bis Trading Pilot.",
  s2b_solution_label: "Die Lösung",
  s2b_tp_headline: "Lerne Trading Pilot kennen",
  s2b_tp_sub: "Die erste autonome Trading-Intelligence-Engine, die technische Echtzeitsignale mit Claude AI News-Sentiment verbindet — und Trades 24/7 mit einer Disziplin ausführt, die kein Mensch aufrechterhalten kann.",
  s2b_claude_title: "Claude AI Sentiment Engine",
  s2b_claude_body: "Vor jedem Trade fragt Pilot Claude AI nach dem Live-News-Sentiment für diesen Asset. Perfekter Crossover mit negativen Schlagzeilen? Pilot wartet. Bestätigtes Signal mit bullishem Sentiment? Pilot handelt mit voller Überzeugung.",
  s2b_fact1_heading: "Es beobachtet den Markt für dich",
  s2b_fact1_detail: "Trading Pilot scannt jeden Preistick, jede Minute, über 20+ Instrumenten — 24/7 ohne Zögern und mit Signalausführung in unter einer Millisekunde. Der Markt schläft nie, und Pilot auch nicht.",
  s2b_fact2_heading: "Vier kampferprobte Strategien, kein Rätselraten",
  s2b_fact2_detail: "MA Crossover (61% Win Rate), RSI Reversal (58%), MACD Momentum (63%), Pure Momentum (55%). Jede für eine andere Marktbedingung entwickelt. Du wählst eine — oder lässt mehrere Pilots gleichzeitig auf verschiedenen Assets laufen.",
  s2b_fact3_heading: "Sechs Schichten institutionellem Risikoschutz",
  s2b_fact3_detail: "Fester Stop-Loss bei jedem Trade. Take-Profit-Sperre. Tages-Verlust-Schutzschalter. Maximale Tages-Trade-Begrenzung. Bestätigungsbalken-Filterung. Echtzeit-Equity-Kurven-Überwachung. Dein Kapital ist immer geschützt.",
  s2b_advocates_label: "Wer das seit Jahrzehnten macht",
  s2b_adv_disclaimer: "Diese Personen sind nicht mit Trading Pilot verbunden und empfehlen es nicht. Ihr öffentlich dokumentierter Einsatz von algorithmischen und regelbasierten Handelssystemen zeigt die Kraft der Automatisierung.",
  s2b_cta_box_p1: "Lass uns dir nun genau zeigen, wie Trading Pilot auf dem Markt der letzten Woche agiert hätte.",
  s2b_cta_box_p2: "Echte Strategielogik. Echte Chartdaten. Claude AI Sentiment live.",
  s2b_cta: "Zeig mir, wie es funktioniert →",
  s2b_cta_sub: "Kostenloser Zugang · Keine Kreditkarte · 60 Sekunden zum Einrichten",

  s2c_badge: "Live-Simulation · Claude AI Aktiv",
  s2c_headline: "Sieh Trading Pilot in Echtzeit denken",
  s2c_subtext: "Wähle eine Strategie. Sieh, wie der Bot ein Signal erkennt, das Live-News-Sentiment via Claude AI prüft, dann den Trade auslöst oder unterdrückt — automatisch.",
  s2c_win_rate: "{n}% Win Rate",
  s2c_how_works: "Wie {name} funktioniert",
  s2c_risk_label: "Eingebaute Risikokontrollen — jede Strategie",
  s2c_sl_title: "Stop-Loss", s2c_sl_desc: "Fester Stop bei jedem Trade",
  s2c_tp_title: "Take-Profit", s2c_tp_desc: "Auto-Ausstieg bei deinem Ziel",
  s2c_dl_title: "Tages-Verlust-Cap", s2c_dl_desc: "Bot hält an wenn Limit erreicht",
  s2c_mt_title: "Max. Tages-Trades", s2c_mt_desc: "Kein Überhandeln in Rauschen",
  s2c_running: "Simulation läuft…",
  s2c_replay: "↺ Simulation erneut ausführen",
  s2c_cta: "Ich will TradePilot für mich arbeiten lassen →",
  s2c_cta_sub: "Kostenloser Zugang · 60 Sekunden · Keine Kreditkarte",
  s2c_scanning: "SCANNT",
  s2c_complete: "ABGESCHLOSSEN",
  s2c_idle: "BEREIT",
  s2c_buy_signal: "KAUF-Signal",
  s2c_sell_signal: "VERKAUF-Signal",

  s2d_badge: "Live traden zusehen",
  s2d_headline: "$250-Konto. Bot handelt EUR/USD. Vollautomatisch.",
  s2d_subtext: "Sieh zu, wie TradePilot Chancen entdeckt und Trades in Echtzeit ausführt, während du absolut nichts tust.",
  s2d_balance_label: "Kontostand",
  s2d_status_initial: "TradePilot beobachtet den Markt...",
  s2d_status_scanning: "Scannt jeden Preistick. Sucht den richtigen Moment...",
  s2d_status_pattern: "Muster entdeckt. Schnelle Linie kreuzt langsame Linie...",
  s2d_status_trade1: "Trade #1 geöffnet — Bot ist jetzt im Markt.",
  s2d_status_tp1: "Trade #1 mit Gewinn geschlossen!",
  s2d_status_trade2: "Zweites Setup entdeckt — Bot tritt erneut in den Markt ein.",
  s2d_status_tp2: "Zweiter Trade mit Gewinn geschlossen!",
  s2d_status_done: "Sitzung abgeschlossen. 2 Trades. 2 Gewinne. Null Aufwand von dir.",
  s2d_trade_open: "TRADE OFFEN",
  s2d_scanning: "SCANNT",
  s2d_complete: "ABGESCHLOSSEN",
  s2d_standby: "BEREIT",
  s2d_milestone_activated: "Bot aktiviert — Markt wird beobachtet",
  s2d_milestone_activated_sub: "Scannt jeden Tick nach einem Signal...",
  s2d_milestone_trade1: "Trade #1 geöffnet",
  s2d_milestone_trade1_sub: "Bot ist zum richtigen Zeitpunkt eingetreten.",
  s2d_milestone_tp1: "+${amount} Gewinn gesichert",
  s2d_milestone_tp1_sub: "Erster Trade im Plus geschlossen.",
  s2d_milestone_trade2: "Zweiter Trade geöffnet",
  s2d_milestone_trade2_sub: "Bot hat eine weitere Chance entdeckt.",
  s2d_milestone_tp2_sub: "Beide Trades im Plus geschlossen.",
  s2d_watch_step1_title: "Bot beobachtet",
  s2d_watch_step1_desc: "Jede Preisbewegung, 24/7",
  s2d_watch_step2_title: "Entdeckt Chance",
  s2d_watch_step2_desc: "Erkennt den richtigen Moment automatisch",
  s2d_watch_step3_title: "Sichert Gewinn",
  s2d_watch_step3_desc: "Schließt den Trade zu deinem Zielpreis",
  s2d_sim_complete_label: "Simulation abgeschlossen",
  s2d_started_with: "Gestartet mit",
  s2d_ended_with: "Beendet mit",
  s2d_trade1_label: "Trade 1: EUR/USD",
  s2d_trade2_label: "Trade 2: EUR/USD",
  s2d_result_box: "Du hast nichts getan. Der Bot hat den Chart beobachtet, zwei Chancen entdeckt, beide Trades eröffnet und sie mit Gewinn geschlossen. Das macht TradePilot jeden Tag für dich.",
  s2d_start_btn: "▶  Live traden zusehen",
  s2d_running_note: "Simulation läuft — beobachte den Chart oben...",
  s2d_cta: "Ich will das auf meinem Konto laufen haben →",
  s2d_watch_again: "↺ Nochmal ansehen",
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

  ticker_joined: "{name} de {city} vient de rejoindre",
  ticker_trade: "{name} de {city} vient de clôturer un trade de {amount}",
  ticker_on_page: "{name} de {city} est sur cette page en ce moment",
  ticker_mins_ago: "il y a {n} min",

  exit_warning: "Attention",
  exit_headline: "Attends — tu étais si proche",
  exit_body_1: "Depuis que tu as ouvert cette page, des gens sur la même plateforme ont gagné :",
  exit_still_climbing: "Ce chiffre continue de grimper en ce moment.",
  exit_body_2: "Tu n'as pas à t'engager à quoi que ce soit. Termine juste la dernière étape — ça prend moins de 60 secondes et tu peux toujours décider après.",
  exit_cta: "OK, je termine la dernière étape →",
  exit_or: "ou",
  exit_soft_prompt: "Pas encore prêt ? Laisse ton e-mail et on t'envoie le guide gratuit.",
  exit_email_placeholder: "ton@email.fr",
  exit_send_btn: "Envoyer",
  exit_sent: "✓ Reçu ! Vérifie ta boîte de réception sous peu.",
  exit_no_thanks: "Non merci, je ne suis pas intéressé",

  risk_label: "Avertissement sur les risques :",
  risk_body: "Le trading comporte des risques. Les performances passées ne préjugent pas des résultats futurs. Capital à risque. La valeur des investissements peut monter ou baisser. Tu ne devrais trader qu'avec de l'argent que tu peux te permettre de perdre. Les résultats simulés et historiques ne garantissent pas les performances futures.",
  risk_compact: "Capital à risque. Les performances passées ne préjugent pas des résultats futurs.",
  risk_regulated_by: "Régulé par",

  s2b_step_label: "Pourquoi cela te concerne",
  s2b_step_duration: "2 min de lecture",
  s2b_headline: "Le système est conçu pour",
  s2b_headline_em: "faire travailler ton argent pour eux",
  s2b_headline_end: "pas pour toi.",
  s2b_subtext: "Tu vas travailler. Tu économises. Tu essaies de faire ce qu'il faut. Et à chaque tournant, la hausse des coûts, les faibles intérêts et les impôts grignotent tes progrès. Voici ce qui se passe vraiment avec ton argent en ce moment.",
  s2b_counter_label: "Valeur perdue à cause de l'inflation depuis que tu as ouvert cette page",
  s2b_counter_sub: "Dans le monde entier, l'inflation détruit le pouvoir d'achat chaque seconde. Tes économies inactives en font partie.",
  s2b_p1_title: "Les impôts prennent 20–45% de tout ce que tu gagnes",
  s2b_p1_body: "Avant que tu voies un centime, les gouvernements prennent leur part. Le travailleur moyen perd près d'un tiers de ses revenus avant qu'ils n'atteignent jamais son compte bancaire.",
  s2b_p1_stat: "£12 570 perdus annuellement sur un salaire moyen britannique rien qu'en impôts.",
  s2b_p2_title: "L'inflation détruit silencieusement tes économies",
  s2b_p2_body: "Ta banque te verse 0,1%. L'inflation tourne à 4–6%. Chaque année où tes économies restent immobiles, elles perdent de la valeur réelle. Épargner davantage ne résout pas ce problème.",
  s2b_p2_stat: "£10 000 épargnés aujourd'hui ne valent que £9 400 en termes réels l'année prochaine.",
  s2b_p3_title: "Carburant, nourriture, énergie : les coûts ne cessent d'augmenter",
  s2b_p3_body: "Le prix de tout ce dont tu as besoin continue de grimper. Ton revenu ne suit pas. L'écart entre ce que tu gagnes et ce que tu dépenses se creuse chaque année.",
  s2b_p3_stat: "Les factures moyennes des ménages britanniques ont augmenté de £1 800+ en une seule année.",
  s2b_p4_title: "Indépendant ? Tu n'as pas le temps de trader",
  s2b_p4_body: "Gérer ta propre entreprise consomme déjà 60+ heures par semaine. Rester devant des graphiques à regarder les bougies bouger n'est pas une option. Pourtant ton argent travaille encore contre toi.",
  s2b_p4_stat: "67% des indépendants n'ont pas de stratégie d'investissement active.",
  s2b_p5_title: "Ton argent à la banque perd de la valeur chaque jour",
  s2b_p5_body: "Les banques ne récompensent pas la fidélité — elles récompensent tes dépôts en te payant presque rien. Pendant ce temps, elles prêtent ce même argent à 8–25% d'intérêt. Tu leur rends service.",
  s2b_p5_stat: "Les banques de réseau paient en moyenne 0,1–1,5% d'intérêt contre 5%+ d'inflation.",
  s2b_p6_title: "Les retraites couvrent à peine l'essentiel",
  s2b_p6_body: "Des décennies de cotisations. Une vie de travail. Et une retraite qui couvre à peine le loyer, la nourriture et le chauffage. La retraite qu'on t'avait promise ne va pas aussi loin qu'elle le devrait.",
  s2b_p6_stat: "Retraite moyenne britannique : £13 000/an. Coût de la vie moyen : £17 000.",
  s2b_why_headline: "Ce qu'on ne te dit pas",
  s2b_why_text1: "Les ultra-riches ont compris ça il y a des décennies. Ils ne gèrent pas l'argent manuellement. Ils déploient des systèmes automatisés qui travaillent pour eux 24 heures sur 24 — qu'ils dorment, soient en vacances ou vivent leur vie.",
  s2b_why_text2: "Les algorithmes de Jim Simons tournaient pendant qu'il dormait et ont fait de lui un milliardaire. La machine de Ray Dalio ne prend jamais un jour de congé. La différence c'est que ces systèmes n'étaient pas disponibles aux gens ordinaires.",
  s2b_why_text3: "Jusqu'à Trading Pilot.",
  s2b_solution_label: "La solution",
  s2b_tp_headline: "Voici Trading Pilot",
  s2b_tp_sub: "Le premier moteur d'intelligence de trading autonome qui fusionne des signaux techniques en temps réel avec le sentiment d'actualité de Claude AI — exécutant des trades 24h/7j avec une discipline qu'aucun humain ne peut maintenir.",
  s2b_claude_title: "Moteur de Sentiment Claude AI",
  s2b_claude_body: "Avant chaque trade, Pilot interroge Claude AI pour le sentiment d'actualité en direct sur cet actif. Un crossover parfait avec des titres négatifs ? Pilot attend. Signal confirmé avec sentiment haussier ? Pilot agit avec pleine conviction.",
  s2b_fact1_heading: "Il surveille le marché à ta place",
  s2b_fact1_detail: "Trading Pilot scanne chaque tick de prix, chaque minute, sur 20+ instruments — 24h/7j sans hésitation et avec une exécution des signaux en sous-milliseconde. Le marché ne dort jamais, et Pilot non plus.",
  s2b_fact2_heading: "Quatre stratégies éprouvées, pas des suppositions",
  s2b_fact2_detail: "MA Crossover (61% win rate), RSI Reversal (58%), MACD Momentum (63%), Pure Momentum (55%). Chacune conçue pour une condition de marché différente. Tu en choisis une — ou tu fais tourner plusieurs pilots simultanément sur différents actifs.",
  s2b_fact3_heading: "Six couches de protection du risque de niveau institutionnel",
  s2b_fact3_detail: "Stop-loss fixe sur chaque trade. Verrouillage du take-profit. Disjoncteur de perte journalière maximale. Plafond de trades journaliers maximum. Filtrage par barre de confirmation. Surveillance en temps réel de la courbe d'équité. Ton capital est toujours protégé.",
  s2b_advocates_label: "Qui fait ça depuis des décennies",
  s2b_adv_disclaimer: "Ces personnes ne sont pas affiliées à Trading Pilot et ne l'approuvent pas. Leur utilisation documentée publiquement de systèmes de trading algorithmique et basé sur des règles démontre la puissance de l'automatisation.",
  s2b_cta_box_p1: "Laisse-nous maintenant te montrer exactement comment Trading Pilot aurait agi sur le marché de la semaine dernière.",
  s2b_cta_box_p2: "Logique de stratégie réelle. Données de graphique réelles. Sentiment Claude AI en direct.",
  s2b_cta: "Montre-moi comment ça fonctionne →",
  s2b_cta_sub: "Accès gratuit · Pas de carte de crédit · 60 secondes pour configurer",

  s2c_badge: "Simulation Live · Claude AI Actif",
  s2c_headline: "Regarde Trading Pilot Penser en Temps Réel",
  s2c_subtext: "Choisis une stratégie. Vois comment le bot détecte un signal, vérifie le sentiment d'actualité en direct via Claude AI, puis déclenche ou supprime le trade — automatiquement.",
  s2c_win_rate: "{n}% win rate",
  s2c_how_works: "Comment {name} fonctionne",
  s2c_risk_label: "Contrôles de risque intégrés — chaque stratégie",
  s2c_sl_title: "Stop-Loss", s2c_sl_desc: "Stop fixe sur chaque trade",
  s2c_tp_title: "Take-Profit", s2c_tp_desc: "Sortie automatique à ton objectif",
  s2c_dl_title: "Cap perte journalière", s2c_dl_desc: "Le bot s'arrête si le limite est atteinte",
  s2c_mt_title: "Max trades journaliers", s2c_mt_desc: "Pas de surtrading dans le bruit",
  s2c_running: "Simulation en cours…",
  s2c_replay: "↺ Relancer la simulation",
  s2c_cta: "Je veux TradePilot qui travaille pour moi →",
  s2c_cta_sub: "Accès gratuit · 60 secondes · Pas de carte de crédit",
  s2c_scanning: "EN COURS",
  s2c_complete: "TERMINÉ",
  s2c_idle: "EN ATTENTE",
  s2c_buy_signal: "Signal ACHAT",
  s2c_sell_signal: "Signal VENTE",

  s2d_badge: "Regarder trader en direct",
  s2d_headline: "Compte de 250$. Bot tradant EUR/USD. Entièrement automatisé.",
  s2d_subtext: "Regarde TradePilot repérer des opportunités et effectuer des trades en temps réel pendant que tu ne fais absolument rien.",
  s2d_balance_label: "Solde du Compte",
  s2d_status_initial: "TradePilot surveille le marché...",
  s2d_status_scanning: "Scan de chaque tick de prix. En attente du bon moment...",
  s2d_status_pattern: "Motif repéré. La ligne rapide croise la ligne lente...",
  s2d_status_trade1: "Trade #1 ouvert — le bot est dans le marché maintenant.",
  s2d_status_tp1: "Trade #1 fermé avec profit !",
  s2d_status_trade2: "Deuxième configuration repérée — le bot entre à nouveau sur le marché.",
  s2d_status_tp2: "Deuxième trade fermé avec profit !",
  s2d_status_done: "Session terminée. 2 trades. 2 victoires. Zéro effort de ta part.",
  s2d_trade_open: "TRADE OUVERT",
  s2d_scanning: "EN COURS",
  s2d_complete: "TERMINÉ",
  s2d_standby: "EN ATTENTE",
  s2d_milestone_activated: "Bot activé — surveillance du marché",
  s2d_milestone_activated_sub: "Scan de chaque tick en recherche d'un signal...",
  s2d_milestone_trade1: "Trade #1 ouvert",
  s2d_milestone_trade1_sub: "Le bot est entré au bon moment.",
  s2d_milestone_tp1: "+${amount} profit sécurisé",
  s2d_milestone_tp1_sub: "Premier trade fermé en positif.",
  s2d_milestone_trade2: "Deuxième trade ouvert",
  s2d_milestone_trade2_sub: "Le bot a repéré une autre opportunité.",
  s2d_milestone_tp2_sub: "Les deux trades fermés en positif.",
  s2d_watch_step1_title: "Le bot surveille",
  s2d_watch_step1_desc: "Chaque mouvement de prix, 24h/7j",
  s2d_watch_step2_title: "Repère l'opportunité",
  s2d_watch_step2_desc: "Détecte le bon moment automatiquement",
  s2d_watch_step3_title: "Sécurise le profit",
  s2d_watch_step3_desc: "Ferme le trade à ton prix cible",
  s2d_sim_complete_label: "Simulation terminée",
  s2d_started_with: "Commencé avec",
  s2d_ended_with: "Terminé avec",
  s2d_trade1_label: "Trade 1 : EUR/USD",
  s2d_trade2_label: "Trade 2 : EUR/USD",
  s2d_result_box: "Tu n'as rien fait. Le bot a surveillé le graphique, repéré deux opportunités, ouvert les deux trades et les a fermés avec profit. C'est ce que TradePilot fait pour toi chaque jour.",
  s2d_start_btn: "▶  Regarder trader en direct",
  s2d_running_note: "Simulation en cours — regarde le graphique ci-dessus...",
  s2d_cta: "Je veux ça sur mon compte →",
  s2d_watch_again: "↺ Regarder à nouveau",
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

  ticker_joined: "{name} de {city} acaba de unirse",
  ticker_trade: "{name} de {city} acaba de cerrar un trade de {amount}",
  ticker_on_page: "{name} de {city} está en esta página ahora mismo",
  ticker_mins_ago: "hace {n} min",

  exit_warning: "Advertencia",
  exit_headline: "Espera — estabas tan cerca",
  exit_body_1: "Desde que abriste esta página, personas en la misma plataforma han ganado:",
  exit_still_climbing: "Ese número sigue subiendo ahora mismo.",
  exit_body_2: "No tienes que comprometerte a nada. Solo completa el último paso — tarda menos de 60 segundos y siempre puedes decidir después.",
  exit_cta: "OK, termino el último paso →",
  exit_or: "o",
  exit_soft_prompt: "¿No estás listo? Deja tu email y te enviamos la guía gratuita.",
  exit_email_placeholder: "tu@email.com",
  exit_send_btn: "Enviar",
  exit_sent: "✓ ¡Recibido! Revisa tu bandeja de entrada pronto.",
  exit_no_thanks: "No gracias, no estoy interesado",

  risk_label: "Advertencia de riesgo:",
  risk_body: "El trading conlleva riesgos. El rendimiento pasado no es indicativo de resultados futuros. Capital en riesgo. El valor de las inversiones puede subir y bajar. Solo deberías operar con dinero que puedas permitirte perder. Los resultados simulados e históricos no garantizan el rendimiento futuro.",
  risk_compact: "Capital en riesgo. El rendimiento pasado no es indicativo de resultados futuros.",
  risk_regulated_by: "Regulado por",

  s2b_step_label: "Por qué esto te importa",
  s2b_step_duration: "2 min de lectura",
  s2b_headline: "El sistema está diseñado para",
  s2b_headline_em: "hacer trabajar tu dinero para ellos",
  s2b_headline_end: "no para ti.",
  s2b_subtext: "Vas a trabajar. Ahorras. Intentas hacer lo correcto. Y en cada paso, los costes crecientes, los bajos intereses y los impuestos erosionan tu progreso. Esto es lo que está pasando realmente con tu dinero ahora mismo.",
  s2b_counter_label: "Valor perdido por la inflación desde que abriste esta página",
  s2b_counter_sub: "En todo el mundo, la inflación destruye el poder adquisitivo cada segundo. Tus ahorros inactivos son parte de eso.",
  s2b_p1_title: "Los impuestos se llevan el 20–45% de todo lo que ganas",
  s2b_p1_body: "Antes de ver un céntimo, los gobiernos se llevan su parte. El trabajador medio pierde casi un tercio de sus ingresos antes de que lleguen a su cuenta.",
  s2b_p1_stat: "£12.570 perdidos al año en un salario medio del Reino Unido solo en impuestos.",
  s2b_p2_title: "La inflación está destruyendo silenciosamente tus ahorros",
  s2b_p2_body: "Tu banco te paga el 0,1%. La inflación corre al 4–6%. Cada año que tus ahorros permanecen quietos, pierden valor real. Ahorrar más no soluciona este problema.",
  s2b_p2_stat: "£10.000 ahorrados hoy valen solo £9.400 en términos reales el año que viene.",
  s2b_p3_title: "Combustible, comida, energía: los costes no dejan de subir",
  s2b_p3_body: "El precio de todo lo que necesitas sigue subiendo. Tus ingresos no siguen el ritmo. La brecha entre lo que ganas y lo que gastas se amplía cada año.",
  s2b_p3_stat: "Las facturas medias de los hogares del Reino Unido subieron £1.800+ en un solo año.",
  s2b_p4_title: "¿Autónomo? No tienes tiempo para hacer trading",
  s2b_p4_body: "Gestionar tu propio negocio ya consume 60+ horas a la semana. Sentarse frente a gráficos mirando cómo se mueven las velas no es una opción. Sin embargo tu dinero sigue trabajando en tu contra.",
  s2b_p4_stat: "El 67% de los autónomos no tiene una estrategia de inversión activa.",
  s2b_p5_title: "Tu dinero en el banco pierde valor cada día",
  s2b_p5_body: "Los bancos no premian la fidelidad — premian tus depósitos pagándote casi nada. Mientras tanto prestan ese mismo dinero al 8–25% de interés. Les estás haciendo un favor.",
  s2b_p5_stat: "Los bancos de calle pagan de media el 0,1–1,5% de interés frente al 5%+ de inflación.",
  s2b_p6_title: "Las pensiones apenas cubren lo básico",
  s2b_p6_body: "Décadas de cotizaciones. Una vida de trabajo. Y una pensión que apenas cubre el alquiler, la comida y la calefacción. La jubilación que te prometieron no llega tan lejos como debería.",
  s2b_p6_stat: "Pensión media del Reino Unido: £13.000/año. Coste de vida medio: £17.000.",
  s2b_why_headline: "Lo que no te cuentan",
  s2b_why_text1: "Los ultra-ricos lo descubrieron hace décadas. No gestionan el dinero manualmente. Despliegan sistemas automatizados que trabajan para ellos 24 horas al día — estén durmiendo, de vacaciones o viviendo su vida.",
  s2b_why_text2: "Los algoritmos de Jim Simons funcionaban mientras dormía y lo hicieron millonario. La máquina de Ray Dalio nunca se toma un día libre. La diferencia es que esos sistemas no estaban disponibles para la gente común.",
  s2b_why_text3: "Hasta Trading Pilot.",
  s2b_solution_label: "La solución",
  s2b_tp_headline: "Conoce a Trading Pilot",
  s2b_tp_sub: "El primer motor de inteligencia de trading autónomo que fusiona señales técnicas en tiempo real con el sentimiento de noticias de Claude AI — ejecutando trades 24/7 con una disciplina que ningún ser humano puede mantener.",
  s2b_claude_title: "Motor de Sentimiento Claude AI",
  s2b_claude_body: "Antes de cada trade, Pilot consulta a Claude AI el sentimiento live de noticias sobre ese activo. ¿Un cruce perfecto con titulares negativos? Pilot espera. ¿Señal confirmada con sentimiento alcista? Pilot actúa con plena convicción.",
  s2b_fact1_heading: "Vigila el mercado por ti",
  s2b_fact1_detail: "Trading Pilot escanea cada tick de precio, cada minuto, en más de 20 instrumentos — 24/7 sin dudas y con ejecución de señales en sub-milisegundos. El mercado nunca duerme, y tampoco Pilot.",
  s2b_fact2_heading: "Cuatro estrategias probadas en batalla, no suposiciones",
  s2b_fact2_detail: "MA Crossover (61% win rate), RSI Reversal (58%), MACD Momentum (63%), Pure Momentum (55%). Cada una diseñada para una condición de mercado diferente. Eliges una — o corres varios pilots simultáneamente en diferentes activos.",
  s2b_fact3_heading: "Seis capas de protección de riesgo de grado institucional",
  s2b_fact3_detail: "Stop-loss fijo en cada trade. Bloqueo del take-profit. Disyuntor de pérdida diaria máxima. Límite de trades diarios máximos. Filtrado de barra de confirmación. Monitorización en tiempo real de la curva de equity. Tu capital siempre está protegido.",
  s2b_advocates_label: "Quién lleva décadas haciéndolo",
  s2b_adv_disclaimer: "Estas personas no están afiliadas ni respaldan a Trading Pilot. Su uso documentado públicamente de sistemas de trading algorítmico y basado en reglas demuestra el poder de la automatización.",
  s2b_cta_box_p1: "Ahora te mostraremos exactamente cómo habría actuado Trading Pilot en el mercado de la semana pasada.",
  s2b_cta_box_p2: "Lógica de estrategia real. Datos de gráfico reales. Sentimiento Claude AI en vivo.",
  s2b_cta: "Muéstrame cómo funciona →",
  s2b_cta_sub: "Acceso gratuito · Sin tarjeta de crédito · 60 segundos para configurar",

  s2c_badge: "Simulación en Vivo · Claude AI Activo",
  s2c_headline: "Ve a Trading Pilot Pensar en Tiempo Real",
  s2c_subtext: "Elige una estrategia. Ve cómo el bot detecta una señal, comprueba el sentimiento de noticias en vivo a través de Claude AI, luego dispara o suprime el trade — automáticamente.",
  s2c_win_rate: "{n}% win rate",
  s2c_how_works: "Cómo funciona {name}",
  s2c_risk_label: "Controles de riesgo integrados — cada estrategia",
  s2c_sl_title: "Stop-Loss", s2c_sl_desc: "Stop fijo en cada trade",
  s2c_tp_title: "Take-Profit", s2c_tp_desc: "Salida automática en tu objetivo",
  s2c_dl_title: "Cap pérdida diaria", s2c_dl_desc: "El bot se para si se alcanza el límite",
  s2c_mt_title: "Máx. trades diarios", s2c_mt_desc: "Sin overtrading en el ruido",
  s2c_running: "Simulación en curso…",
  s2c_replay: "↺ Ejecutar simulación de nuevo",
  s2c_cta: "Quiero que TradePilot trabaje para mí →",
  s2c_cta_sub: "Acceso gratuito · 60 segundos · Sin tarjeta de crédito",
  s2c_scanning: "ESCANEANDO",
  s2c_complete: "COMPLETADO",
  s2c_idle: "EN ESPERA",
  s2c_buy_signal: "Señal COMPRA",
  s2c_sell_signal: "Señal VENTA",

  s2d_badge: "Ver trading en vivo",
  s2d_headline: "Cuenta de $250. Bot operando EUR/USD. Completamente automatizado.",
  s2d_subtext: "Mira a TradePilot detectar oportunidades y realizar trades en tiempo real mientras tú no haces absolutamente nada.",
  s2d_balance_label: "Saldo de la Cuenta",
  s2d_status_initial: "TradePilot está monitorizando el mercado...",
  s2d_status_scanning: "Escaneando cada tick de precio. Buscando el momento adecuado...",
  s2d_status_pattern: "Patrón detectado. La línea rápida cruzando la línea lenta...",
  s2d_status_trade1: "Trade #1 abierto — el bot está en el mercado ahora.",
  s2d_status_tp1: "¡Trade #1 cerrado con beneficio!",
  s2d_status_trade2: "Segunda configuración detectada — el bot vuelve a entrar al mercado.",
  s2d_status_tp2: "¡Segundo trade cerrado con beneficio!",
  s2d_status_done: "Sesión completada. 2 trades. 2 victorias. Cero esfuerzo de tu parte.",
  s2d_trade_open: "TRADE ABIERTO",
  s2d_scanning: "ESCANEANDO",
  s2d_complete: "COMPLETADO",
  s2d_standby: "EN ESPERA",
  s2d_milestone_activated: "Bot activado — vigilando el mercado",
  s2d_milestone_activated_sub: "Escaneando cada tick en busca de una señal...",
  s2d_milestone_trade1: "Trade #1 abierto",
  s2d_milestone_trade1_sub: "El bot entró en el momento correcto.",
  s2d_milestone_tp1: "+${amount} beneficio asegurado",
  s2d_milestone_tp1_sub: "Primer trade cerrado en positivo.",
  s2d_milestone_trade2: "Segundo trade abierto",
  s2d_milestone_trade2_sub: "El bot detectó otra oportunidad.",
  s2d_milestone_tp2_sub: "Ambos trades cerrados en positivo.",
  s2d_watch_step1_title: "El bot vigila",
  s2d_watch_step1_desc: "Cada movimiento de precio, 24/7",
  s2d_watch_step2_title: "Detecta oportunidad",
  s2d_watch_step2_desc: "Detecta el momento correcto automáticamente",
  s2d_watch_step3_title: "Asegura el beneficio",
  s2d_watch_step3_desc: "Cierra el trade a tu precio objetivo",
  s2d_sim_complete_label: "Simulación completada",
  s2d_started_with: "Empezado con",
  s2d_ended_with: "Terminado con",
  s2d_trade1_label: "Trade 1: EUR/USD",
  s2d_trade2_label: "Trade 2: EUR/USD",
  s2d_result_box: "No hiciste nada. El bot monitorizó el gráfico, detectó dos oportunidades, abrió ambos trades y los cerró con beneficio. Eso es lo que TradePilot hace por ti cada día.",
  s2d_start_btn: "▶  Ver trading en vivo",
  s2d_running_note: "Simulación en curso — mira el gráfico de arriba...",
  s2d_cta: "Quiero esto funcionando en mi cuenta →",
  s2d_watch_again: "↺ Ver de nuevo",
};

// ── Export ────────────────────────────────────────────────────────────────────
export const locales: Record<Locale, T> = { en, it, de, fr, es };



