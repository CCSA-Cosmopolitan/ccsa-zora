'use client';

import React, { useState } from 'react';
import {
  BrainCircuit,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Code2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@ccsa-zora/ui/components/button';

const MODEL_REGISTRY = [
  {
    id: 'kgml-soc-v1',
    name: 'KGML-Ag Soil Carbon Sequestration Model',
    version: '1.0.0-reference',
    status: 'Production Active',
    type: 'Biophysical + Machine Learning Hybrid',
    description:
      'Estimates soil organic carbon (SOC) changes by fusing satellite NDVI telemetry, soil bulk density, and tillage practices grounded in RothC soil dynamics.',
    latency: '85ms avg',
    accuracy: '94.8% R²',
    endpoint: '/v1/kgml/inferences',
    inputs: ['bulkDensityGramsCm3', 'baselineSocPercent', 'coverCrop', 'reducedTillage', 'samplingDepthCm'],
  },
  {
    id: 'kgml-advisory-v1',
    name: 'Multilingual Agronomic Diagnostic & Climate Engine',
    version: '1.2.0-prod',
    status: 'Production Active',
    type: 'Knowledge Graph + NLP Grounding',
    description:
      'Diagnoses foliar pathology, nutrient deficits, and pest attacks while integrating real-time Open-Meteo precipitation thresholds into 5 localized Nigerian languages.',
    latency: '118ms avg',
    accuracy: '96.2% Precision',
    endpoint: '/v1/advisories',
    inputs: ['cropCode', 'observedSymptoms', 'language (en/ha/yo/ig/ff)', 'latitude', 'longitude'],
  },
  {
    id: 'crop-disease-vit-v1',
    name: 'Vision Transformer Foliar Disease Classifier',
    version: '1.1.4-edge',
    status: 'Active (Staged)',
    type: 'Vision Transformer (ViT-Small / 16)',
    description:
      'Classifies Fall Armyworm feeding lesions, Maize Streak Virus, and Cassava Mosaic Disease from in-field camera photographs captured by mobile extension agents.',
    latency: '142ms avg',
    accuracy: '92.4% Top-1',
    endpoint: '/v1/scout/diagnose',
    inputs: ['imageBinary (JPEG/PNG)', 'deviceSha256Hash', 'cropContext'],
  },
];

export default function ModelRegistryPage() {
  const [selectedModel, setSelectedModel] = useState<typeof MODEL_REGISTRY[0]>(MODEL_REGISTRY[1]!);
  const [copied, setCopied] = useState(false);

  const sampleSnippet = `curl -X POST "http://127.0.0.1:8100${selectedModel.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-zora-service-key: demo-service-key" \\
  -d '{
    "organization_id": "00000000-0000-4000-8000-000000000001",
    "language": "ha",
    "message": "Maize leaves turning yellow with irregular chlorotic spots"
  }'`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400 mb-1.5">
            <BrainCircuit className="size-3" />
            <span>AI Model Registry & Knowledge Grounding</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Model Registry & KGML-Ag Specifications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Versioned biophysical machine learning models, inference latency benchmarks, and schema contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-xl shadow-xs">
            <a href="http://127.0.0.1:8100/docs" target="_blank" rel="noopener noreferrer">
              FastAPI OpenAPI Docs <ExternalLink className="size-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODEL_REGISTRY.map((model) => {
          const isSelected = selectedModel.id === model.id;
          return (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-xs'
                  : 'bg-[#0A1624] border-emerald-950/80 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-emerald-400">{model.id}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {model.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{model.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{model.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Latency: <strong className="text-slate-200">{model.latency}</strong></span>
                <span>Bench: <strong className="text-emerald-400">{model.accuracy}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Model Deep Dive & Developer Integration */}
      <div className="p-6 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">{selectedModel.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Version: {selectedModel.version} • Endpoint: {selectedModel.endpoint}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
              {selectedModel.type}
            </span>
          </div>
        </div>

        {/* Input Parameters Schema */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Validated Input Parameters
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedModel.inputs.map((param) => (
              <span
                key={param}
                className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#070F18] border border-slate-800 text-slate-300"
              >
                {param}
              </span>
            ))}
          </div>
        </div>

        {/* Live cURL Snippet */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">Run Inference Programmatically</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-sans text-xs"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span>{copied ? 'Copied' : 'Copy cURL'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-[#05080E] border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
            {sampleSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
