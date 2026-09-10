/**
 * TruthLens AI - Live News Wire Feed & Real-Time Monitor Data
 */

export interface LiveWireItem {
  id: string;
  source: string;
  sourceType: 'institutional' | 'viral_social' | 'wire_service' | 'tabloid';
  headline: string;
  category: 'Science' | 'Geopolitics' | 'Health' | 'Tech' | 'Climate' | 'Finance';
  content: string;
  arrivedAt: string;
  simulatedLatencyMs: number;
  country: string;
}

export const INCOMING_LIVE_FEED_STREAM: LiveWireItem[] = [
  {
    id: "WIRE-8901",
    source: "Reuters Global News Wire",
    sourceType: "wire_service",
    headline: "European Space Agency Discovers Subsurface Ice Reservoirs on Martian South Pole",
    category: "Science",
    content: "Radar sounder measurements from the Mars Express orbiter have confirmed extensive dielectric permittivity anomalies consistent with basal water ice sheets measuring several kilometers in depth, astrophysicists published in Nature Geoscience today. Lead researcher Dr. Christian Keller at the European Space Operations Centre confirmed calibration telemetry from two independent ground stations.",
    arrivedAt: "Just now",
    simulatedLatencyMs: 12.4,
    country: "DE / EU"
  },
  {
    id: "WIRE-8902",
    source: "Viral Social Aggregator @TruthLeak99",
    sourceType: "viral_social",
    headline: "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine to manipulate election outcomes!",
    category: "Geopolitics",
    content: "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine to manipulate election outcomes! Mainstream media is covering this up, but a brave whistleblower exposed top-secret blueprint documents. Doctors are stunned and world elites are in a complete panic! Share this viral post before it gets banned forever! They don't want you to know the deadly hidden truth!",
    arrivedAt: "4s ago",
    simulatedLatencyMs: 9.8,
    country: "Unverified"
  },
  {
    id: "WIRE-8903",
    source: "World Health Organization Newsroom",
    sourceType: "institutional",
    headline: "WHO Pre-Qualifies Novel Pediatric Malaria Vaccine Following Phase III Trials",
    category: "Health",
    content: "The World Health Organization has officially pre-qualified the R21/Matrix-M malaria vaccine developed in collaboration with the University of Oxford and Serum Institute of India. Clinical efficacy trials spanning 4,800 pediatric participants demonstrated a 75% reduction in symptomatic parasitemia over a 12-month monitored surveillance cycle.",
    arrivedAt: "9s ago",
    simulatedLatencyMs: 14.1,
    country: "CH / Global"
  },
  {
    id: "WIRE-8904",
    source: "MiracleRemedy Forum Bulletin",
    sourceType: "tabloid",
    headline: "MIRACLE CURE: Common kitchen spice destroys all terminal tumors in 24 hours without chemotherapy!",
    category: "Health",
    content: "MIRACLE CURE: Doctors are stunned! This secret common household spice eliminates all terminal diseases overnight without any pharmaceutical medication! Big Pharma is terrified and desperately trying to silence this discovery! Wake up sheeple! Drink pure boiled extract three times daily to completely restore biological youth! 100% guaranteed!",
    arrivedAt: "15s ago",
    simulatedLatencyMs: 11.2,
    country: "Anonymous"
  },
  {
    id: "WIRE-8905",
    source: "Associated Press Financial Desk",
    sourceType: "wire_service",
    headline: "International Monetary Fund Releases Revised Global GDP Growth Projections for 2026",
    category: "Finance",
    content: "The International Monetary Fund's World Economic Outlook upgraded baseline global output expansion to 3.2% for the current fiscal period, citing sustained disinflationary momentum and capital deepening across emerging market economies. Managing Director Kristalina Georgieva noted in Washington that monetary policy normalization has bolstered private investment portfolios.",
    arrivedAt: "22s ago",
    simulatedLatencyMs: 13.6,
    country: "US / IMF"
  },
  {
    id: "WIRE-8906",
    source: "Cosmic Conspiracy Underground",
    sourceType: "viral_social",
    headline: "ALERT: NASA whistleblowers confirm Earth will plunge into 30 consecutive days of complete darkness next Tuesday!",
    category: "Science",
    content: "ALERT: NASA whistleblowers confirm Earth will plunge into 30 consecutive days of complete darkness next Tuesday! Governments are hoarding emergency supplies and military subterranean bunkers while lying to ordinary citizens! Stockpile food, water, and candles immediately before internet blackout strikes worldwide! Share everywhere before censorship deletion!",
    arrivedAt: "28s ago",
    simulatedLatencyMs: 10.5,
    country: "Unverified"
  },
  {
    id: "WIRE-8907",
    source: "MIT Technology Review / Peer Release",
    sourceType: "institutional",
    headline: "Quantum Computing Lab Achieves 99.9% Two-Qubit Logic Gate Fidelity",
    category: "Tech",
    content: "Quantum researchers at the National Institute of Standards and Technology have reported two-qubit randomized benchmarking fidelity surpassing 99.9% on a 64-qubit neutral-atom array. The peer-reviewed paper in Physical Review Letters demonstrates error mitigation thresholds necessary for fault-tolerant surface code quantum memory.",
    arrivedAt: "35s ago",
    simulatedLatencyMs: 15.0,
    country: "US / NIST"
  },
  {
    id: "WIRE-8908",
    source: "Clickbait Sensationalist Daily",
    sourceType: "tabloid",
    headline: "BOMBSHELL: Ancient 4,000-year-old scroll reveals world leaders are cloning robotic substitutes!",
    category: "Geopolitics",
    content: "BOMBSHELL: Ancient 4,000-year-old scroll reveals world leaders are cloning robotic substitutes! Elite billionaires held emergency summit in private Swiss compound after digital glitch exposed speech synthesizer failure! Millions of viewers noticed the unnatural eye movement during live broadcast! Share before they take down this server!",
    arrivedAt: "42s ago",
    simulatedLatencyMs: 12.1,
    country: "Unverified"
  },
  {
    id: "WIRE-8909",
    source: "United Nations Secretariat Press",
    sourceType: "institutional",
    headline: "195 Nations Ratify Binding Clean Water Sanitation & Aquifer Protection Framework",
    category: "Climate",
    content: "Accredited environmental ministers representing 195 member states adopted the Geneva Transboundary Aquifer Accord today, establishing audited multinational hydrogeological monitoring standards. The United Nations Environment Programme confirmed international compliance auditing mechanisms will commence in the second quarter.",
    arrivedAt: "50s ago",
    simulatedLatencyMs: 14.8,
    country: "UN / CH"
  }
];

