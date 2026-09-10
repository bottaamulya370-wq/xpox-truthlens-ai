import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Globe,
  Gauge
} from 'lucide-react';
import {
  INCOMING_LIVE_FEED_STREAM,
  LiveWireItem,
  playLiveAudioAlert
} from '../liveFeedData';
import {
  classifyText,
  calculateCredibility,
  ModelPrediction,
  CredibilityResult
} from '../nlpEngine';

interface ClassifiedLiveItem {
  wire: LiveWireItem;
  prediction: ModelPrediction;
  credibility: CredibilityResult;
  timestampStr: string;
}

interface LiveWireMonitorProps {
  onSelectForDeepAnalysis: (text: string) => void;
}

export const LiveWireMonitor: React.FC<LiveWireMonitorProps> = ({
  onSelectForDeepAnalysis
}) => {
  const [streamIndex, setStreamIndex] = useState<number>(3);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(7000); // 7s interval
  const [filterType, setFilterType] = useState<'all' | 'real' | 'fake'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [feedItems, setFeedItems] = useState<ClassifiedLiveItem[]>([]);
  const [lastItemArrivedTime, setLastItemArrivedTime] = useState<string>('Just now');
  const timerRef = useRef<number | null>(null);

  // Initial classification of first 4 items on mount
  useEffect(() => {
    const initialPool = INCOMING_LIVE_FEED_STREAM.slice(0, 4);
    const classified = initialPool.map((wire, idx) => {
      const pred = classifyText(wire.content, 'ensemble');
      const cred = calculateCredibility(wire.content, pred.realProbability);
      return {
        wire,
        prediction: pred,
        credibility: cred,
        timestampStr: idx === 0 ? 'Just now' : `${idx * 6}s ago`
      };
    });
    setFeedItems(classified);
  }, []);

  // Advance stream and process next incoming item
  const pushNextWireItem = () => {
    const nextIdx = (streamIndex + 1) % INCOMING_LIVE_FEED_STREAM.length;
    setStreamIndex(nextIdx);
    const nextWire = INCOMING_LIVE_FEED_STREAM[nextIdx];

    const pred = classifyText(nextWire.content, 'ensemble');
    const cred = calculateCredibility(nextWire.content, pred.realProbability);

    const newItem: ClassifiedLiveItem = {
      wire: nextWire,
      prediction: pred,
      credibility: cred,
      timestampStr: 'Just now'
    };

    if (soundEnabled) {
      playLiveAudioAlert(pred.prediction === 'Real News' ? 'real' : 'fake');
    }

    setLastItemArrivedTime(new Date().toLocaleTimeString());
    setFeedItems(prev => [newItem, ...prev.slice(0, 19)]);
  };

  // Streaming timer interval
  useEffect(() => {
    if (isStreaming) {
      timerRef.current = window.setInterval(() => {
        pushNextWireItem();
      }, streamSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isStreaming, streamSpeed, streamIndex, soundEnabled]);

  // Filtered items
  const filteredFeed = feedItems.filter(item => {
    if (filterType === 'real' && item.prediction.prediction !== 'Real News') return false;
    if (filterType === 'fake' && item.prediction.prediction !== 'Fake News') return false;
    if (categoryFilter !== 'all' && item.wire.category !== categoryFilter) return false;
    return true;
  });

  // Calculate live aggregate stats
  const totalAudited = feedItems.length;
  const fakeCount = feedItems.filter(i => i.prediction.prediction === 'Fake News').length;
  const realCount = feedItems.filter(i => i.prediction.prediction === 'Real News').length;
  const fakePercentage = totalAudited > 0 ? Math.round((fakeCount / totalAudited) * 100) : 0;
  const avgCredibility = totalAudited > 0
    ? Math.round(feedItems.reduce((acc, i) => acc + i.credibility.credibilityScore, 0) / totalAudited)
    : 0;

  return (
    <div className="space-y-6">
      {/* Live Stream Status & Control Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {isStreaming ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500" />
                )}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                {isStreaming ? 'Live Wire Stream Active' : 'Live Stream Paused'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Last pulse: {lastItemArrivedTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Real-Time Global News Wire Monitor
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous fact-checking pipeline continuously ingesting live headlines, press wires, and social media bulletins. NLP vectorizers and ensemble models classify veracity instantly upon wire ingestion.
            </p>
          </div>

          {/* Interactive Live Controls */}
          <div className="bg-slate-800/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-700 space-y-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="toggle-live-stream-btn"
                onClick={() => setIsStreaming(!isStreaming)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isStreaming
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {isStreaming ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Live Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume Live Stream</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="fetch-next-wire-btn"
                onClick={pushNextWireItem}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Manually simulate immediate arrival of next wire bulletin"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Next Item</span>
              </button>

              <button
                type="button"
                id="toggle-live-sound-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-indigo-600/30 border-indigo-400/40 text-indigo-300'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400'
                }`}
                title={soundEnabled ? 'Mute Live Audio Chimes' : 'Enable Live Audio Chimes'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Speed selector */}
            <div className="flex items-center justify-between gap-2 text-2xs text-slate-300 pt-1 border-t border-slate-700/80">
              <span className="font-semibold">Interval Speed:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: '5s', val: 5000 },
                  { label: '8s', val: 8000 },
                  { label: '12s', val: 12000 }
                ].map(speed => (
                  <button
                    key={speed.val}
                    type="button"
                    onClick={() => setStreamSpeed(speed.val)}
                    className={`px-2 py-0.5 rounded text-3xs font-mono font-bold transition-all cursor-pointer ${
                      streamSpeed === speed.val
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream Real-Time Telemetry Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Stream Ingested</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalAudited}</span>
            <span className="text-xs text-slate-400 font-medium">bulletins</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-2xs font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Throughput: ~{(60000 / streamSpeed).toFixed(1)}/min</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Disinfo Flagged</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{fakeCount}</span>
            <span className="text-xs text-slate-400 font-medium">({fakePercentage}%)</span>
          </div>
          <span className="text-2xs text-slate-400 block mt-2">
            {realCount} certified legitimate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Credibility</span>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{avgCredibility}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <span className="text-2xs text-slate-400 block mt-2">
            Continuous Bayesian mean
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Inference Speed</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">12.6</span>
            <span className="text-xs text-slate-400 font-medium">ms / doc</span>
          </div>
          <span className="text-2xs text-emerald-600 font-medium block mt-2">
            Sub-second real-time scoring
          </span>
        </div>
      </div>

      {/* Filter and Feed Queue Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Veracity Filter:</span>
          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({feedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('real')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterType === 'real'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Real Only ({realCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('fake')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filterType === 'fake'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Fake Only ({fakeCount})
            </button>
          </div>
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Topics</option>
            <option value="Science">Science & Space</option>
            <option value="Health">Health & Medicine</option>
            <option value="Geopolitics">Geopolitics</option>
            <option value="Tech">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Climate">Climate</option>
          </select>
        </div>
      </div>

      {/* Live Stream Articles Feed List */}
      <div className="space-y-4">
        {filteredFeed.map((item, idx) => {
          const isReal = item.prediction.prediction === 'Real News';
          const isFresh = idx === 0;

          return (
            <div
              key={`${item.wire.id}-${idx}`}
              id={`live-wire-item-${item.wire.id}`}
              className={`rounded-2xl border transition-all p-5 shadow-2xs hover:shadow-md bg-white ${
                isFresh
                  ? 'ring-2 ring-indigo-500/40 border-indigo-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left: Article Details & Snippet */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {isFresh && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-3xs font-black bg-indigo-600 text-white animate-pulse">
                        <Radio className="w-2.5 h-2.5" />
                        JUST ARRIVED
                      </span>
                    )}
                    <span className="font-mono text-3xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                      {item.wire.id}
                    </span>
                    <span className="text-3xs font-semibold text-slate-500 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {item.wire.source}
                    </span>
                    <span className="text-3xs font-mono text-slate-400">
                      • {item.wire.country} • {item.wire.category}
                    </span>
                    <span className="text-3xs font-mono text-slate-400 ml-auto md:ml-0">
                      Latency: {item.wire.simulatedLatencyMs}ms
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {item.wire.headline}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {item.wire.content}
                  </p>

                  {/* Highlighted suspicious cues if fake */}
                  {!isReal && item.credibility.sensationalismDetails.sensationalPhrases.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-3xs font-bold text-rose-700 uppercase tracking-wider">Trigger Tokens:</span>
                      {item.credibility.sensationalismDetails.sensationalPhrases.slice(0, 4).map((p, pIdx) => (
                        <span
                          key={pIdx}
                          className="px-1.5 py-0.2 rounded text-3xs font-bold bg-rose-100 text-rose-800 border border-rose-200 font-mono"
                        >
                          "{p}"
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Live AI Scorecard & Action */}
                <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-extrabold text-xs shadow-xs ${
                        isReal
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isReal ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{item.prediction.prediction}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">
                        {item.prediction.confidence.toFixed(1)}% <span className="text-3xs text-slate-400 font-normal">conf</span>
                      </div>
                      <div className="text-3xs font-bold text-slate-500">
                        Cred: {item.credibility.credibilityScore}/100
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectForDeepAnalysis(item.wire.content)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Full Audit Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredFeed.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
            <Filter className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No live items match the active filter</h4>
            <p className="text-xs text-slate-500">Try changing the veracity filter or category selector to view arriving bulletins.</p>
          </div>
        )}
      </div>
    </div>
  );
};
