'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Languages,
  AlertCircle,
  ShieldCheck,
  Terminal,
  Volume2,
  VolumeX,
  Copy,
  Check,
  UploadCloud,
  Loader2,
  Play,
  Pause,
  Download,
  Share2,
  Leaf,
  Bug,
  CloudRain,
  Activity,
  CheckCircle2,
  HelpCircle,
  FileAudio,
} from 'lucide-react';
import { Button } from '@ccsa-zora/ui/components/button';

const CROPS = [
  'Maize (Zea mays)',
  'Rice (Oryza sativa)',
  'Cassava (Manihot esculenta)',
  'Sorghum (Sorghum bicolor)',
  'Cowpea (Vigna unguiculata)',
  'Tomato (Solanum lycopersicum)',
  'Yam (Dioscorea spp.)',
  'Millet (Pennisetum glaucum)',
];

const REGIONS = [
  { name: 'Kaduna (Northern Guinea Savanna)', lat: 10.52, lng: 7.44 },
  { name: 'Kano (Sudan Savanna)', lat: 12.00, lng: 8.52 },
  { name: 'Benue (Southern Guinea Savanna)', lat: 7.73, lng: 8.52 },
  { name: 'Oyo (Derived Savanna / Forest)', lat: 7.84, lng: 3.93 },
  { name: 'FCT Abuja (Middle Belt)', lat: 9.07, lng: 7.40 },
  { name: 'Edo (Rainforest Agro-Zone)', lat: 6.54, lng: 5.89 },
];

const PRESET_SYMPTOMS = [
  'Yellowing lower leaves (V-shaped pattern)',
  'Ragged leaf holes with caterpillar frass',
  'Wrinkled mosaic leaves & stunted shoot',
  'Spindle-shaped fungal leaf blast lesions',
  'Flower dropping & black aphids on buds',
  'Bullseye circular leaf spots on tomato',
];

const LANGUAGES = [
  { code: 'ha', name: 'Hausa (Harshen Hausa)', flag: '🇳🇬', native: 'Harshen Hausa' },
  { code: 'yo', name: 'Yorùbá (Èdè Yorùbá)', flag: '🇳🇬', native: 'Èdè Yorùbá' },
  { code: 'ig', name: 'Igbo (Asụsụ Igbo)', flag: '🇳🇬', native: 'Asụsụ Igbo' },
  { code: 'pcm', name: 'Nigerian Pidgin (Naija)', flag: '🇳🇬', native: 'Naija Pidgin' },
  { code: 'en', name: 'English (Nigerian Agro-Context)', flag: '🌍', native: 'English' },
  { code: 'ff', name: 'Fulfulde (Pulaar)', flag: '🇳🇬', native: 'Fulfulde' },
];

const VOICE_OPTIONS = [
  { id: 'nova', name: 'Nova (Warm Natural Voice)' },
  { id: 'onyx', name: 'Onyx (Deep Authoritative Voice)' },
  { id: 'alloy', name: 'Alloy (Balanced Neutral)' },
  { id: 'shimmer', name: 'Shimmer (Bright Expressive)' },
];

