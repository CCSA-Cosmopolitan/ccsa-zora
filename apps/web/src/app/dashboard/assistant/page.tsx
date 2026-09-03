"use client";

import { ZoraAssistant } from "@/features/assistant/zora-assistant";
import { useDashboard } from "@/hooks/use-dashboard";

export default function AssistantPage() {
  const dashboard = useDashboard();
  const fields = dashboard.data?.fields ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Ask Zora Digital Extension AI</h1>
        <p className="text-xs text-slate-400 mt-1">
          Multilingual voice and speech advisory tailored for smallholder farmers and extension officers.
        </p>
      </div>

      <ZoraAssistant fields={fields} />
    </div>
  );
}
