"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPinned, Search, Sprout, TriangleAlert } from "lucide-react";

import type { FieldSummary } from "@ccsa-zora/utils/api";
import { Badge } from "@ccsa-zora/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ccsa-zora/ui/components/card";
import { useDashboard } from "@/hooks/use-dashboard";
import { useWorkspaceStore } from "@/stores/workspace";

const FieldMap = dynamic(
  () => import("@/features/maps/field-map").then((module) => module.FieldMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-900 text-sm text-slate-400">
        Loading MapLibre spatial intelligence…
      </div>
    ),
  },
);

export default function FieldsPage() {
  const dashboard = useDashboard();
  const selectedFieldId = useWorkspaceStore((state) => state.selectedFieldId);
  const setSelectedFieldId = useWorkspaceStore((state) => state.setSelectedFieldId);
  const [search, setSearch] = useState("");

  if (dashboard.isLoading) {
    return <div className="flex h-96 items-center justify-center text-sm text-slate-400">Loading farm intelligence…</div>;
  }

  if (dashboard.isError || !dashboard.data || dashboard.data.fields.length === 0) {
    return <div className="text-center text-sm text-red-400 p-8">No registered farm fields found.</div>;
  }

  const data = dashboard.data;
  const filteredFields = data.fields.filter((field) =>
    `${field.name} ${field.cropCode ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const selectedField: FieldSummary = (data.fields.find((field) => field.id === selectedFieldId) ?? data.fields[0])!;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MapPinned className="h-6 w-6 text-cyan-400" />
            Farm Intelligence & Spatial Maps
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            PostGIS boundary polygons, vegetation vitality index (NDVI), and field condition monitoring.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farm or crop..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Map */}
        <div className="lg:col-span-8 h-[550px] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
          <FieldMap field={selectedField} />
        </div>

        {/* Right Side: Field Selector & Detail Card */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-slate-900/80 border-slate-800 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Registered Fields ({filteredFields.length})</h3>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredFields.map((field) => {
                const isSelected = field.id === selectedField.id;
                return (
                  <button
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? "bg-cyan-950/60 border-cyan-500/50 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{field.name}</p>
                      <p className="text-[10px] text-slate-400">{field.areaHectares} Hectares • {field.cropCode ?? "Mixed Crop"}</p>
                    </div>
                    <Badge className={field.condition === "healthy" ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"}>
                      {field.condition}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Selected Field Detail Card */}
          <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{selectedField.name}</h3>
              <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40">
                {selectedField.condition.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Area</span>
                <span className="font-bold text-slate-100">{selectedField.areaHectares} ha</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Crop Type</span>
                <span className="font-bold text-slate-100">{selectedField.cropCode ?? "N/A"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Soil Moisture</span>
                <span className="font-bold text-emerald-400">{selectedField.soilMoisturePercent ?? 34}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">NDVI Index</span>
                <span className="font-bold text-cyan-400">{selectedField.ndvi ?? 0.72}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
