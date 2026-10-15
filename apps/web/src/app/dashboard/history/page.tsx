"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sprout,
  ArrowRight,
  Sparkles,
  Calendar,
  Languages,
  Leaf,
  Pill,
} from "lucide-react";
import { useWorkspace, ConsultationItem } from "@/context/workspace-context";

export default function HistoryPage() {
  const { consultations } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("All");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available crop filters from consultations
  const allCrops = ["All", ...Array.from(new Set(consultations.map((c) => c.crop)))];

  const filteredConsultations = consultations.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.crop.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCrop = selectedCrop === "All" || item.crop === selectedCrop;
    const matchesSeverity =
      selectedSeverity === "All" || item.severity === selectedSeverity;

    return matchesSearch && matchesCrop && matchesSeverity;
  });

  function togglePlay(id: string) {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  }

  function handleCopy(item: ConsultationItem) {
    const text = `Zora Agricultural Diagnosis for ${item.crop}:\nIssue: ${item.diagnosis}\nRecommended Treatment: ${item.treatment}\nOrganic/Low-cost Alternative: ${item.lowCostAlternative}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleWhatsAppShare(item: ConsultationItem) {
    const text = encodeURIComponent(
      `🌾 *CCSA Zora Agricultural Advisory*\n*Crop:* ${item.crop}\n*Diagnosis:* ${item.diagnosis}\n\n*Treatment:* ${item.treatment}\n\n*Low-cost Organic Remedy:* ${item.lowCostAlternative}\n\n_Validated by Cosmopolitan University Center for Climate-Smart Agriculture_`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Saved Consultations
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Review your past voice diagnoses, verified treatment steps, and organic alternatives.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Voice Diagnosis</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search symptoms, crop diseases, or treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 placeholder-stone-400"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Severities</option>
              <option value="high">High Urgency</option>
              <option value="medium">Moderate</option>
              <option value="low">Mild / Preventive</option>
            </select>
          </div>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-stone-400 shrink-0 font-medium">Filter Crop:</span>
          {allCrops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                selectedCrop === crop
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-4">
              <Sprout className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              No consultations found
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCrop !== "All" || selectedSeverity !== "All"
                ? "Try clearing your filters or search terms."
                : "You haven't conducted any farm consultations yet. Ask Zora for your first voice diagnosis!"}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shadow-sm"
            >
              <span>Ask Zora Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          filteredConsultations.map((item) => {
            const isPlaying = playingId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 md:p-6 shadow-sm hover:border-emerald-500/40 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Crop badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                      <Sprout className="w-3.5 h-3.5" />
                      {item.crop}
                    </span>

                    {/* Severity badge */}
                    {item.severity === "high" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                        <AlertTriangle className="w-3 h-3" />
                        High Urgency
                      </span>
                    )}
                    {item.severity === "medium" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                        <Info className="w-3 h-3" />
                        Moderate
                      </span>
                    )}
                    {item.severity === "low" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Preventive
                      </span>
                    )}

                    {/* Language tag */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-stone-100 dark:bg-stone-800/80 text-stone-500 dark:text-stone-400">
                      <Languages className="w-3 h-3" />
                      {item.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                  </div>
                </div>

                {/* Farmer Question */}
                <div className="bg-stone-50 dark:bg-stone-950/60 rounded-xl p-3.5 border border-stone-200/80 dark:border-stone-800/80">
                  <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-1">
                    Farmer Query:
                  </div>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 italic">
                    "{item.question}"
                  </p>
                </div>

                {/* Diagnosis Header */}
                <div>
                  <div className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                    Identified Diagnosis:
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-stone-900 dark:text-stone-100">
                    {item.diagnosis}
                  </h4>
                </div>

                {/* Simulated Audio Player if available */}
                {item.audioDuration && (
                  <div className="flex items-center justify-between gap-3 bg-stone-50 dark:bg-stone-950 rounded-xl px-4 py-2.5 border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePlay(item.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isPlaying
                            ? "bg-emerald-600 text-white animate-pulse"
                            : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5" />
                        )}
                      </button>
                      <div className="text-xs">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {isPlaying ? "Playing voice response..." : "Voice Advisory Audio"}
                        </span>
                        <span className="text-stone-400 ml-2">({item.audioDuration})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      {isPlaying ? (
                        <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-stone-400" />
                      )}
                      <span className="hidden sm:inline">Audio Synthesized</span>
                    </div>
                  </div>
                )}

                {/* Treatments Grid: Certified vs Low-Cost Organic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Certified Treatment */}
                  <div className="rounded-xl p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      <Pill className="w-3.5 h-3.5" />
                      <span>Certified Agronomic Protocol</span>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                      {item.treatment}
                    </p>
                  </div>

                  {/* Low Cost Alternative */}
                  <div className="rounded-xl p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>Low-Cost Organic Alternative</span>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                      {item.lowCostAlternative}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => handleCopy(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Treatment</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