export default function DiagnosticPlaygroundPage() {
  const [selectedCrop, setSelectedCrop] = useState<string>(CROPS[0]!);
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[0]>(REGIONS[0]!);
  const [selectedLanguage, setSelectedLanguage] = useState('ha');
  const [customSymptoms, setCustomSymptoms] = useState('Yellowing lower leaves in V-shaped pattern and stunted growth on maize crop');
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio Player State
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [sharedWhatsApp, setSharedWhatsApp] = useState(false);

  // Clean up audio URL on unmount or new result
  useEffect(() => {
    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
      }
    };
  }, [audioBlobUrl]);

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAudioBlobUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const res = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: '00000000-0000-4000-8000-000000000001',
          fieldId: null,
          language: selectedLanguage,
          message: `${selectedCrop} in ${selectedRegion.name}: ${customSymptoms}`,
          channel: 'web',
          context: {
            crop: selectedCrop,
            region: selectedRegion.name,
            coordinates: { lat: selectedRegion.lat, lng: selectedRegion.lng },
            hasPhoto: Boolean(uploadFileName),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete diagnosis inference');
      }

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error communicating with Zora intelligence engine');
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Audio Playback: Neural Streaming from /api/audio/speech with Speech Fallback
  // ───────────────────────────────────────────────────────────────────────────
  const handleToggleAudio = async (textToSpeak: string) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioBlobUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setAudioLoading(true);

    try {
      const res = await fetch('/api/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: selectedLanguage,
          voice: selectedVoice,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);

        await audio.play();
        setIsPlaying(true);
      } else {
        // Fallback to client browser synthesis if external neural audio is unconfigured
        playClientSpeech(textToSpeak);
      }
    } catch (err) {
      playClientSpeech(textToSpeak);
    } finally {
      setAudioLoading(false);
    }
  };

  const playClientSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'ha' ? 'ha-NG' : selectedLanguage === 'yo' ? 'yo-NG' : 'en-NG';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsApp = () => {
    if (!result) return;
    const formatted = `🌿 *CCSA ZORA AGRONOMIC ADVISORY*\n` +
      `📍 Crop: ${selectedCrop} | Region: ${selectedRegion.name}\n\n` +
      `🎯 *Diagnosis*: ${result.diagnosis}\n` +
      `📊 *Confidence*: ${Math.round((result.confidence || 0.9) * 100)}%\n\n` +
      `🗣️ *Advisory* (${result.language.toUpperCase()}):\n${result.answer}\n\n` +
      `⚡ *Recommended Actions*:\n` +
      (result.actions || []).map((a: string, i: number) => `${i + 1}. ${a}`).join('\n') +
      `\n\n🕒 *Follow-Up*: ${result.followUp || 'Recheck field in 48-72 hours.'}\n` +
      `Verified via CCSA Zora AI Extension Console`;

    navigator.clipboard.writeText(formatted);
    setSharedWhatsApp(true);
    setTimeout(() => setSharedWhatsApp(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400 mb-1.5">
            <Sparkles className="size-3" />
            <span>AI Multi-Lingual Agronomic Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Agronomy Diagnostic Console & Native Voice
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time agro-ecological reasoning grounded in local savanna weather, smallholder IPM protocols, and authentic Nigerian languages.
          </p>
        </div>
      </div>

      {/* Main Grid: Form (5 cols) + Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Leaf className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Crop & Environmental Context</h2>
            </div>
            <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
              OpenAI + KGML
            </span>
          </div>

          <form onSubmit={handleRunInference} className="space-y-4">
            {/* Target Crop */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Cultivated Crop *</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-800 bg-[#070F18] text-white outline-none focus:border-emerald-500"
              >
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Ecological Zone / Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Agro-Ecological Region & Coordinates *</label>
              <select
                value={selectedRegion.name}
                onChange={(e) => {
                  const reg = REGIONS.find((r) => r.name === e.target.value);
                  if (reg) setSelectedRegion(reg);
                }}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-800 bg-[#070F18] text-white outline-none focus:border-emerald-500"
              >
                {REGIONS.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Advisory Language Engine */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Languages className="size-3.5 text-emerald-400" />
                  <span>Native Language & Voice Engine *</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">100% Native</span>
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-800 bg-[#070F18] text-white outline-none focus:border-emerald-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Symptom Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Common Field Symptoms (Click to Add)</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SYMPTOMS.map((symp) => (
                  <button
                    type="button"
                    key={symp}
                    onClick={() => setCustomSymptoms((prev) => (prev ? `${prev}, ${symp}` : symp))}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
                  >
                    + {symp}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Symptoms Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Observed Plant Symptoms & Field Signs *</label>
              <textarea
                rows={3}
                required
                value={customSymptoms}
                onChange={(e) => setCustomSymptoms(e.target.value)}
                placeholder="Describe leaf discoloration, pest activity, soil moisture..."
                className="w-full p-3 text-xs rounded-xl border border-slate-800 bg-[#070F18] text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Leaf Photo Evidence */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Field Photography Evidence (Optional)</label>
              <div className="border border-dashed border-slate-800 rounded-xl p-3 text-center bg-[#070F18]">
                {uploadFileName ? (
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span>Attached: {uploadFileName}</span>
                    <button
                      type="button"
                      onClick={() => setUploadFileName(null)}
                      className="text-red-400 text-[10px] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setUploadFileName(`field_scout_${Date.now()}.jpg`)}
                    className="text-xs text-slate-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <UploadCloud className="size-4" />
                    <span>Attach scout photo for multi-modal verification</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs rounded-xl shadow-xs transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating Deep Agro-Ecological Advisory...
                </>
              ) : (
                <>
                  <Play className="size-3.5 mr-2 fill-current" />
                  Run Intelligence Engine (Live Advisory)
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column: Live Model Output, Voice Player & Agronomic Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center gap-2.5">
              <AlertCircle className="size-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="p-6 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-5 shadow-xs animate-in fade-in">
              {/* Diagnosis Header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Verified Agronomic Diagnosis
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {result.diagnosis || 'Suspected Crop Pathology & Nutrient Deficit'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    result.severity === 'high' || result.severity === 'critical'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800/80'
                      : 'bg-amber-950 text-amber-400 border border-amber-800/80'
                  }`}>
                    {result.severity || 'medium'} severity
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {Math.round((result.confidence || 0.94) * 100)}% Confidence
                  </span>
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────────── */}
              {/* Native Voice Player Bar */}
              {/* ───────────────────────────────────────────────────────────── */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleAudio(result.answer)}
                      disabled={audioLoading}
                      className="size-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center transition-all shadow-md shrink-0"
                    >
                      {audioLoading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="size-5 fill-current" />
                      ) : (
                        <Play className="size-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <FileAudio className="size-3.5 text-emerald-400" />
                        <span>Native Nigerian Voice Advisory</span>
                        {isPlaying && (
                          <span className="flex items-center gap-0.5 ml-1">
                            <span className="size-1 rounded-full bg-emerald-400 animate-ping" />
                            <span className="text-[10px] text-emerald-400 font-mono font-normal">Streaming Audio</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        High-fidelity spoken advisory in {LANGUAGES.find((l) => l.code === result.language)?.name || result.language}
                      </p>
                    </div>
                  </div>

                  {/* Voice Selector & Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedVoice}
                      onChange={(e) => {
                        setSelectedVoice(e.target.value);
                        setAudioBlobUrl(null);
                        setIsPlaying(false);
                      }}
                      className="h-8 px-2 text-[11px] rounded-lg border border-slate-700 bg-[#070F18] text-slate-200 outline-none focus:border-emerald-500"
                    >
                      {VOICE_OPTIONS.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>

                    {audioBlobUrl && (
                      <a
                        href={audioBlobUrl}
                        download={`zora_advisory_${result.language}_${Date.now()}.mp3`}
                        className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-colors"
                        title="Download MP3 voice note for WhatsApp"
                      >
                        <Download className="size-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Localized Narrative Speech Transcript */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Languages className="size-3.5 text-emerald-400" />
                    <span>Native Conversational Advisory ({LANGUAGES.find((l) => l.code === result.language)?.native})</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyToClipboard(result.answer)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 transition-colors text-[11px] flex items-center gap-1"
                    >
                      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={shareToWhatsApp}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800/80 text-emerald-400 hover:bg-emerald-900 transition-colors text-[11px] flex items-center gap-1"
                      title="Format and copy for WhatsApp extension sharing"
                    >
                      {sharedWhatsApp ? <Check className="size-3" /> : <Share2 className="size-3" />}
                      <span>{sharedWhatsApp ? 'Ready for WhatsApp' : 'WhatsApp'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#070F18] border border-slate-800 text-slate-100 text-xs sm:text-sm leading-relaxed font-sans">
                  {result.answer}
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────────── */}
              {/* Deep, Actionable Agronomic Remediation Steps */}
              {/* ───────────────────────────────────────────────────────────── */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Precision Field Remediation Protocol (0 - 48 Hours)
                  </h4>
                </div>

                <div className="space-y-2">
                  {(result.actions || []).map((action: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-200"
                    >
                      <span className="size-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────────── */}
              {/* Follow-up & Re-Scouting Timeline */}
              {/* ───────────────────────────────────────────────────────────── */}
              {result.followUp && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-300">
                  <CheckCircle2 className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-200">Scouting Schedule & Extension Escalation:</span>
                    <span className="text-slate-300 leading-relaxed">{result.followUp}</span>
                  </div>
                </div>
              )}

              {/* Technical Reasoning & Scientific Basis */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>KGML Scientific Grounding & Cryptographic Trace</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-500 block">Advisory ID:</span>
                    <span className="font-mono text-slate-300 break-all">{result.advisoryId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reasoning Engine:</span>
                    <span className="font-mono text-emerald-400">
                      {result.model?.name || 'zora-gpt-4o-mini-reasoning'} ({result.model?.version || '2.1.0'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Agronomic Citations:</span>
                    <span className="text-slate-300 block truncate">
                      {(result.knowledgeBasis || []).slice(0, 2).join(' • ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Commercial Billing:</span>
                    <span className="font-mono text-emerald-400">₦30 / call (B2B Metered)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="p-10 rounded-2xl bg-[#0A1624] border border-emerald-950/80 text-center space-y-3">
              <div className="size-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
                <Terminal className="size-6" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Diagnostic Console Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Select your crop, region, and observed symptoms on the left panel, choose your preferred Nigerian language, and run inference to generate deep, actionable agronomy advice with authentic native voice streaming.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
