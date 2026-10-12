'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  MapPinned,
  Leaf,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Droplet,
  Sun,
  Activity,
} from 'lucide-react';
import { Button } from '@ccsa-zora/ui/components/button';
import { demoFields } from '@/server/demo-data';

const FieldMap = dynamic(
  () => import('@/features/maps/field-map').then((module) => module.FieldMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-80 items-center justify-center bg-slate-900/60 text-xs text-slate-400">
        Loading MapLibre Geospatial Field Visualizer…
      </div>
    ),
  },
);

export default function GeospatialFieldsPage() {
  const [selectedField, setSelectedField] = useState(demoFields[0]!);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');

  const filteredFields = demoFields.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.cropCode?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());
    const matchesCondition = filterCondition === 'all' || f.condition === filterCondition;
    return matchesSearch && matchesCondition;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400 mb-1.5">
            <MapPinned className="size-3" />
            <span>PostGIS Demarcated Field Registry</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Geospatial Field Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time boundary polygon telemetry, vegetative health (NDVI), and soil moisture indices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-xl shadow-xs">
            <Link href="/dashboard/playground">
              Run Advisory for Field <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Layout: Field List & Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Field List & Filters (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-3 shadow-xs">
            <div className="relative">
              <Search className="size-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search farm name or crop (Maize, Rice...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-800 bg-[#070F18] text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-1.5 text-xs">
              {['all', 'healthy', 'inspect', 'water_stress'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => setFilterCondition(cond)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                    filterCondition === cond
                      ? 'bg-emerald-950 border border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cond.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Fields Cards */}
          <div className="space-y-2.5">
            {filteredFields.map((field) => {
              const isSelected = selectedField.id === field.id;
              return (
                <div
                  key={field.id}
                  onClick={() => setSelectedField(field)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-xs'
                      : 'bg-[#0A1624] border-emerald-950/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-bold text-white">{field.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {field.cropCode} • {field.areaHectares} Hectares
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        field.condition === 'healthy'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {field.condition.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Leaf className="size-3 text-emerald-400" />
                      NDVI: <strong className="text-white">{field.ndvi ?? '0.74'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplet className="size-3 text-blue-400" />
                      Soil Moisture: <strong className="text-white">{field.soilMoisturePercent}%</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Map & Detailed Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Interactive Map Box */}
          <div className="rounded-2xl border border-emerald-950/80 overflow-hidden bg-[#0A1624] shadow-xs">
            <div className="p-3 border-b border-emerald-950/80 flex justify-between items-center bg-[#08121E]">
              <div className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-white">{selectedField.name}</span>
                <span className="text-slate-400 text-[11px]">({selectedField.cropCode})</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                PostGIS MultiPolygon Demarcated
              </span>
            </div>

            <div className="h-80 w-full relative">
              <FieldMap field={selectedField} />
            </div>
          </div>

          {/* Field Telemetry Detail Card */}
          <div className="p-5 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Field Telemetry & Practice Attestation
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400">Acreage</span>
                <p className="font-bold text-white text-sm">{selectedField.areaHectares} ha</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400">Vegetation (NDVI)</span>
                <p className="font-bold text-emerald-400 text-sm">{selectedField.ndvi ?? '0.74'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400">Volumetric Water</span>
                <p className="font-bold text-blue-400 text-sm">{selectedField.soilMoisturePercent}%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400">Observation</span>
                <p className="font-bold text-slate-200 text-sm">20m ago</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 rounded-xl shadow-xs">
                <Link href="/dashboard/playground">
                  Open in Diagnostic Playground <ArrowRight className="size-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
