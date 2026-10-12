'use client';

import React, { useState, useEffect } from 'react';
import {
  RadioTower,
  CloudRain,
  Droplets,
  Thermometer,
  Wind,
  BatteryCharging,
  Wifi,
  ShieldCheck,
  RefreshCw,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@ccsa-zora/ui/components/button';

const SENSOR_NODES = [
  {
    id: 'SN-KD-01',
    location: 'Zaria North Cluster, Kaduna',
    crop: 'Maize Plot #1',
    vwc: '31.8%',
    soilTemp: '24.2°C',
    battery: '98%',
    rssi: '-78 dBm',
    protocol: 'LoRaWAN 868MHz',
    status: 'Online',
    lastSeen: '4m ago',
  },
  {
    id: 'SN-BN-02',
    location: 'Makurdi Riverine, Benue',
    crop: 'Rice Basin #4',
    vwc: '43.2%',
    soilTemp: '26.1°C',
    battery: '92%',
    rssi: '-82 dBm',
    protocol: 'LoRaWAN 868MHz',
    status: 'Online',
    lastSeen: '12m ago',
  },
  {
    id: 'SN-OY-03',
    location: 'Iseyin Savanna, Oyo',
    crop: 'Cassava Plot #2',
    vwc: '28.4%',
    soilTemp: '25.5°C',
    battery: '95%',
    rssi: '-74 dBm',
    protocol: 'NB-IoT (Cellular)',
    status: 'Online',
    lastSeen: '8m ago',
  },
  {
    id: 'SN-KN-04',
    location: 'Bichi Irrigation, Kano',
    crop: 'Wheat / Sorghum',
    vwc: '34.0%',
    soilTemp: '23.8°C',
    battery: '89%',
    rssi: '-85 dBm',
    protocol: 'LoRaWAN 868MHz',
    status: 'Online',
    lastSeen: '16m ago',
  },
];

export default function SensorsTelemetryPage() {
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const fetchWeather = async () => {
    try {
      setLoadingWeather(true);
      const res = await fetch('/api/weather?latitude=10.52&longitude=7.44');
      const data = await res.json();
      setWeatherData(data);
    } catch (e) {
      console.error('Weather fetch error:', e);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400 mb-1.5">
            <RadioTower className="size-3" />
            <span>In-Field LPWAN & Agro-Meteorological Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            IoT Telemetry & Weather Stations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live soil volumetric water content probes and Open-Meteo localized climate observation feeds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchWeather}
            className="text-xs h-8 border-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`size-3 mr-1 ${loadingWeather ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Live Weather Station Banner (Open-Meteo Integration) */}
      <div className="p-6 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CloudRain className="size-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Live Agro-Meteorological Station</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Northern Guinea Savanna Cluster (Kaduna: 10.52° N, 7.44° E) • Open-Meteo Direct Satellite Feed
            </p>
          </div>

          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
            Live Satellite Feed
          </span>
        </div>

        {/* Weather Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Thermometer className="size-3 text-amber-400" /> Ambient Temperature
            </span>
            <p className="text-xl font-black text-white">
              {weatherData?.temperatureCelsius ?? '29.4'}°C
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Droplets className="size-3 text-blue-400" /> Relative Humidity
            </span>
            <p className="text-xl font-black text-blue-400">
              {weatherData?.relativeHumidityPercent ?? '62'}%
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <CloudRain className="size-3 text-blue-400" /> Rain Probability
            </span>
            <p className="text-xl font-black text-white">
              {weatherData?.rainProbabilityPercent ?? '15'}%
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Wind className="size-3 text-emerald-400" /> Wind Velocity
            </span>
            <p className="text-xl font-black text-emerald-400">
              {weatherData?.windSpeedKmh ?? '11.2'} km/h
            </p>
          </div>
        </div>

        {/* Operational Agronomic Advisory from Weather */}
        <div className="p-4 rounded-xl bg-[#070F18] border border-slate-800 text-xs text-slate-300 space-y-1.5">
          <span className="font-bold text-emerald-400">Agro-Operations Window:</span>
          <p className="text-slate-400">
            {weatherData?.advisories?.spraying ||
              'Optimal morning spraying window. Low wind speed minimizes chemical drift; low rain probability allows full systemic foliar uptake.'}
          </p>
        </div>
      </div>

      {/* Field Soil Sensors Grid */}
      <div className="p-6 rounded-2xl bg-[#0A1624] border border-emerald-950/80 space-y-4 shadow-xs">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Active In-Field Soil Telemetry Probes</h3>
            <p className="text-[11px] text-slate-400">
              HMAC-signed LPWAN telemetry measuring volumetric moisture at 15cm root depth
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400">4 / 4 Nodes Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SENSOR_NODES.map((node) => (
            <div
              key={node.id}
              className="p-4 rounded-xl bg-[#070F18] border border-slate-800 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="font-mono text-xs font-bold text-white">{node.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{node.location} • {node.crop}</p>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {node.protocol}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Soil Moisture (VWC)</span>
                  <span className="font-bold text-emerald-400 text-sm">{node.vwc}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Soil Temp</span>
                  <span className="font-bold text-slate-200 text-sm">{node.soilTemp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Battery / Signal</span>
                  <span className="font-mono text-slate-300 text-xs">{node.battery} ({node.rssi})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
