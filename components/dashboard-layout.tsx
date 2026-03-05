'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Font setup
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Sidebar links
const sidebarLinks = [
  { name: 'Overview', value: 'overview' },
  { name: 'Energy Grid', value: 'energy' },
  { name: 'Water Levels', value: 'water' },
  { name: 'Waste Logs', value: 'waste' },
];

// Pie chart colors
const pieColors = [
  "#38bdf8", // cyan
  "#10b981", // emerald
  "#64748B", // slate
  "#0EA5E9",
  "#22D3EE",
  "#06B6D4",
];

// Leaderboard for Green Zones
const leaderboard = [
  { medal: '🥇', name: 'Block 2 (Freshman)', score: 92 },
  { medal: '🥈', name: 'Block 1 (ECE)', score: 88 },
  { medal: '🥉', name: 'Block 3 (Auditorium)', score: 75 },
];

// Demo forecast values
const forecast = {
  energy: '+12%',
  water: 'Stable',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!isMounted) return null;

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-2xl md:text-4xl font-bold text-cyan-300 drop-shadow-glow animate-pulse text-center">
          Connecting to GCET Server...
        </div>
      </div>
    );
  }

  const {
    sustainabilityScore,
    weeklyTrend,
    metrics,
    blocks,
    aqi,
    energyRedirection,
    alerts = [],
  } = data;

  // For pie chart: water by block
  const pieData = blocks.map((block: any) => ({
    name: block.name,
    value: block.water,
  }));

  // Mini line (trend) data for sustainability score
  const sustainabilityMiniTrend = [
    { x: 0, y: Math.max((sustainabilityScore ?? 87) - (weeklyTrend ?? 4) - 3, 0) },
    { x: 1, y: Math.max((sustainabilityScore ?? 87) - 2, 0) },
    { x: 2, y: sustainabilityScore ?? 87 },
  ];

  function handleAdminAction(message: string) {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2200);
  }

  function Sidebar({ mobile }: { mobile?: boolean }) {
    return (
      <nav className={
        mobile
          ? "fixed bottom-0 left-0 right-0 flex md:hidden z-40 shadow-md bg-slate-950/95 border-t border-slate-900"
          : "hidden md:flex fixed left-0 top-0 h-screen w-64 bg-slate-950 border-r border-slate-900 flex-col z-30"
      }>
        <div className={mobile ? "hidden" : "flex items-center h-16 px-6 border-b border-slate-900"}>
          <span className="text-xl font-bold text-white tracking-wide select-none">GCET</span>
        </div>
        <ul className={`flex-1 ${mobile ? "flex-row justify-around px-1 py-1" : "flex flex-col px-3 pt-9 pb-6 gap-1"}`}>
          {sidebarLinks.map(link =>
            <li key={link.value} className={mobile ? "flex-1" : ""}>
              <button
                type="button"
                onClick={() => setActiveTab(link.value)}
                className={`w-full flex items-center justify-center md:justify-start px-3 py-2 rounded-md font-medium transition-colors
                  ${activeTab === link.value
                    ? "bg-zinc-900 text-cyan-300 border border-cyan-600 shadow-md"
                    : "text-zinc-300/85 hover:bg-slate-900"}
                `}
              >
                <span className={mobile ? "text-sm font-medium" : ""}>{link.name}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans bg-zinc-950 relative flex flex-col md:flex-row">
      <Sidebar />
      <Sidebar mobile />

      <div className="flex-1 min-h-screen flex flex-col md:pl-64 bg-zinc-950">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-slate-950/95 border-b border-slate-900 h-18 px-4 md:px-10 flex flex-col justify-center shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-1 md:gap-4 py-4">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              GCET Command Center
            </h1>
            <div className="flex flex-col md:flex-row gap-0.5 md:gap-4 items-center">
              <span className="text-[13px] text-green-400 font-mono tracking-wide animate-blink-soft">
                🟢 System Status: Monitoring 7 GCET Zones
              </span>
              <span className="text-[13px] text-cyan-200 font-mono tracking-wide">
                | Last Sync: 10s ago
              </span>
            </div>
          </div>
        </header>

        {/* TOAST / ACTION TRIGGERED */}
        {toast.show &&
          <motion.div
            key={toast.message}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="fixed top-7 left-1/2 z-[100] -translate-x-1/2 bg-emerald-950 text-cyan-100 border border-emerald-600 shadow-glow px-8 py-3 rounded-lg font-medium text-md drop-shadow-xl"
          >
            {toast.message}
          </motion.div>
        }

        {/* Main content area */}
        <main className="flex-1 flex flex-col py-4 md:py-8 px-2 md:px-8 max-w-[100vw]">
          {activeTab === 'overview' ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, type: "spring", damping: 17 }}
              className="flex flex-col gap-7"
            >
              {/* --- TOP ROW: KEY METRICS --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sustainability Score Card */}
                <div className="col-span-1 bg-gradient-to-b from-black/70 via-slate-900 to-zinc-950 border border-accent/60 rounded-2xl shadow-xl p-7 flex flex-col relative overflow-hidden min-h-[142px]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg font-semibold text-cyan-300">Sustainability Score</span>
                  </div>
                  <div className="flex items-center gap-4 h-14">
                    <div className="text-5xl md:text-6xl font-extrabold text-cyan-300 drop-shadow-glow">{sustainabilityScore ?? 87}/100</div>
                    {/* Mini line trend */}
                    <ResponsiveContainer width={80} height={35}>
                      <LineChart data={sustainabilityMiniTrend}>
                        <Line
                          type="monotone"
                          dataKey="y"
                          stroke="#38bdf8"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={weeklyTrend >= 0 ? "text-green-400 font-bold" : 'text-red-400 font-bold'}>
                      ↑ +{weeklyTrend ?? 4}% this week
                    </span>
                  </div>
                </div>

                {/* AQI Tracker */}
                <div className="col-span-1 bg-zinc-900 border border-sky-700/30 rounded-2xl p-7 shadow-lg flex flex-col gap-1 min-h-[142px]">
                  <span className="text-blue-300 font-semibold text-md mb-1">Air Quality Index (AQI)</span>
                  <span className="text-3xl md:text-4xl font-bold text-sky-200 drop-shadow-glow">
                    AQI: {aqi?.value ?? 42}
                  </span>
                  <span className="text-[14px] mt-0.5 font-medium" style={{ color: '#42ffb9' }}>
                    {aqi?.label ?? 'Good Air Quality'}
                  </span>
                </div>

                {/* Energy Saved */}
                <div className="col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-lg flex flex-col gap-1 min-h-[142px]">
                  <span className="text-zinc-300 font-semibold text-md mb-1">Energy Saved</span>
                  <span className="text-3xl md:text-4xl font-bold text-green-300 drop-shadow-glow">
                    {metrics.energySaved}
                  </span>
                  <span className="text-[13px] text-green-200/70">kWh this week</span>
                </div>

                {/* Water Harvested */}
                <div className="col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-7 shadow-lg flex flex-col gap-1 min-h-[142px]">
                  <span className="text-zinc-300 font-semibold text-md mb-1">Water Harvested</span>
                  <span className="text-3xl md:text-4xl font-bold text-emerald-300 drop-shadow-glow">{metrics.waterHarvested}</span>
                  <span className="text-[13px] text-emerald-200/70">liters this week</span>
                </div>
              </div>

              {/* --- ANALYTICS & LEADERBOARD SECTION --- */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Analytics Left - Energy Efficiency & LineChart */}
                <div className="col-span-1 md:col-span-7 flex flex-col gap-6">
                  {/* Energy Efficiency Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08 }}
                    className="bg-gradient-to-b from-slate-900 to-zinc-950 border border-cyan-700/15 rounded-2xl shadow-xl p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-2">
                      <span className="text-cyan-300 font-semibold text-lg">Energy Efficiency</span>
                      <span className="text-sm text-zinc-400 font-mono">Campus Savings Monitor</span>
                    </div>
                    <div className="flex flex-row md:gap-7 gap-4 items-center mb-1 mt-1">
                      <div className="flex flex-col gap-0">
                        <span className="text-md text-zinc-300">Target Savings</span>
                        <span className="text-2xl font-bold text-blue-300">15%</span>
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-md text-zinc-300">Actual Savings</span>
                        <span className="text-2xl font-bold text-emerald-300">{metrics.actualSavings ?? 12}%</span>
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-md text-zinc-300">Energy Wasted</span>
                        <span className="text-2xl font-bold text-rose-300">{metrics.energyWasted ?? 210} kWh</span>
                      </div>
                    </div>
                    {/* Insight Box */}
                    <div className="bg-gradient-to-bl from-[#22d3ee1a] to-[#a7f3d01e] py-2.5 px-4 mt-4 rounded-lg border border-cyan-700/25 font-mono text-sm text-cyan-200 flex items-center gap-2">
                      <span className="font-bold text-cyan-400">Insight:</span> {energyRedirection ?? "Wasted energy could power 142 LED bulbs for 3 days."}
                    </div>
                  </motion.div>
                  {/* Glowing LineChart of energy consumption */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.41, delay: 0.11 }}
                    className="bg-gradient-to-b from-black/60 via-slate-900 to-zinc-950 border border-slate-900/40 rounded-2xl shadow-lg p-6 flex flex-col"
                  >
                    <div className="flex items-center mb-2">
                      <h2 className="text-cyan-200 font-semibold text-lg flex-1">Blockwise Energy Trends</h2>
                    </div>
                    <div className="grow h-[300px] -mt-1.5">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={blocks} margin={{ top: 12, right: 18, left: 0, bottom: 8 }}>
                          <defs>
                            <filter id="glow-energy-premium" x="-40%" y="-40%" width="180%" height="180%">
                              <feDropShadow dx="0" dy="1" stdDeviation="8" floodColor="#a9ffdd" floodOpacity="0.23" />
                              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#31a9a0" floodOpacity="0.13" />
                            </filter>
                          </defs>
                          <CartesianGrid stroke="#222a33" strokeDasharray="3 7" opacity={0.15} />
                          <XAxis dataKey="name" tick={{ fill: "#90e6e6", fontWeight: 500 }} />
                          <YAxis tick={{ fill: "#86efac" }} />
                          <Tooltip
                            contentStyle={{
                              background: "#131819",
                              border: "1px solid #31faab",
                              color: "#9bedc7",
                            }}
                            itemStyle={{ color: "#38bdf8" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="energy"
                            name="Energy (kWh)"
                            stroke="#5cf2c7"
                            strokeWidth={3}
                            dot={{
                              r: 5,
                              fill: "#13292e",
                              stroke: "#38bdf8",
                              strokeWidth: 2,
                              filter: "url(#glow-energy-premium)",
                            }}
                            activeDot={{ r: 10, fill: "#0e7490", stroke: "#5cf2c7", strokeWidth: 4, opacity: 0.41 }}
                            filter="url(#glow-energy-premium)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
                {/* Green Leaderboard */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.13 }}
                  className="col-span-1 md:col-span-5 flex flex-col gap-6">
                  {/* Leaderboard */}
                  <div className="bg-gradient-to-b from-zinc-900 to-slate-950 border border-emerald-700/10 rounded-2xl shadow-xl p-6">
                    <span className="text-lg font-semibold text-emerald-400 mb-2">The Green Leaderboard</span>
                    <ul className="flex flex-col gap-2 mt-2">
                      {leaderboard.map(({ medal, name, score }) => (
                        <li key={name} className="flex gap-2 items-baseline">
                          <span className="text-xl font-bold">{medal}</span>
                          <span className="text-zinc-200 font-mono">{name}</span>
                          <span className={`ml-auto text-sm text-emerald-300 font-semibold`}>
                            {score}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 text-xs text-green-300/70 font-mono">Campus zones ranked by sustainability score</div>
                  </div>
                  {/* Water Usage PieChart */}
                  <div className="bg-gradient-to-b from-zinc-900 via-slate-950 to-slate-900 border border-blue-900/40 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center mb-2">
                      <span className="text-sky-300 font-semibold text-lg flex-1">Block Water Usage</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={68}
                          paddingAngle={4}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, name }) => {
                            if (typeof midAngle !== "number" || typeof innerRadius !== "number" || typeof outerRadius !== "number" || typeof cx !== "number" || typeof cy !== "number") return null;
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 1.22;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#c0e8ff"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="middle"
                                fontSize={12}
                                fontWeight={500}
                              >
                                {name}
                              </text>
                            );
                          }}
                        >
                          {pieData.map((entry: any, idx: number) => (
                            <Cell key={`pcell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "#10171e",
                            border: "1px solid #38e4ec",
                            color: "#38e4ec"
                          }}
                          formatter={(value: any) => [`${value} L`, "Water"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* --- THE BRAIN: AI INSIGHTS & PREDICTIONS --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI Insights Card */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.19 }}
                  className="bg-gradient-to-b from-emerald-900/15 via-slate-900 to-zinc-950 border border-cyan-600/20 rounded-2xl shadow-lg min-h-[220px] p-6 flex flex-col"
                >
                  <div className="text-cyan-300 font-semibold text-lg mb-2 flex items-center gap-1">AI Sustainability Insights</div>
                  <div className="flex flex-col gap-2">
                    {alerts && alerts.length ? (
                      <ul className="max-h-28 overflow-y-auto flex flex-col gap-1 pl-1">
                        {alerts.map((alert: any, idx: number) => (
                          <li key={idx} className="text-yellow-200/90 font-mono text-[15px] flex gap-1 items-center">
                            <span>🟡</span>{alert.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-zinc-400/70 italic text-sm">No alerts today</div>
                    )}
                  </div>
                </motion.div>
                {/* AI Forecast */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.39, delay: 0.21 }}
                  className="bg-zinc-900 border border-emerald-900/60 rounded-2xl shadow-lg min-h-[220px] p-6 flex flex-col items-stretch"
                >
                  <span className="font-semibold text-emerald-200 mb-2 text-lg">AI Forecast</span>
                  <div className="grow flex flex-col justify-center items-start gap-1">
                    <div className="bg-emerald-800/20 px-4 py-2 rounded-xl text-cyan-200 font-mono mb-2">
                      Next Week Forecast &rarr;
                    </div>
                    <div className="flex flex-col gap-1 mt-2 font-mono">
                      <div className="flex gap-2 items-center">
                        ⚡ <span className="font-semibold text-cyan-400">Energy Demand</span>
                        <span className="font-bold text-emerald-300">{forecast.energy}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        💧 <span className="font-semibold text-blue-300">Water</span>
                        <span className="font-bold text-sky-300">{forecast.water}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-green-300/60 mt-3">AI-driven projection, updated daily</div>
                </motion.div>
                {/* Empty for spacing or future use */}
                <div />
              </div>

              {/* --- CONTROL & ROI SECTION --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Admin Control Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.37, delay: 0.23 }}
                  className="bg-gradient-to-br from-zinc-900 via-slate-950 to-black border border-emerald-700/25 rounded-2xl p-6 shadow-lg flex flex-col gap-4"
                >
                  <span className="text-emerald-300 font-bold text-lg mb-2">Admin Control Panel</span>
                  <div className="flex flex-wrap gap-3 mb-2">
                    <button
                      onClick={() => handleAdminAction("Action triggered successfully.")}
                      className="px-5 py-2.5 bg-gradient-to-br from-emerald-700/70 to-cyan-800/60 text-white font-semibold rounded-md shadow-glow border border-emerald-400/40 hover:border-cyan-300/70 transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-cyan-400/60"
                      type="button"
                    >
                      Optimize Block 3 Auditorium HVAC
                    </button>
                    <button
                      onClick={() => handleAdminAction("Action triggered successfully.")}
                      className="px-5 py-2.5 bg-gradient-to-br from-blue-800/70 to-sky-800/60 text-white font-semibold rounded-md shadow-glow border border-blue-400/30 hover:border-cyan-300/70 transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-cyan-400/60"
                      type="button"
                    >
                      Schedule Water Inspection
                    </button>
                    <button
                      onClick={() => handleAdminAction("Action triggered successfully.")}
                      className="px-5 py-2.5 bg-gradient-to-tr from-emerald-500/80 to-cyan-400/60 text-white font-bold rounded-md shadow-lg border-2 border-emerald-400/60 hover:border-cyan-200 focus:ring-2 focus:ring-cyan-400 animate-pulse"
                      type="button"
                    >
                      📄 Generate Monthly Analytics Report
                    </button>
                  </div>
                  <div className="text-xs text-cyan-300/45 mt-2">Actions send secure operations to GCET IoT devices</div>
                </motion.div>
                {/* Projected ROI Impact */}
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.39, delay: 0.27 }}
                  className="bg-gradient-to-br from-zinc-900 via-slate-950 to-slate-900 border border-cyan-700/10 rounded-2xl shadow-lg p-6 flex flex-col gap-3 items-start justify-center"
                >
                  <span className="text-cyan-300 font-bold text-lg mb-1">ROI Impact</span>
                  <div className="text-xl font-bold text-white flex gap-6 items-center mb-2">
                    <span className="flex items-center gap-1">
                      ⚡
                      <span className="text-cyan-300 font-extrabold text-2xl">₹2.3 Lakhs</span>
                    </span>
                    <span className="flex items-center gap-1">
                      💧
                      <span className="text-cyan-300 font-extrabold text-xl">1.1M L</span>
                    </span>
                    <span className="flex items-center gap-1">
                      🌱
                      <span className="text-emerald-300 font-extrabold text-lg">17%</span>
                    </span>
                  </div>
                  <div className="text-xs text-emerald-200/65 font-mono">
                    Energy Savings: ₹2,30,000 <br />
                    Water: 1,100,000 Liters <br />
                    Carbon Reduction: 17%
                  </div>
                </motion.div>
                {/* Empty column for alignment */}
                <div />
              </div>
              <div className="hidden">{children}</div>
            </motion.div>
          ) : (
            // Non-overview: Glowing loading state
            <div className="flex items-center justify-center min-h-[60vh] w-full">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-cyan-400 drop-shadow-glow animate-pulse text-center"
              >
                {activeTab === 'energy' && 'Energy Grid Module Loading...'}
                {activeTab === 'water' && 'Water Levels Module Loading...'}
                {activeTab === 'waste' && 'Waste Logs Module Loading...'}
              </motion.div>
            </div>
          )}
        </main>
        <div className="hidden">{children}</div>
      </div>
      <style jsx global>{`
        html, body, #__next { background: #090e14 !important; }
        @keyframes blink-soft {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.40; }
        }
        .animate-blink-soft { animation: blink-soft 1.3s infinite; }
        .shadow-glow { box-shadow: 0 0 22px 2px #15f3ad30, 0 1px 1px #0002; }
        .drop-shadow-glow { filter: drop-shadow(0 1px 8px #06b6d4ac); }
      `}</style>
    </div>
  );
}