export interface LiveUrlDemo {
  url: string;
  domain: string;
  reputation: 'high_trust' | 'dubious_clickbait';
  headline: string;
  fullText: string;
}

export const DEMO_LIVE_URLS: LiveUrlDemo[] = [
  {
    url: "https://www.reuters.com/science/james-webb-space-cluster-discovery",
    domain: "reuters.com",
    reputation: "high_trust",
    headline: "NASA James Webb Space Telescope Captures Deep-Field Infrared Galaxy Cluster",
    fullText: "NASA's James Webb Space Telescope has captured deep-field infrared imagery of a high-redshift galaxy cluster dating back 13.1 billion years, astrophysicists reported in Nature Astronomy. Dr. Elena Vance, lead author on the peer-reviewed findings, confirmed that spectroscopic calibration confirms early oxygen synthesis occurring far sooner in cosmic evolution than previously theorized. Independent researchers from Oxford University verified the instrumentation metrics."
  },
  {
    url: "https://viral-breaking-truth.xyz/leak/subterranean-machine-election",
    domain: "viral-breaking-truth.xyz",
    reputation: "dubious_clickbait",
    headline: "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine!",
    fullText: "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine to manipulate election outcomes! Mainstream media is covering this up, but a brave whistleblower exposed top-secret blueprint documents. Doctors are stunned and world elites are in a complete panic! Share this viral post before it gets banned forever! They don't want you to know the deadly hidden truth!"
  },
  {
    url: "https://www.un.org/climate/press/binding-carbon-reduction-milestones",
    domain: "un.org",
    reputation: "high_trust",
    headline: "United Nations Delegates Ratify Binding Accord on Carbon Reduction Milestones",
    fullText: "The United Nations climate summit concluded today with accredited delegates from 195 member states ratifying a binding accord on carbon reduction milestones. According to official documentation released by the secretariat, participating nations committed to audited emissions monitoring frameworks. Economists at the International Monetary Fund published an analysis estimating the transition investments will generate four million green energy jobs."
  },
  {
    url: "https://miracle-herbal-cure.biz/daily/spice-reverses-all-illness",
    domain: "miracle-herbal-cure.biz",
    reputation: "dubious_clickbait",
    headline: "MIRACLE CURE: Doctors are stunned! This secret common household spice eliminates all terminal diseases!",
    fullText: "MIRACLE CURE: Doctors are stunned! This secret common household spice eliminates all terminal diseases overnight without any pharmaceutical medication! Big Pharma is terrified and desperately trying to silence this discovery! Wake up sheeple! Drink pure boiled extract three times daily to completely restore biological youth! 100% guaranteed!"
  }
];

/**
 * Audio feedback for live detection alerts using Web Audio API (no dependencies)
 */
export function playLiveAudioAlert(type: 'real' | 'fake') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'real') {
      // Harmonious chime: D5 to A5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Disinformation warning alert: 340Hz to 220Hz saw
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.setValueAtTime(220, now + 0.1);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // AudioContext silenced or restricted by browser policies
  }
}
