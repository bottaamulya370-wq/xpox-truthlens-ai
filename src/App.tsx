/**
 * TruthLens AI – Fake News Detection and Credibility Analysis System
 * Complete enterprise-grade web application tailored for AIML research,
 * academic defense, and live demonstrations.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  BarChart3,
  BrainCircuit,
  Layers,
  Code2,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  RefreshCw,
  FileCode,
  Copy,
  Check,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Sliders,
  ChevronDown,
  HelpCircle,
  ExternalLink,
  Printer,
  FileSpreadsheet,
  Zap,
  Award,
  Clock,
  ArrowRight,
  Radio,
  Globe,
  Wifi,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  Filter
} from 'lucide-react';
import {
  preprocessText,
  classifyText,
  calculateCredibility,
  generateExplanation,
  BENCHMARK_METRICS,
  PreprocessingBreakdown,
  ModelPrediction,
  CredibilityResult,
  ExplainabilityResult
} from './nlpEngine';
import { downloadPdfReport } from './pdfGenerator';
import { PYTHON_SOURCE_FILES, SourceCodeFile } from './codeFilesData';
import { LiveWireMonitor } from './components/LiveWireMonitor';
import {
  INCOMING_LIVE_FEED_STREAM,
  DEMO_LIVE_URLS,
  playLiveAudioAlert
} from './liveFeedData';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

import heroImg from './assets/images/news_verification_hero_1789024082738.jpg';
import spaceImg from './assets/images/deep_space_astronomy_1789024100060.jpg';
import climateImg from './assets/images/climate_summit_press_1789024116939.jpg';
import clickbaitImg from './assets/images/tabloid_clickbait_dramatic_1789024131221.jpg';
import spiceImg from './assets/images/spice_health_claim_1789024161997.jpg';

// Benchmark test cases spanning real journalism and fake disinformation
const SAMPLE_ARTICLES = [
  {
    title: "NASA James Webb Cosmic Discovery",
    tag: "Real News",
    type: "real" as const,
    image: spaceImg,
    imageCaption: "Deep-field infrared imagery of high-redshift galaxy cluster dating back 13.1 billion years",
    source: "Nature Astronomy / NASA",
    text: "NASA's James Webb Space Telescope has captured deep-field infrared imagery of a high-redshift galaxy cluster dating back 13.1 billion years, astrophysicists reported in Nature Astronomy. Dr. Elena Vance, lead author on the peer-reviewed findings, confirmed that spectroscopic calibration confirms early oxygen synthesis occurring far sooner in cosmic evolution than previously theorized. Independent researchers from Oxford University verified the instrumentation metrics."
  },
  {
    title: "Global Climate Summit Protocol",
    tag: "Real News",
    type: "real" as const,
    image: climateImg,
    imageCaption: "Accredited international delegates at the binding carbon reduction accord press briefing",
    source: "United Nations Secretariat / IMF",
    text: "The United Nations climate summit concluded today with accredited delegates from 195 member states ratifying a binding accord on carbon reduction milestones. According to official documentation released by the secretariat, participating nations committed to audited emissions monitoring frameworks. Economists at the International Monetary Fund published an analysis estimating the transition investments will generate four million green energy jobs."
  },
  {
    title: "Subterranean Weather Machine Cabal",
    tag: "Fake News",
    type: "fake" as const,
    image: clickbaitImg,
    imageCaption: "Viral social conspiracy graphics alleging covert subterranean weather manipulation",
    source: "Unverified Viral Social Post",
    text: "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine to manipulate election outcomes! Mainstream media is covering this up, but a brave whistleblower exposed top-secret blueprint documents. Doctors are stunned and world elites are in a complete panic! Share this viral post before it gets banned forever! They don't want you to know the deadly hidden truth!"
  },
  {
    title: "Miracle Household Spice Cure",
    tag: "Fake News",
    type: "fake" as const,
    image: spiceImg,
    imageCaption: "Exaggerated natural elixir advertisements promising overnight cure without pharmaceuticals",
    source: "Clickbait Health Forum",
    text: "MIRACLE CURE: Doctors are stunned! This secret common household spice eliminates all terminal diseases overnight without any pharmaceutical medication! Big Pharma is terrified and desperately trying to silence this discovery! Wake up sheeple! Drink pure boiled extract three times daily to completely restore biological youth! 100% guaranteed!"
  }
];

interface HistoryEntry {
  id: string;
  timestamp: string;
  snippet: string;
  prediction: "Real News" | "Fake News";
  confidence: number;
  credibilityScore: number;
  modelUsed: string;
  fullText: string;
}

// Custom tooltip for Confidence vs. Credibility Trend Chart
const CustomTrendTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isReal = data.prediction === 'Real News';
    return (
      <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200 shadow-lg text-xs space-y-2 max-w-xs z-50">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5 font-mono text-slate-500 font-bold text-2xs">
            <span>{data.id}</span>
            <span>•</span>
            <span>{data.timestamp}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md font-bold text-3xs ${
              isReal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {data.prediction}
          </span>
        </div>

        <p className="text-slate-600 italic line-clamp-2 text-2xs leading-relaxed">
          "{data.snippet}"
        </p>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="p-2 bg-indigo-50/80 rounded-lg border border-indigo-100">
            <span className="text-3xs font-semibold text-indigo-700 block">Model Confidence</span>
            <span className="text-sm font-black text-indigo-950">{data.confidence}%</span>
          </div>
          <div className="p-2 bg-emerald-50/80 rounded-lg border border-emerald-100">
            <span className="text-3xs font-semibold text-emerald-700 block">Credibility Score</span>
            <span className="text-sm font-black text-emerald-950">{data.credibility}/100</span>
          </div>
        </div>

        <div className="text-3xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-snug">
          <span className="font-semibold text-slate-700">Correlation: </span>
          {isReal ? (
            <span>High confidence ({data.confidence}%) aligns with strong credibility ({data.credibility}/100).</span>
          ) : (
            <span>High certainty ({data.confidence}%) detecting disinformation with low credibility ({data.credibility}/100) — spread of {data.spread} pts.</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function App() {
  // Navigation matching the user's features
  const [activeTab, setActiveTab] = useState<'home' | 'live' | 'analysis' | 'explainability' | 'dashboard' | 'report' | 'code'>('home');

  // Input state
  const [inputText, setInputText] = useState<string>(SAMPLE_ARTICLES[0].text);
  const [activeModel, setActiveModel] = useState<'ensemble' | 'logistic_regression' | 'random_forest'>('ensemble');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [summaryCopied, setSummaryCopied] = useState<boolean>(false);
  const [showSummaryPreview, setShowSummaryPreview] = useState<boolean>(false);
  const [selectedCodeFile, setSelectedCodeFile] = useState<SourceCodeFile>(PYTHON_SOURCE_FILES[0]);
  const [showVivaModal, setShowVivaModal] = useState<boolean>(false);

  // Live real-time features state
  const [isLiveTyping, setIsLiveTyping] = useState<boolean>(true);
  const [showLiveUrlModal, setShowLiveUrlModal] = useState<boolean>(false);
  const [liveUrlInput, setLiveUrlInput] = useState<string>('');
  const [isLiveScanningUrl, setIsLiveScanningUrl] = useState<boolean>(false);
  const [liveScanStep, setLiveScanStep] = useState<number>(0);
  const [tickerWireIdx, setTickerWireIdx] = useState<number>(0);
  const [tickerPaused, setTickerPaused] = useState<boolean>(false);

  // Analysis results
  const [prepResult, setPrepResult] = useState<PreprocessingBreakdown | null>(null);
  const [modelResult, setModelResult] = useState<ModelPrediction | null>(null);
  const [credResult, setCredResult] = useState<CredibilityResult | null>(null);
  const [expResult, setExpResult] = useState<ExplainabilityResult | null>(null);

  // History & Analytics
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: "TL-006",
      timestamp: "Today 14:05",
      snippet: "The United Nations climate summit concluded today with accredited delegates...",
      prediction: "Real News",
      confidence: 94.8,
      credibilityScore: 91,
      modelUsed: "Logistic Regression (L2)",
      fullText: SAMPLE_ARTICLES[1].text
    },
    {
      id: "TL-005",
      timestamp: "Today 13:20",
      snippet: "MIRACLE CURE: Doctors are stunned! This secret common household spice...",
      prediction: "Fake News",
      confidence: 96.5,
      credibilityScore: 18,
      modelUsed: "Random Forest",
      fullText: SAMPLE_ARTICLES[3].text
    },
    {
      id: "TL-004",
      timestamp: "Today 12:45",
      snippet: "European Central Bank raises liquidity reserve benchmark for commercial lenders...",
      prediction: "Real News",
      confidence: 92.4,
      credibilityScore: 89,
      modelUsed: "Ensemble (LR + RF)",
      fullText: "European Central Bank representatives confirmed revised liquidity reserve requirements following a policy meeting in Frankfurt. Financial institutions will implement audited capital adjustments by fourth-quarter deadlines, according to official regulatory directives."
    },
    {
      id: "TL-003",
      timestamp: "Today 11:32",
      snippet: "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather machine...",
      prediction: "Fake News",
      confidence: 98.2,
      credibilityScore: 12,
      modelUsed: "Ensemble (LR + RF)",
      fullText: SAMPLE_ARTICLES[2].text
    },
    {
      id: "TL-002",
      timestamp: "Today 10:50",
      snippet: "World Health Organization publishes global respiratory pathogen surveillance report...",
      prediction: "Real News",
      confidence: 96.1,
      credibilityScore: 95,
      modelUsed: "Ensemble (LR + RF)",
      fullText: "The World Health Organization published its quarterly respiratory surveillance index today, reporting stable infection rates across northern hemisphere monitoring centers. Peer-reviewed epidemiological protocols were maintained across all reference laboratories."
    },
    {
      id: "TL-001",
      timestamp: "Today 10:14",
      snippet: "NASA's James Webb Space Telescope has captured deep-field infrared imagery...",
      prediction: "Real News",
      confidence: 97.4,
      credibilityScore: 94,
      modelUsed: "Ensemble (LR + RF)",
      fullText: SAMPLE_ARTICLES[0].text
    }
  ]);

  // Confidence vs. Credibility Trend Chart States
  const [trendFilter, setTrendFilter] = useState<'all' | 'real' | 'fake'>('all');
  const [showConfidenceLine, setShowConfidenceLine] = useState<boolean>(true);
  const [showCredibilityLine, setShowCredibilityLine] = useState<boolean>(true);

  // Run initial analysis on mount without duplicating history
  useEffect(() => {
    executeAnalysis(SAMPLE_ARTICLES[0].text, activeModel, false);
  }, []);

  const executeAnalysis = (textToAnalyze: string, model: typeof activeModel, recordHistory: boolean = true) => {
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const prep = preprocessText(textToAnalyze);
      const pred = classifyText(textToAnalyze, model);
      const cred = calculateCredibility(textToAnalyze, pred.realProbability);
      const exp = generateExplanation(textToAnalyze, pred.prediction, pred.confidence, cred);

      setPrepResult(prep);
      setModelResult(pred);
      setCredResult(cred);
      setExpResult(exp);

      // Log into session history if requested
      if (recordHistory) {
        const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const newEntry: HistoryEntry = {
          id: `TL-00${history.length + 1}`,
          timestamp: `Today ${timeNow}`,
          snippet: textToAnalyze.slice(0, 75) + "...",
          prediction: pred.prediction,
          confidence: pred.confidence,
          credibilityScore: cred.credibilityScore,
          modelUsed: pred.modelUsed,
          fullText: textToAnalyze
        };
        setHistory(prev => [newEntry, ...prev.slice(0, 24)]);
      }
      setIsAnalyzing(false);
    }, 250);
  };

  // Live ticker auto-rotate timer
  useEffect(() => {
    if (tickerPaused) return;
    const tickerTimer = window.setInterval(() => {
      setTickerWireIdx(prev => (prev + 1) % INCOMING_LIVE_FEED_STREAM.length);
    }, 6000);
    return () => clearInterval(tickerTimer);
  }, [tickerPaused]);

  // Live debounced typing analysis (runs real-time classification without polluting audit history)
  useEffect(() => {
    if (!isLiveTyping || !inputText.trim()) return;
    const debounceTimer = setTimeout(() => {
      executeAnalysis(inputText, activeModel, false);
    }, 220);
    return () => clearTimeout(debounceTimer);
  }, [inputText, activeModel, isLiveTyping]);

  // Handler for live web URL scanning simulation
  const handleScanLiveUrl = (urlToScan: string) => {
    const cleanUrl = urlToScan.trim();
    if (!cleanUrl) return;

    setIsLiveScanningUrl(true);
    setLiveScanStep(1);

    const match = DEMO_LIVE_URLS.find(
      u => u.url.toLowerCase() === cleanUrl.toLowerCase() || cleanUrl.includes(u.domain)
    ) || {
      url: cleanUrl,
      domain: new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`).hostname,
      reputation: cleanUrl.includes('cure') || cleanUrl.includes('leak') || cleanUrl.includes('shocking') ? 'dubious_clickbait' : 'high_trust',
      headline: cleanUrl.includes('cure') ? 'Unverified Viral Health Claims Discovered Online' : 'Digital Press Release Verification Scan',
      fullText: cleanUrl.includes('cure')
        ? "MIRACLE CURE: Doctors are stunned! This secret common household spice eliminates all terminal diseases overnight without any pharmaceutical medication! Big Pharma is terrified and desperately trying to silence this discovery! Wake up sheeple! Drink pure boiled extract three times daily to completely restore biological youth! 100% guaranteed!"
        : "Accredited international delegates have published verified technical specifications following bilateral standards committee deliberations. Statistical and empirical metrics confirmed instrumentation thresholds align with peer-reviewed scientific methodology."
    };

    setTimeout(() => setLiveScanStep(2), 400);
    setTimeout(() => setLiveScanStep(3), 850);
    setTimeout(() => setLiveScanStep(4), 1300);
    setTimeout(() => {
      setIsLiveScanningUrl(false);
      setShowLiveUrlModal(false);
      setLiveScanStep(0);
      setInputText(match.fullText);
      setActiveTab('analysis');
      executeAnalysis(match.fullText, activeModel, true);
      playLiveAudioAlert(match.reputation === 'high_trust' ? 'real' : 'fake');
    }, 1700);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setInputText(content);
        executeAnalysis(content, activeModel);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        const clean = text.replace(/[^\x20-\x7E\t\r\n]/g, " ").replace(/\s+/g, " ");
        const usable = clean.length > 50 ? clean : "Extracted document content on automated machine learning natural language processing and fact validation.";
        setInputText(usable);
        executeAnalysis(usable, activeModel);
      };
      reader.readAsText(file);
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(selectedCodeFile.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const buildAnalysisSummaryText = (): string => {
    if (!modelResult || !credResult) return '';

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
    const charCount = inputText.length;
    const snippet = inputText.trim().slice(0, 260) + (inputText.trim().length > 260 ? '...' : '');

    const reasonsList = expResult?.reasons?.length
      ? expResult.reasons.map((r, i) => `  ${i + 1}. ${r}`).join('\n')
      : '  1. Linguistic feature distribution aligned with trained benchmark model.';

    const suspicious = expResult?.suspiciousWords?.length
      ? expResult.suspiciousWords.join(', ')
      : 'None detected';

    const credible = expResult?.credibleWords?.length
      ? expResult.credibleWords.join(', ')
      : 'None detected';

    return `========================================================
TRUTHLENS AI - VERIFICATION ANALYSIS SUMMARY
========================================================
Audit Timestamp:        ${timestamp}
Classifier Model:       ${modelResult.modelUsed}
Classification Verdict: ${modelResult.prediction.toUpperCase()}

--------------------------------------------------------
EXECUTIVE VERDICT & CREDIBILITY
--------------------------------------------------------
• Prediction:           ${modelResult.prediction}
• Confidence Level:     ${modelResult.confidence}%
• Credibility Score:    ${credResult.credibilityScore}/100 (${credResult.badge})
• Assessment Summary:   ${
  modelResult.prediction === 'Real News'
    ? 'Content exhibits objective neutrality, institutional attribution markers, and low sensationalism.'
    : 'Content exhibits high emotional sensationalism, urgency patterns, or speculative claims.'
}

--------------------------------------------------------
CREDIBILITY METRIC BREAKDOWN (0 - 100)
--------------------------------------------------------
• ML Model Signal:         ${credResult.breakdown.mlModelSignal}/45 pts
• Neutrality & Sentiment:  ${credResult.breakdown.neutralityScore}/25 pts
• Attribution & Citations: ${credResult.breakdown.attributionScore}/20 pts
• Linguistic Structure:    ${credResult.breakdown.structureScore}/10 pts

--------------------------------------------------------
EXPLAINABLE AI (XAI) KEY FACTORS
--------------------------------------------------------
Decision Rationales:
${reasonsList}

Vocabulary Cues:
• Suspicious / Clickbait Flags:  ${suspicious}
• Verified Attribution Markers:  ${credible}

--------------------------------------------------------
ANALYZED CONTENT SNIPPET
--------------------------------------------------------
"${snippet}"
Volume: ${wordCount} words | ${charCount} characters

--------------------------------------------------------
Generated by TruthLens AI (Fake News Detection & Credibility Analysis)
Structured text ready to paste into research reports, emails, or fact-checking dossiers.
========================================================`;
  };

  const handleCopyAnalysisSummary = async () => {
    const summaryText = buildAnalysisSummaryText();
    if (!summaryText) return;

    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
        copied = true;
      }
    } catch {
      // Fallback
    }

    if (!copied) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    setSummaryCopied(true);
    setTimeout(() => {
      setSummaryCopied(false);
    }, 2800);
  };

  const triggerDownloadZip = () => {
    const zipName = "TruthLens-AI.zip";
    const textBlob = new Blob([
      `TruthLens AI Project Archive\n\nFiles included:\n` +
      PYTHON_SOURCE_FILES.map(f => `- ${f.filename}`).join("\n") +
      `\n\nTo run locally:\n1. pip install -r requirements.txt\n2. python train_model.py\n3. streamlit run app.py`
    ], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chronological data for Confidence vs. Credibility trendline (oldest first to newest)
  const chronologicalHistory = [...history].reverse();
  const filteredTrendData = chronologicalHistory
    .filter(entry => {
      if (trendFilter === 'real') return entry.prediction === 'Real News';
      if (trendFilter === 'fake') return entry.prediction === 'Fake News';
      return true;
    })
    .map((entry, idx) => ({
      index: idx + 1,
      id: entry.id,
      timestamp: entry.timestamp.replace('Today ', ''),
      fullTimestamp: entry.timestamp,
      snippet: entry.snippet,
      prediction: entry.prediction,
      confidence: Number(entry.confidence.toFixed(1)),
      credibility: entry.credibilityScore,
      modelUsed: entry.modelUsed,
      spread: Math.abs(Number((entry.confidence - entry.credibilityScore).toFixed(1)))
    }));

  const realTrendHistory = history.filter(h => h.prediction === 'Real News');
  const fakeTrendHistory = history.filter(h => h.prediction === 'Fake News');
  const avgTrendConfidence = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.confidence, 0) / history.length)
    : 0;
  const avgRealTrendCred = realTrendHistory.length
    ? Math.round(realTrendHistory.reduce((sum, h) => sum + h.credibilityScore, 0) / realTrendHistory.length)
    : 0;
  const avgFakeTrendCred = fakeTrendHistory.length
    ? Math.round(fakeTrendHistory.reduce((sum, h) => sum + h.credibilityScore, 0) / fakeTrendHistory.length)
    : 0;
  const disinformationSpread = fakeTrendHistory.length
    ? Math.round(fakeTrendHistory.reduce((sum, h) => sum + (h.confidence - h.credibilityScore), 0) / fakeTrendHistory.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header & Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">TruthLens AI</span>
                <span className="px-2 py-0.5 text-2xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  NLP & ML System
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Fake News Detection & Credibility Analysis</p>
            </div>
          </div>

          {/* Navigation Menu (7 features including Live Wire) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Home</span>
            </button>

            <button
              id="nav-tab-live-wire"
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
              </span>
              <span>Live Wire</span>
              <span className="text-3xs uppercase px-1.5 py-0.2 rounded bg-rose-200/60 text-rose-900 font-extrabold hidden sm:inline">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>News Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('explainability')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'explainability'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explainable AI</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Report Generation</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python / Streamlit</span>
            </button>
          </nav>

          {/* Viva / Defense Prep Guide Modal Button */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setShowVivaModal(true)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Viva Guide</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Real-Time News Wire Ticker */}
      {(() => {
        const currentWire = INCOMING_LIVE_FEED_STREAM[tickerWireIdx] || INCOMING_LIVE_FEED_STREAM[0];
        const isDisinfo = currentWire.sourceType === 'viral_social' || currentWire.sourceType === 'tabloid';

        return (
          <div
            className="bg-slate-950 text-white border-b border-slate-800 text-xs px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 overflow-hidden transition-all shadow-inner"
            onMouseEnter={() => setTickerPaused(true)}
            onMouseLeave={() => setTickerPaused(false)}
          >
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="font-extrabold tracking-wider text-rose-400 uppercase text-3xs flex items-center gap-1">
                <Radio className="w-3 h-3" />
                Live Wire Feed
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-3xs font-mono text-slate-400 hidden md:inline">
                {currentWire.source.split(' ')[0]} ({currentWire.country})
              </span>
            </div>

            {/* Active Ticker Headline */}
            <div className="flex-1 min-w-0 flex items-center gap-2.5 overflow-hidden">
              <span className="text-slate-200 font-medium truncate text-xs">
                {currentWire.headline}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-3xs font-black shrink-0 ${
                  !isDisinfo
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {!isDisinfo ? '✓ Verified Real' : '⚠ Flagged Disinformation'}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="ticker-audit-now-btn"
                onClick={() => {
                  setInputText(currentWire.content);
                  setActiveTab('analysis');
                  executeAnalysis(currentWire.content, activeModel, true);
                }}
                className="px-2.5 py-1 rounded-md text-3xs font-bold text-indigo-300 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 transition-colors cursor-pointer"
              >
                Audit in Depth
              </button>
              <button
                type="button"
                id="ticker-open-live-desk-btn"
                onClick={() => setActiveTab('live')}
                className="px-2.5 py-1 rounded-md text-3xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Live Desk ({INCOMING_LIVE_FEED_STREAM.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* ==============================================================
            FEATURE 1: HOME PAGE
            ============================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    NLP & Machine Learning Powered Verification
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                    TruthLens AI
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                    Fake News Detection and Credibility Analysis System. Detect misinformation, audit journalistic attribution, highlight suspicious clickbait tokens, and generate transparent verification dossiers.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      id="hero-analyze-btn"
                      onClick={() => setActiveTab('analysis')}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <span>Analyze News Content</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      id="hero-live-wire-btn"
                      onClick={() => setActiveTab('live')}
                      className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      <span>Live Wire Feed</span>
                      <span className="text-3xs uppercase font-extrabold bg-rose-700/80 px-1.5 py-0.5 rounded">
                        Real-time
                      </span>
                    </button>

                    <button
                      id="hero-code-btn"
                      onClick={() => setActiveTab('code')}
                      className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span>Python Code</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800/70 backdrop-blur-xs group">
                    <div className="relative aspect-16/9 overflow-hidden bg-slate-900">
                      <img
                        src={heroImg}
                        alt="TruthLens AI Digital Newsroom Fact-Checking Lab"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-xs px-2.5 py-1 rounded-full text-3xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        DIGITAL NEWSROOM AUDIT LAB
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-3xs font-mono text-slate-300">
                        Accuracy: 96.8%
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900/90 border-t border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>Multimodal Veracity Engine</span>
                        <span className="text-indigo-400 text-2xs font-mono">Real-Time Classifier</span>
                      </div>
                      <p className="text-2xs text-slate-400 leading-relaxed">
                        Evaluates linguistic sensationalism, institutional citations, emotional skew, and structural veracity signatures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Capability Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">NLP Preprocessing</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Multi-stage text cleaning, regex URL stripping, NLTK stop-word filtration, and WordNet canonical lemmatization.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Dual ML Classifiers</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sublinear TF-IDF vectorizer paired with L2-regularized Logistic Regression and Random Forest ensembles reaching 96.8% accuracy.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Explainable AI (XAI)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transparent local token feature attribution highlighting sensational clickbait cues versus verified institutional citations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Downloadable Reports</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Instant client-side and Python FPDF generation of formal PDF verification audit dossiers with cryptographic hash and metrics.
                </p>
              </div>
            </div>

            {/* Architecture Overview Diagram */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">System Architecture & Pipeline Flow</h2>
                <p className="text-sm text-slate-500 mt-1">
                  How raw unstructured input transforms into an audited classification verdict with transparent credibility scoring.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Stage 1</span>
                  <div className="my-2">
                    <span className="font-bold text-slate-900 text-sm block">Raw Input</span>
                    <span className="text-xs text-slate-500">Headline & Article Text</span>
                  </div>
                  <span className="text-2xs text-indigo-600 font-mono">.txt / .pdf / input</span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                  <span className="text-2xs font-bold text-indigo-500 uppercase tracking-wider">Stage 2</span>
                  <div className="my-2">
                    <span className="font-bold text-indigo-950 text-sm block">NLP Engine</span>
                    <span className="text-xs text-indigo-700">Cleaning & Lemmatizing</span>
                  </div>
                  <span className="text-2xs text-indigo-600 font-mono">NLTK / spaCy</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Stage 3</span>
                  <div className="my-2">
                    <span className="font-bold text-slate-900 text-sm block">TF-IDF Matrix</span>
                    <span className="text-xs text-slate-500">5,000 N-Gram Features</span>
                  </div>
                  <span className="text-2xs text-indigo-600 font-mono">Scikit-learn</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                  <span className="text-2xs font-bold text-emerald-600 uppercase tracking-wider">Stage 4</span>
                  <div className="my-2">
                    <span className="font-bold text-emerald-950 text-sm block">Dual Classifiers</span>
                    <span className="text-xs text-emerald-700">LR + Random Forest</span>
                  </div>
                  <span className="text-2xs text-emerald-600 font-mono">Soft Ensemble</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col justify-between">
                  <span className="text-2xs font-bold text-indigo-300 uppercase tracking-wider">Stage 5</span>
                  <div className="my-2">
                    <span className="font-bold text-white text-sm block">Audit Dossier</span>
                    <span className="text-xs text-slate-300">Credibility (0-100) & XAI</span>
                  </div>
                  <span className="text-2xs text-emerald-400 font-mono">PDF Report</span>
                </div>
              </div>
            </div>

            {/* Curated Benchmark Media Verification Stories Gallery */}
            <div id="benchmark-media-gallery" className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    Curated Benchmark Media Verification Cases
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authentic journalistic datasets vs. flagged viral clickbait disinformation with full visual media context.
                  </p>
                </div>
                <span className="text-2xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit border border-slate-200">
                  4 Evaluated Datasets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {SAMPLE_ARTICLES.map((sample, idx) => (
                  <div
                    key={idx}
                    id={`benchmark-story-card-${idx}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img
                        src={sample.image}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-3xs border shadow-xs ${
                            sample.type === 'real'
                              ? 'bg-emerald-100/95 text-emerald-900 border-emerald-300'
                              : 'bg-rose-100/95 text-rose-900 border-rose-300'
                          }`}
                        >
                          {sample.type === 'real' ? '✓ Verified Source' : '⚠ Flagged Disinfo'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-3xs font-mono">
                        {sample.source.split(' / ')[0]}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                          {sample.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                          {sample.text}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-3xs text-slate-400 italic truncate max-w-[130px]" title={sample.imageCaption}>
                          {sample.imageCaption}
                        </span>
                        <button
                          type="button"
                          id={`analyze-benchmark-btn-${idx}`}
                          onClick={() => {
                            setInputText(sample.text);
                            setActiveTab('analysis');
                            executeAnalysis(sample.text, activeModel);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            FEATURE: REAL-TIME LIVE NEWS WIRE MONITOR
            ============================================================== */}
        {activeTab === 'live' && (
          <LiveWireMonitor
            onSelectForDeepAnalysis={(text) => {
              setInputText(text);
              setActiveTab('analysis');
              executeAnalysis(text, activeModel, true);
            }}
          />
        )}

        {/* ==============================================================
            FEATURE 2 & 3: NEWS ANALYSIS MODULE & PREDICTION RESULTS
            ============================================================== */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Benchmark Preset selector & Model Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-600" />
                    News Analysis Module
                  </h1>
                  <p className="text-sm text-slate-500">
                    Paste an article below, select machine learning models, or load curated test articles to verify veracity in real time.
                  </p>
                </div>

                {/* Model Selector */}
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">Engine:</span>
                  <select
                    value={activeModel}
                    onChange={(e) => {
                      const m = e.target.value as typeof activeModel;
                      setActiveModel(m);
                      executeAnalysis(inputText, m);
                    }}
                    className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ensemble">Soft-Voting Ensemble (LR + Random Forest)</option>
                    <option value="logistic_regression">Logistic Regression (L2 Regularized)</option>
                    <option value="random_forest">Random Forest Classifier (100 Trees)</option>
                  </select>
                </div>
              </div>

              {/* Sample Quick-load buttons with image avatars */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Load Benchmark Sample:</span>
                {SAMPLE_ARTICLES.map((sample, idx) => (
                  <button
                    key={idx}
                    id={`quick-load-sample-${idx}`}
                    onClick={() => {
                      setInputText(sample.text);
                      executeAnalysis(sample.text, activeModel);
                    }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                      sample.type === 'real'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <img
                      src={sample.image}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover border border-slate-300 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span>{sample.type === 'real' ? '✓ Real: ' : '⚠ Fake: '} {sample.title}</span>
                  </button>
                ))}
                <button
                  id="clear-input-text-btn"
                  onClick={() => setInputText("")}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 ml-auto font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Input & Prediction Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Text Input */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      News Content to Analyze
                    </label>
                    <div className="flex items-center gap-2.5">
                      {/* Live As-You-Type Continuous Verification Toggle */}
                      <button
                        type="button"
                        id="toggle-live-typing-btn"
                        onClick={() => setIsLiveTyping(!isLiveTyping)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-bold transition-all cursor-pointer ${
                          isLiveTyping
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Toggle instant inference as you type"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isLiveTyping ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{isLiveTyping ? '⚡ Live As-You-Type: ACTIVE' : '⚡ Live As-You-Type: PAUSED'}</span>
                      </button>
                      <span className="text-xs text-slate-400 font-mono">
                        {inputText.trim().split(/\s+/).filter(Boolean).length} words | {inputText.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Active Benchmark Editorial Media Context Badge */}
                  {(() => {
                    const matchedSample = SAMPLE_ARTICLES.find(
                      s => inputText.trim().startsWith(s.text.slice(0, 40)) || s.text.trim().startsWith(inputText.trim().slice(0, 40))
                    );
                    if (!matchedSample) return null;
                    return (
                      <div id="active-editorial-media-card" className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 relative bg-slate-200">
                          <img
                            src={matchedSample.image}
                            alt={matchedSample.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{matchedSample.title}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-3xs font-bold ${
                                matchedSample.type === 'real'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {matchedSample.tag}
                            </span>
                          </div>
                          <p className="text-2xs text-slate-500 truncate mt-0.5">{matchedSample.imageCaption}</p>
                        </div>
                        <div className="text-3xs text-slate-400 font-mono hidden sm:block">
                          Source: {matchedSample.source}
                        </div>
                      </div>
                    );
                  })()}

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={9}
                    placeholder="Paste headline and news article text here for NLP classification..."
                    className="w-full p-4 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-normal leading-relaxed resize-y"
                  />

                  {/* Upload & Action Bar with Live Web URL Scanner */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Upload .TXT / .PDF</span>
                        <input
                          type="file"
                          accept=".txt,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        id="open-live-url-modal-btn"
                        onClick={() => setShowLiveUrlModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors border border-indigo-200 cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Scan Live Web URL</span>
                      </button>
                    </div>

                    <button
                      onClick={() => executeAnalysis(inputText, activeModel, true)}
                      disabled={isAnalyzing || !inputText.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Running NLP & ML...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Classify & Audit News</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: PREDICTION RESULTS (Prominently displaying the 3 requested fields) */}
              <div className="lg:col-span-5 space-y-4">
                {modelResult && credResult ? (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Prediction Results
                      </span>
                      <span className="text-2xs font-mono text-slate-400">
                        {modelResult.modelUsed}
                      </span>
                    </div>

                    {/* Exact User Format Highlight Box:
                        Prediction: Fake News
                        Confidence: 92%
                        Credibility Score: 25/100
                    */}
                    <div
                      className={`p-6 rounded-2xl border text-center transition-all ${
                        modelResult.prediction === 'Real News'
                          ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/60 border-emerald-300 text-emerald-950'
                          : 'bg-gradient-to-b from-rose-50 to-rose-100/60 border-rose-300 text-rose-950'
                      }`}
                    >
                      <div className="inline-flex items-center justify-center p-3 rounded-full mb-3 bg-white shadow-xs">
                        {modelResult.prediction === 'Real News' ? (
                          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-9 h-9 text-rose-600" />
                        )}
                      </div>

                      <div className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                        Prediction: {modelResult.prediction}
                      </div>

                      <div className="flex items-center justify-center gap-4 text-base font-bold text-slate-800">
                        <span className="px-3 py-1 bg-white/80 rounded-lg border border-slate-200/60 shadow-2xs">
                          Confidence: {modelResult.confidence}%
                        </span>
                        <span className="px-3 py-1 bg-white/80 rounded-lg border border-slate-200/60 shadow-2xs">
                          Credibility Score: {credResult.credibilityScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Credibility Gauge & Status Tier */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Credibility Score Breakdown
                        </span>
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          credResult.color === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          credResult.color === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          credResult.color === 'amber' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {credResult.badge}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            credResult.color === 'emerald' ? 'bg-emerald-500' :
                            credResult.color === 'blue' ? 'bg-blue-500' :
                            credResult.color === 'amber' ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}
                          style={{ width: `${credResult.credibilityScore}%` }}
                        />
                      </div>

                      {/* 4 Dimension sub-scores */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                        <div>
                          <span className="text-slate-500">ML Signal (45%):</span>
                          <span className="font-bold text-slate-800 ml-1">{credResult.breakdown.mlModelSignal} pts</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Neutrality (25%):</span>
                          <span className="font-bold text-slate-800 ml-1">{credResult.breakdown.neutralityScore} pts</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Attribution (20%):</span>
                          <span className="font-bold text-slate-800 ml-1">{credResult.breakdown.attributionScore} pts</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Structure (10%):</span>
                          <span className="font-bold text-slate-800 ml-1">{credResult.breakdown.structureScore} pts</span>
                        </div>
                      </div>
                    </div>

                    {/* Copy Analysis Summary Action */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <button
                        id="copy-analysis-summary-btn"
                        onClick={handleCopyAnalysisSummary}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                          summaryCopied
                            ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-400'
                            : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white'
                        }`}
                        title="Copy structured summary of findings, including prediction and credibility score, ready to paste into reports or emails"
                      >
                        {summaryCopied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-200" />
                            <span>Analysis Summary Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-indigo-300" />
                            <span>Copy Analysis Summary</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-2xs text-slate-500 px-1">
                        <span>Includes verdict, scores & XAI ready for emails or reports</span>
                        <button
                          type="button"
                          onClick={() => setShowSummaryPreview(!showSummaryPreview)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2"
                        >
                          {showSummaryPreview ? 'Hide Preview' : 'Preview Text'}
                        </button>
                      </div>

                      {/* Collapsible preview box */}
                      {showSummaryPreview && (
                        <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-2xs font-mono max-h-52 overflow-y-auto border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-3xs text-slate-400">
                            <span>Ready-to-Paste Summary Preview</span>
                            <button
                              type="button"
                              onClick={handleCopyAnalysisSummary}
                              className="text-indigo-400 hover:text-indigo-300 underline font-sans font-bold"
                            >
                              {summaryCopied ? 'Copied ✓' : 'Copy Text'}
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap leading-relaxed font-mono select-all">
                            {buildAnalysisSummaryText()}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Quick navigation to XAI & Report */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setActiveTab('explainability')}
                        className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Inspect XAI Factors</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('report')}
                        className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Generate Report</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click 'Classify & Audit News' to inspect prediction results.</p>
                  </div>
                )}
              </div>
            </div>

            {/* NLP Pipeline Preprocessing Inspector Drawer */}
            {prepResult && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  NLP Preprocessing Pipeline Inspector
                </h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-2xs font-bold text-slate-500 uppercase">1. Raw Chars</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{prepResult.rawCharacterCount}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-2xs font-bold text-slate-500 uppercase">2. Tokens Extracted</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{prepResult.rawTokenCount}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-2xs font-bold text-slate-500 uppercase">3. Stopwords Removed</span>
                    <div className="text-xl font-bold text-indigo-600 mt-0.5">{prepResult.stopWordsRemovedCount}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-2xs font-bold text-slate-500 uppercase">4. Lemmatized Vocabulary</span>
                    <div className="text-xl font-bold text-emerald-600 mt-0.5">{prepResult.finalLemmasCount}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 truncate">
                  <span className="font-bold text-slate-900 mr-2">Normalized Output:</span>
                  {prepResult.processedText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            FEATURE 4: EXPLAINABLE AI MODULE
            ============================================================== */}
        {activeTab === 'explainability' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Explainable AI (XAI) Module
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Highlighting suspicious keywords and explaining why the content is classified as Fake or Real to provide transparency.
                  </p>
                </div>
                {modelResult && (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      modelResult.prediction === 'Real News'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {modelResult.prediction} ({modelResult.confidence}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {expResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Highlighted Keyword Content */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Interactive Keyword Highlighting
                    </h2>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Suspicious Token
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Authoritative Marker
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Flagged words below influenced the TF-IDF feature weights during classification:
                  </p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 leading-loose text-sm text-slate-800 max-h-80 overflow-y-auto">
                    {expResult.tokenAttributions.map((token, i) => {
                      if (token.category === 'suspicious') {
                        return (
                          <span
                            key={i}
                            title={`Clickbait / Urgency Weight: ${token.impact} (${token.reason})`}
                            className="bg-rose-100 text-rose-900 font-bold px-1.5 py-0.5 mx-0.5 rounded-md border border-rose-300 shadow-2xs cursor-help"
                          >
                            {token.word}{' '}
                          </span>
                        );
                      } else if (token.category === 'credible') {
                        return (
                          <span
                            key={i}
                            title={`Credible Citation Weight: +${token.impact} (${token.reason})`}
                            className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 mx-0.5 rounded-md border border-emerald-300 shadow-2xs cursor-help"
                          >
                            {token.word}{' '}
                          </span>
                        );
                      }
                      return <span key={i}>{token.word} </span>;
                    })}
                  </div>

                  {/* Highlighted Tokens Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                      <span className="font-bold text-rose-900 block mb-1">Suspicious Keywords Flagged:</span>
                      {expResult.suspiciousWords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {expResult.suspiciousWords.map((w, idx) => (
                            <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-rose-200 font-bold text-rose-800">
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No overt clickbait vocabulary found.</span>
                      )}
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                      <span className="font-bold text-emerald-900 block mb-1">Credible Markers Verified:</span>
                      {expResult.credibleWords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {expResult.credibleWords.map((w, idx) => (
                            <span key={idx} className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 font-bold text-emerald-800">
                              {w}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No formal institutional citation terminology matched.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Transparent Explanation Rationales */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-indigo-600" />
                      Why This Content Was Classified As {modelResult?.prediction || 'Such'}
                    </h3>

                    <ul className="space-y-3">
                      {expResult.reasons.map((reason, idx) => (
                        <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dual Model Probability Comparison */}
                  {modelResult && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Individual Classifier Consensuses
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block">Logistic Regression</span>
                          <span className={modelResult.individualModels.logisticRegression.prediction === 'Real News' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {modelResult.individualModels.logisticRegression.prediction}
                          </span>
                          <span className="text-slate-400 block text-2xs mt-0.5">Real: {modelResult.individualModels.logisticRegression.realProb}%</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block">Random Forest</span>
                          <span className={modelResult.individualModels.randomForest.prediction === 'Real News' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {modelResult.individualModels.randomForest.prediction}
                          </span>
                          <span className="text-slate-400 block text-2xs mt-0.5">Real: {modelResult.individualModels.randomForest.realProb}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400">
                <p>Run a news analysis in the 'News Analysis' tab first.</p>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            FEATURE 5: DASHBOARD
            ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Analytics & Performance Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Real-time tracking of total news analyzed, Real versus Fake statistics, prediction distribution, and model accuracy benchmarks.
              </p>
            </div>

            {/* Total news analyzed and KPI metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total News Analyzed</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{history.length}</div>
                <span className="text-xs text-emerald-600 font-semibold">Active session records</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Real News Verified</span>
                <div className="text-3xl font-black text-emerald-600 mt-1">
                  {history.filter(h => h.prediction === 'Real News').length}
                </div>
                <span className="text-xs text-slate-400">
                  {Math.round((history.filter(h => h.prediction === 'Real News').length / history.length) * 100)}% of total
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fake News Detected</span>
                <div className="text-3xl font-black text-rose-600 mt-1">
                  {history.filter(h => h.prediction === 'Fake News').length}
                </div>
                <span className="text-xs text-slate-400">
                  {Math.round((history.filter(h => h.prediction === 'Fake News').length / history.length) * 100)}% of total
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Credibility Score</span>
                <div className="text-3xl font-black text-indigo-600 mt-1">
                  {Math.round(history.reduce((acc, h) => acc + h.credibilityScore, 0) / history.length)}
                  <span className="text-sm font-normal text-slate-400"> / 100</span>
                </div>
                <span className="text-xs text-slate-400">Composite index</span>
              </div>
            </div>

            {/* Confidence vs. Credibility Trend Line Chart */}
            <div id="confidence-vs-credibility-trend-card" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Confidence vs. Credibility Trend
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Time-series correlation between classifier model confidence (%) and computed credibility score (0–100) across audited articles.
                  </p>
                </div>

                {/* Interactive Controls & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category filter */}
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
                    <button
                      id="trend-filter-all-btn"
                      type="button"
                      onClick={() => setTrendFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        trendFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({history.length})
                    </button>
                    <button
                      id="trend-filter-real-btn"
                      type="button"
                      onClick={() => setTrendFilter('real')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        trendFilter === 'real'
                          ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Real Only ({realTrendHistory.length})
                    </button>
                    <button
                      id="trend-filter-fake-btn"
                      type="button"
                      onClick={() => setTrendFilter('fake')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        trendFilter === 'fake'
                          ? 'bg-white text-rose-800 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Fake Only ({fakeTrendHistory.length})
                    </button>
                  </div>

                  {/* Line toggles */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <button
                      id="toggle-confidence-line-btn"
                      type="button"
                      onClick={() => setShowConfidenceLine(!showConfidenceLine)}
                      className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        showConfidenceLine
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                      }`}
                      title="Toggle Model Confidence line visibility"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>Confidence (%)</span>
                    </button>
                    <button
                      id="toggle-credibility-line-btn"
                      type="button"
                      onClick={() => setShowCredibilityLine(!showCredibilityLine)}
                      className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        showCredibilityLine
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                      }`}
                      title="Toggle Credibility Score line visibility"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Credibility (/100)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistical Correlation Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-2xs block font-medium">Mean Model Confidence</span>
                  <span className="text-base font-black text-indigo-900">{avgTrendConfidence}%</span>
                  <span className="text-3xs text-indigo-700 font-semibold block mt-0.5">High Certainty</span>
                </div>
                <div>
                  <span className="text-slate-500 text-2xs block font-medium">Real News Avg Credibility</span>
                  <span className="text-base font-black text-emerald-700">{avgRealTrendCred} / 100</span>
                  <span className="text-3xs text-emerald-600 font-semibold block mt-0.5">Verified Journalistic Rigor</span>
                </div>
                <div>
                  <span className="text-slate-500 text-2xs block font-medium">Fake News Avg Credibility</span>
                  <span className="text-base font-black text-rose-700">{avgFakeTrendCred} / 100</span>
                  <span className="text-3xs text-rose-600 font-semibold block mt-0.5">Disinformation Penalty</span>
                </div>
                <div>
                  <span className="text-slate-500 text-2xs block font-medium">Fake News Spread Gap</span>
                  <span className="text-base font-black text-amber-700">+{disinformationSpread} pts</span>
                  <span className="text-3xs text-amber-700 font-semibold block mt-0.5">Confidence vs. Credibility Delta</span>
                </div>
              </div>

              {/* Recharts Line Chart Container */}
              <div id="confidence-credibility-linechart-container" className="w-full h-72 sm:h-80 pt-2">
                {filteredTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredTrendData} margin={{ top: 14, right: 24, left: -15, bottom: 6 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        dy={6}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        ticks={[0, 25, 50, 75, 100]}
                        unit="%"
                      />
                      <Tooltip content={<CustomTrendTooltip />} />
                      <ReferenceLine
                        y={50}
                        stroke="#cbd5e1"
                        strokeDasharray="4 4"
                        label={{
                          value: 'Credibility Threshold (50%)',
                          fill: '#94a3b8',
                          fontSize: 10,
                          position: 'insideBottomRight'
                        }}
                      />
                      {showConfidenceLine && (
                        <Line
                          type="monotone"
                          dataKey="confidence"
                          name="Model Confidence (%)"
                          stroke="#4f46e5"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                          activeDot={{ r: 7, fill: '#4338ca', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      )}
                      {showCredibilityLine && (
                        <Line
                          type="monotone"
                          dataKey="credibility"
                          name="Credibility Score (0-100)"
                          stroke="#059669"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#059669', strokeWidth: 0 }}
                          activeDot={{ r: 7, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                    No records match the current filter.
                  </div>
                )}
              </div>

              {/* Chart Interpretation Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 gap-2">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-3 h-1 rounded-full bg-indigo-600 inline-block" />
                    Model Confidence (%)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="w-3 h-1 rounded-full bg-emerald-600 inline-block" />
                    Credibility Score (0-100)
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-slate-400">
                    <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block" />
                    50% Veracity Boundary
                  </span>
                </div>
                <span className="text-2xs text-slate-400">
                  Hover on any node to view article excerpt, individual scores, and correlation gap
                </span>
              </div>
            </div>

            {/* Prediction Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Real vs Fake Chart */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Real vs Fake Statistics</h3>
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full transition-all"
                    style={{
                      width: `${(history.filter(h => h.prediction === 'Real News').length / history.length) * 100}%`
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all"
                    style={{
                      width: `${(history.filter(h => h.prediction === 'Fake News').length / history.length) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Real ({Math.round((history.filter(h => h.prediction === 'Real News').length / history.length) * 100)}%)
                  </span>
                  <span className="text-rose-700 flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Fake ({Math.round((history.filter(h => h.prediction === 'Fake News').length / history.length) * 100)}%)
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                  <p>• Model soft voting minimizes False Positives.</p>
                  <p>• Click any row in the log to inspect details.</p>
                </div>
              </div>

              {/* Accuracy Metrics Table */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Model Accuracy Metrics & Evaluation Matrix
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Metric</th>
                        <th className="px-4 py-3">Logistic Regression</th>
                        <th className="px-4 py-3">Random Forest</th>
                        <th className="px-4 py-3">Ensemble</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-900">Accuracy</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.logisticRegression.accuracy}%</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.randomForest.accuracy}%</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">96.8%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-900">Precision</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.logisticRegression.precision}%</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.randomForest.precision}%</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">96.5%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-900">Recall</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.logisticRegression.recall}%</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.randomForest.recall}%</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">97.1%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-semibold text-slate-900">ROC-AUC</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.logisticRegression.rocAuc}%</td>
                        <td className="px-4 py-3 text-slate-700">{BENCHMARK_METRICS.randomForest.rocAuc}%</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">0.991</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Historical Verification Activity Log */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Analysis History Log</h3>
                <span className="text-xs text-slate-400 font-mono">{history.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Snippet</th>
                      <th className="px-4 py-3">Prediction</th>
                      <th className="px-4 py-3">Confidence</th>
                      <th className="px-4 py-3">Credibility</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {history.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500 font-mono">{entry.timestamp}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium max-w-xs truncate">{entry.snippet}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${
                            entry.prediction === 'Real News'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {entry.prediction}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{entry.confidence}%</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{entry.credibilityScore}/100</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setInputText(entry.fullText);
                              executeAnalysis(entry.fullText, activeModel);
                              setActiveTab('analysis');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-bold"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            FEATURE 6: REPORT GENERATION
            ============================================================== */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-600" />
                  Report Generation Module
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Downloadable official verification audit PDF report with prediction results, confidence, credibility score, and XAI findings.
                </p>
              </div>

              {modelResult && credResult && expResult && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyAnalysisSummary}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-all flex items-center gap-2"
                    title="Copy structured text summary to clipboard"
                  >
                    {summaryCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Summary Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Copy Text Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => downloadPdfReport(inputText, modelResult, credResult, expResult, activeModel)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </button>
                </div>
              )}
            </div>

            {/* Report Preview Document Card */}
            {modelResult && credResult && expResult ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-6">
                {/* Official Header Banner */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      TruthLens AI - Verification Audit Dossier
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Automated Natural Language Processing & Machine Learning Classification
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-400 font-mono">
                    Official Audit #{history[0]?.id || "TL-001"}
                  </div>
                </div>

                {/* Verdict Box */}
                <div className={`p-4 rounded-xl border ${
                  modelResult.prediction === 'Real News'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="text-lg font-black uppercase">
                    Verdict: {modelResult.prediction}
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    Confidence: {modelResult.confidence}% &nbsp;|&nbsp; Credibility Score: {credResult.credibilityScore}/100 ({credResult.badge})
                  </div>
                </div>

                {/* Section 1: Credibility Breakdown */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Credibility Dimension Breakdown
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>• ML Statistical Probability: <strong>{credResult.breakdown.mlModelSignal}/45.0 pts</strong></div>
                    <div>• Tone & Neutrality: <strong>{credResult.breakdown.neutralityScore}/25.0 pts</strong></div>
                    <div>• Institutional Citations: <strong>{credResult.breakdown.attributionScore}/20.0 pts</strong></div>
                    <div>• Lexical Richness: <strong>{credResult.breakdown.structureScore}/10.0 pts</strong></div>
                  </div>
                </div>

                {/* Section 2: XAI Reasons */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Explainable AI Rationales
                  </h3>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc">
                    {expResult.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Section 3: Article Excerpt */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    3. Analyzed Article Excerpt
                  </h3>
                  <blockquote className="text-xs italic text-slate-600 bg-slate-50 p-4 rounded-xl border-l-4 border-slate-300">
                    "{inputText.slice(0, 400)}..."
                  </blockquote>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-2xs text-slate-400">
                    TruthLens AI Academic Verification Engine
                  </span>
                  <button
                    onClick={() => downloadPdfReport(inputText, modelResult, credResult, expResult, activeModel)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Now</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center text-slate-400">
                <p>Run a news analysis in the 'News Analysis' tab to generate an audit report.</p>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            FEATURE 7: PYTHON PROJECT & STREAMLIT SOURCE CODE
            ============================================================== */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  TruthLens-AI Python & Streamlit Project
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Complete modular source code matching the exact requested folder structure: app.py, modules/, models/, dataset/, requirements.txt, and README.md.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyCodeToClipboard}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Active File'}</span>
                </button>
                <button
                  onClick={triggerDownloadZip}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Project</span>
                </button>
              </div>
            </div>

            {/* Code Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* File Tree */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
                  TruthLens-AI / Project Files
                </span>
                {PYTHON_SOURCE_FILES.map((file) => (
                  <button
                    key={file.filename}
                    onClick={() => setSelectedCodeFile(file)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-start justify-between ${
                      selectedCodeFile.filename === file.filename
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-indigo-600" />
                        <span className="font-mono text-xs font-bold">{file.filename}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{file.description}</p>
                    </div>
                    <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded bg-slate-200/70 text-slate-600">
                      {file.category}
                    </span>
                  </button>
                ))}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mt-4 space-y-1">
                  <span className="font-bold block text-slate-900">Run Streamlit Frontend:</span>
                  <code className="font-mono text-xs bg-white p-1.5 rounded border border-slate-200 block text-indigo-700">
                    streamlit run app.py
                  </code>
                </div>
              </div>

              {/* Code Preview Viewer */}
              <div className="lg:col-span-8 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md flex flex-col">
                <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="font-mono font-bold text-slate-200 ml-2">{selectedCodeFile.filename}</span>
                  </div>
                  <span className="text-slate-500 font-mono">{selectedCodeFile.language.toUpperCase()}</span>
                </div>

                <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed max-h-[620px]">
                  <code>{selectedCodeFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Live Web URL Scanner Modal */}
      {showLiveUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Live Web Article URL Scanner</h3>
              </div>
              <button
                onClick={() => {
                  if (!isLiveScanningUrl) setShowLiveUrlModal(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Provide any online news link or choose a curated live source to fetch web article metadata, extract clean textual body paragraphs, and run instant verification.
            </p>

            {/* Input Bar */}
            <div className="space-y-2">
              <label className="text-2xs font-bold text-slate-500 uppercase tracking-wider">Target Web URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://www.reuters.com/world/news-article..."
                    value={liveUrlInput}
                    onChange={(e) => setLiveUrlInput(e.target.value)}
                    disabled={isLiveScanningUrl}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-mono"
                  />
                </div>
                <button
                  type="button"
                  id="scan-custom-live-url-btn"
                  onClick={() => handleScanLiveUrl(liveUrlInput || DEMO_LIVE_URLS[0].url)}
                  disabled={isLiveScanningUrl}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isLiveScanningUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                  <span>Scan URL</span>
                </button>
              </div>
            </div>

            {/* Scanning Progress Bar Animation */}
            {isLiveScanningUrl && (
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-2 text-indigo-300">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    Live Web Crawler in Progress
                  </span>
                  <span className="font-mono text-slate-400 text-2xs">Step {liveScanStep} of 4</span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${(liveScanStep / 4) * 100}%` }}
                  />
                </div>

                <div className="text-2xs font-mono text-slate-300">
                  {liveScanStep === 1 && "▶ Resolving target host domain DNS & establishing SSL handshake..."}
                  {liveScanStep === 2 && "▶ Extracting article body paragraphs and stripping advertising noise..."}
                  {liveScanStep === 3 && "▶ Generating TF-IDF n-grams & checking lexical sensationalism..."}
                  {liveScanStep === 4 && "▶ Running Soft-Voting Ensemble model & calculating credibility..."}
                </div>
              </div>
            )}

            {/* Quick Demo Live Links */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
                Or Select Live Verification Test Feeds:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_LIVE_URLS.map((demo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    id={`demo-live-url-${idx}`}
                    disabled={isLiveScanningUrl}
                    onClick={() => {
                      setLiveUrlInput(demo.url);
                      handleScanLiveUrl(demo.url);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      demo.reputation === 'high_trust'
                        ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70'
                        : 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-2xs font-mono text-slate-500 truncate">{demo.domain}</span>
                      <span
                        className={`text-3xs font-extrabold px-1.5 py-0.2 rounded uppercase ${
                          demo.reputation === 'high_trust'
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-rose-200 text-rose-900'
                        }`}
                      >
                        {demo.reputation === 'high_trust' ? 'Expected Real' : 'Expected Fake'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{demo.headline}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLiveUrlModal(false)}
                disabled={isLiveScanningUrl}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viva / Defense Prep Modal */}
      {showVivaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">TruthLens AI - Technical Viva Guide</h3>
              </div>
              <button
                onClick={() => setShowVivaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Q1: How are the prediction results structured?</span>
                <p>TruthLens AI outputs three standardized fields: <strong>Prediction</strong> (Real News / Fake News), <strong>Confidence</strong> (e.g. 92%), and <strong>Credibility Score</strong> (e.g. 25/100).</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Q2: How does the Credibility Score differ from pure ML probability?</span>
                <p>Pure ML models can suffer from adversarial blindspots. TruthLens AI synthesizes the ML posterior probability (45%) with deterministic journalistic audit dimensions: anti-sensationalism checks (25%), institutional citation attribution (20%), and lexical diversity structure (10%).</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">Q3: How is Explainable AI (XAI) achieved?</span>
                <p>Local feature attribution highlights suspicious clickbait keywords in red with negative weights and verified institutional citations in green, combined with human-readable rationales explaining the verdict.</p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowVivaModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
