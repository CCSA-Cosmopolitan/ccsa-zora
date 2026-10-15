"use client";

import React, { useState } from "react";
import {
  Sprout,
  MapPin,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  Save,
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";

interface CropOption {
  id: string;
  name: string;
  botanical: string;
  season: string;
  commonPests: string;
  iconBg: string;
}

const AVAILABLE_CROPS: CropOption[] = [
  {
    id: "Maize",
    name: "Maize (Masara / Ọ̀gbàdò / Ọ́ka)",
    botanical: "Zea mays",
    season: "Early & Late Rain",
    commonPests: "Fall Armyworm, Stem Borer, Striga",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "Cassava",
    name: "Cassava (Rogo / Gbáàdùkẹ́ / Akpụ)",
    botanical: "Manihot esculenta",
    season: "Perennial / Rainfed",
    commonPests: "Mosaic Virus (CMD), Green Mite, Mealybug",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "Rice",
    name: "Rice (Shinkafa / Ìrẹsì / Osikapa)",
    botanical: "Oryza sativa",
    season: "Lowland & Upland Rainfed",
    commonPests: "Rice Blast, Gall Midge, Brown Planthopper",
    iconBg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  },
  {
    id: "Cowpea",
    name: "Cowpea / Beans (Wake / Ẹ̀wà / Agwa)",
    botanical: "Vigna unguiculata",
    season: "Late Rain / Post-Rain",
    commonPests: "Maruca Pod Borer, Aphids, Thrips",
    iconBg: "bg-stone-500/10 text-stone-600 dark:text-stone-300 border-stone-500/20",
  },
  {
    id: "Sorghum",
    name: "Sorghum / Guinea Corn (Dawa / Ọkà Bàbà)",
    botanical: "Sorghum bicolor",
    season: "Savanna Dry / Rainfed",
    commonPests: "Shoot Fly, Head Bug, Striga Asiatica",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  {
    id: "Tomato",
    name: "Tomato (Tumatur / Tòmáatò)",
    botanical: "Solanum lycopersicum",
    season: "Dry Season Irrigation / Rainy",
    commonPests: "Tuta absoluta, Early Blight, Bacterial Wilt",
    iconBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  {
    id: "Yam",
    name: "Yam (Doya / Iṣu / Ji)",
    botanical: "Dioscorea rotundata",
    season: "Mound Planting Rainfed",
    commonPests: "Yam Nematode, Anthracnose, Beetles",
    iconBg: "bg-amber-600/10 text-amber-700 dark:text-amber-500 border-amber-600/20",
  },
  {
    id: "Millet",
    name: "Pearl Millet (Gero / Maiwa)",
    botanical: "Pennisetum glaucum",
    season: "Sahelian & Sudan Savanna",
    commonPests: "Downy Mildew, Head Miner, Smut",
    iconBg: "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/20",
  },
];

const SAVANNA_REGIONS = [
  {
    name: "Kaduna (Northern Guinea Savanna)",
    temp: "28°C",
    humidity: "62%",
    wind: "8 km/h",
    rainRisk: "10% (Low)",
    sprayAdvice: "Optimal spray window: Morning 6:30 AM – 10:30 AM before convective heat rises.",
  },
  {
    name: "Kano (Sudan Savanna)",
    temp: "32°C",
    humidity: "38%",
    wind: "12 km/h",
    rainRisk: "5% (Minimal)",
    sprayAdvice: "High evaporation rates. Spray late afternoon (5:00 PM) to avoid leaf scorch.",
  },
  {
    name: "Benue (Southern Guinea Savanna)",
    temp: "29°C",
    humidity: "74%",
    wind: "6 km/h",
    rainRisk: "35% (Moderate)",
    sprayAdvice: "Ensure 4 rain-free hours after application before applying systemic fungicides.",
  },
  {
    name: "Oyo / Osun (Derived Savanna)",
    temp: "27°C",
    humidity: "78%",
    wind: "7 km/h",
    rainRisk: "40% (Rain expected evening)",
    sprayAdvice: "Delay spraying foliar fertilizer until tomorrow morning post-shower.",
  },
  {
    name: "FCT Abuja (Middle Belt Transition)",
    temp: "29°C",
    humidity: "65%",
    wind: "9 km/h",
    rainRisk: "15% (Low)",
    sprayAdvice: "Favorable spraying conditions all day. Soil moisture adequate for nutrient uptake.",
  },
];

export default function FarmProfilePage() {
  const { selectedCrops, setSelectedCrops, selectedState, setSelectedState } = useWorkspace();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [soilType, setSoilType] = useState("Sandy-Loam (Savanna Alfisol)");
  const [irrigation, setIrrigation] = useState("Rainfed with supplemental solar pump");

  const currentRegionData =
    SAVANNA_REGIONS.find((r) => r.name === selectedState) || SAVANNA_REGIONS[0]!;

  function toggleCrop(cropName: string) {
    if (selectedCrops.includes(cropName)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== cropName));
      }
    } else {
      setSelectedCrops([...selectedCrops, cropName]);
    }
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Sprout className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              My Farm & Crops Context
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Zora customizes diagnosis and pesticide thresholds automatically based on your active crops and regional agro-zone.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all self-start md:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Farm Profile</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>
            Farm profile saved! Future voice queries to Zora will automatically prioritize your selected crops and local climate.
          </span>
        </div>
      )}

      {/* Grid: 1. Agro-Zone & Climate Advisory, 2. Soil & Farm Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Region Selector + Live Savanna Weather */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                  Agro-Ecological Savanna Zone
                </h3>
              </div>
              <span className="text-xs text-stone-400">CCSA Meteorological Feed</span>
            </div>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-sm font-medium bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {SAVANNA_REGIONS.map((reg) => (
                <option key={reg.name} value={reg.name}>
                  {reg.name}
                </option>
              ))}
            </select>

            {/* Weather & Spray Indicator Box */}
            <div className="bg-stone-50 dark:bg-stone-950/70 rounded-xl p-4 border border-stone-200 dark:border-stone-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400">Temperature</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {currentRegionData.temp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400">Humidity</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {currentRegionData.humidity}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400">Wind Speed</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {currentRegionData.wind}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400">Rain Risk</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {currentRegionData.rainRisk}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advisory Callout */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Spray Window Advisory:</strong> {currentRegionData.sprayAdvice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Soil & Irrigation Specs */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
              Plot Characteristics
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                  Dominant Soil Texture
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Sandy-Loam (Savanna Alfisol)">Sandy-Loam (Savanna Alfisol)</option>
                  <option value="Clay-Loam (Fadama Lowland)">Clay-Loam (Fadama Lowland)</option>
                  <option value="Ferruginous Red Savanna Soil">Ferruginous Red Savanna Soil</option>
                  <option value="Silty Alluvial (River Basin)">Silty Alluvial (River Basin)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-stone-500 dark:text-stone-400 mb-1 block">
                  Water & Irrigation
                </label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  className="w-full text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Rainfed with supplemental solar pump">
                    Rainfed with supplemental solar pump
                  </option>
                  <option value="100% Rainfed (Savanna Monsoon)">
                    100% Rainfed (Savanna Monsoon)
                  </option>
                  <option value="Solar Drip Irrigation System">
                    Solar Drip Irrigation System
                  </option>
                  <option value="Furrow / River Canal Irrigation">
                    Furrow / River Canal Irrigation
                  </option>
                </select>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                <Info className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                These parameters help Zora advise on proper fertilizer dosage (urea split-applications) and prevent leaching.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crops Selection Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Active Farm Crops
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select all crops you currently cultivate. Zora loads localized pest models for your active crops.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {selectedCrops.length} Active Crops
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AVAILABLE_CROPS.map((crop) => {
            const isSelected = selectedCrops.includes(crop.id);
            return (
              <div
                key={crop.id}
                onClick={() => toggleCrop(crop.id)}
                className={`relative rounded-2xl border p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-white dark:bg-stone-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                    : "bg-white/60 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2.5 rounded-xl border ${crop.iconBg}`}>
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "border border-stone-300 dark:border-stone-700"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {crop.name.split(" ")[0]}
                  </h4>
                  <p className="text-[11px] text-stone-400 italic font-serif">
                    {crop.botanical}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1 text-[11px]">
                  <div className="text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Pests:</span>{" "}
                    {crop.commonPests}
                  </div>
                  <div className="text-stone-400">
                    <span className="font-semibold text-stone-600 dark:text-stone-400">Cycle:</span>{" "}
                    {crop.season}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
