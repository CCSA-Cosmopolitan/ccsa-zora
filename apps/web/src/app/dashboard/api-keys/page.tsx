"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Globe,
  Trash2,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { useWorkspace, ApiKeyItem } from "@/context/workspace-context";

export default function ApiKeysPage() {
  const { apiKeys, generateApiKey, revokeApiKey, enterpriseName } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const fullSecret = generateApiKey(newKeyName.trim());
    setNewlyCreatedKey(fullSecret);
    setNewKeyName("");
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const sampleSnippet = `curl -X POST https://api.zora.ccsa.edu.ng/v1/diagnose \\
  -H "Authorization: Bearer sk_live_your_api_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "crop": "Maize",
    "language": "ha",
    "audio_url": "https://cdn.example.ng/farmer_voice_01.ogg"
  }'`;

  function copyCodeSnippet() {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <KeyRound className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              API Keys & Integrations
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Deploy Zora AI as a Service across WhatsApp, USSD feature-phone gateways, or custom mobile scouting apps for {enterpriseName}.
          </p>
        </div>

        <button
          onClick={() => {
            setNewlyCreatedKey(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      {/* Integration Channels Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
            WhatsApp Voice Bot
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Connect your cooperative number. Member farmers send voice notes and get instant Hausa/Yoruba/Igbo diagnosis audio.
          </p>
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Active webhook ready
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
            USSD & SMS Gateway
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Deploy shortcodes (e.g. *384*77#) to reach rural farmers using 2G button phones without internet connectivity.
          </p>
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            Telco API enabled
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
            ERP & Outgrower Apps
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Query Zora disease models directly from your cooperative outgrower management system or field tablet app.
          </p>
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            REST API v1
          </div>
        </div>
      </div>

      {/* Active API Keys Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              Active Enterprise API Keys
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Keys authenticate integration channels against your cooperative token bank.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
            {apiKeys.length} Keys Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Key Name & Channel</th>
                <th className="px-4 py-3.5">Token Prefix</th>
                <th className="px-4 py-3.5">Rate Limit</th>
                <th className="px-4 py-3.5">Created</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {apiKeys.map((k) => (
                <tr
                  key={k.id}
                  className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition-colors"
                >
                  <td className="px-5 py-4 font-semibold text-stone-900 dark:text-stone-100 text-xs">
                    {k.name}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-stone-600 dark:text-stone-300">
                    {k.keyPrefix}
                  </td>
                  <td className="px-4 py-4 text-xs text-stone-500 dark:text-stone-400">
                    {k.rateLimit}
                  </td>
                  <td className="px-4 py-4 text-xs text-stone-400">{k.createdDate}</td>
                  <td className="px-4 py-4 text-xs text-stone-400">{k.lastUsedDate}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        k.status === "Active"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {k.status === "Active" ? (
                      <button
                        onClick={() => revokeApiKey(k.id)}
                        className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                        title="Revoke Key"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Revoked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer API Documentation & Curl snippet */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Quickstart HTTP Request
            </h3>
          </div>
          <button
            onClick={copyCodeSnippet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
          >
            {copiedSnippet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Curl</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-stone-950 text-stone-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-stone-800">
          <code>{sampleSnippet}</code>
        </pre>
      </div>

      {/* Generate Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Generate Enterprise API Key
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Create a secure token for external apps or bot integrations.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1"
              >
                ✕
              </button>
            </div>

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Make sure to copy your API key now. You will not be able to see it again!
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-emerald-400 break-all select-all">
                    {newlyCreatedKey}
                  </span>
                  <button
                    onClick={() => handleCopy(newlyCreatedKey, "modal-key")}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 shrink-0 transition-colors"
                  >
                    {copiedKey === "modal-key" ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 mb-1.5 block">
                    Integration Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jigawa Extension WhatsApp Bot"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full text-sm bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    Generate Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
