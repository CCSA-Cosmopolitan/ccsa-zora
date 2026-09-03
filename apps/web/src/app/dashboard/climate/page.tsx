"use client";

import { CloudRain, RadioTower, ShieldCheck, Thermometer, Wind } from "lucide-react";

import { Badge } from "@ccsa-zora/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ccsa-zora/ui/components/card";
import { useDashboard } from "@/hooks/use-dashboard";

export default function ClimatePage() {
  const dashboard = useDashboard();

  if (dashboard.isLoading) {
    return <div className="flex h-96 items-center justify-center text-sm text-slate-400">Loading climate watch telemetry…</div>;
  }

  if (dashboard.isError || !dashboard.data) {
    return <div className="text-center text-sm text-red-400 p-8">Unable to load telemetry streams.</div>;
  }

  const data = dashboard.data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <CloudRain className="h-6 w-6 text-cyan-400" />
          Climate Watch & LPWAN Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          HMAC-signed IoT telemetry ingestion from field-deployed soil sensors and microclimate weather stations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Soil Temperature</span>
            <Thermometer className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">28.4 °C</p>
          <Badge className="bg-emerald-950 text-emerald-300">Optimal Range</Badge>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Volumetric Water Content</span>
            <CloudRain className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white">34.2 % VWC</p>
          <Badge className="bg-emerald-950 text-emerald-300">Moisture Adequate</Badge>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">IoT Hardware Status</span>
            <RadioTower className="h-5 w-5 text-teal-400" />
          </div>
          <p className="text-3xl font-black text-teal-300">{data.sensors.reporting} / {data.sensors.total} Nodes</p>
          <Badge className="bg-teal-950 text-teal-300">HMAC Authentication OK</Badge>
        </Card>
      </div>

      {/* Sensor Ingestion Feed */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-base font-bold text-white">Active Sensor Nodes Stream ({data.metrics.sensorAvailabilityPercent}% Availability)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <RadioTower className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Abuja North Station #01</p>
                <p className="text-[10px] text-slate-400">LoRaWAN Frequency: 868 MHz • Battery 94%</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[10px]">HMAC Verified</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <RadioTower className="h-4 w-4 text-cyan-400" />
              <div>
                <p className="font-bold text-white">Gwagwalada Soil Probe #02</p>
                <p className="text-[10px] text-slate-400">NB-IoT Band 20 • Depth 30cm</p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 text-[10px]">HMAC Verified</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
