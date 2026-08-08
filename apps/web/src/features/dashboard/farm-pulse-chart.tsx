"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const pulse = [
  { day: "Mon", vegetation: 64, moisture: 34 },
  { day: "Tue", vegetation: 66, moisture: 32 },
  { day: "Wed", vegetation: 67, moisture: 29 },
  { day: "Thu", vegetation: 65, moisture: 27 },
  { day: "Fri", vegetation: 68, moisture: 36 },
  { day: "Sat", vegetation: 70, moisture: 39 },
  { day: "Sun", vegetation: 72, moisture: 37 },
];

export function FarmPulseChart() {
  return (
    <div className="h-[230px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={pulse} margin={{ left: -24, right: 8, top: 12 }}>
          <defs>
            <linearGradient id="vegetationFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#158449" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#158449" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="moistureFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#e5aa20" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#e5aa20" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#dbe5dd" strokeDasharray="3 5" vertical={false} />
          <XAxis axisLine={false} dataKey="day" fontSize={11} tickLine={false} />
          <YAxis axisLine={false} domain={[0, 100]} fontSize={10} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#063d2a",
              border: 0,
              borderRadius: 12,
              color: "#fff",
              fontSize: 12,
            }}
            cursor={{ stroke: "#9eb7a5", strokeDasharray: "4 4" }}
          />
          <Area
            dataKey="vegetation"
            fill="url(#vegetationFill)"
            name="Vegetation index"
            stroke="#158449"
            strokeWidth={2.5}
            type="monotone"
          />
          <Area
            dataKey="moisture"
            fill="url(#moistureFill)"
            name="Soil moisture"
            stroke="#d49a16"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
