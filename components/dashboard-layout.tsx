'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { FaLeaf } from "react-icons/fa6"; // For CO2 stat card

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

// Minimal, premium color palette
const rechartsColors = {
  energy: '#5be2b1',    // muted premium emerald
  water: '#59b5e0',     // calm cyan
  contrast: '#b7bccf',  // soft slate
  fill1: '#18212B',     // chart fill dark
  fill2: '#212c39',     // chart fill lighter
  leaf: "#7bedaf",
  green: "#34d399",
};
const pieColors = [
  '#53ceb7',
  '#4a98c2',
  '#546881',
  '#b7bccf',
];

// Leaderboard (leave as-premium, but keep muted)
// Block 4 will be clickable with drilldown
const leaderboardData = [
  { medal: '🥇', name: 'Block 2 (Freshman)', score: 92, drilldown: { hvac: 36, lighting: 36, plug: 28 } },
  { medal: '🥈', name: 'Block 1 (ECE)', score: 88, drilldown: { hvac: 40, lighting: 44, plug: 16 } },
  { medal: '🥉', name: 'Block 3 (Auditorium)', score: 75, drilldown: { hvac: 60, lighting: 32, plug: 8 } },
  { medal: '',   name: 'Block 4 (Auditorium)', score: 68, drilldown: { hvac: 78, lighting: 12, plug: 10 } },
  { medal: '',   name: 'Block 5 (AI Labs)', score: 61, drilldown: { hvac: 50, lighting: 15, plug: 35 } },
];

// Add "CO2 Emissions Prevented" for stats card, hardcoded for now.
const CO2_METRIC = {
  value: "4.2 Tons",
  subtext: "Equivalent to planting 150 trees this month"
};

const CO2_ICON = (
  <FaLeaf className="inline align-sub text-green-300 mr-1 mb-0.5" size={19} />
);

const forecast = {
  energy: '+12%',
  water: 'Stable',
};

function getBlockNumberAndType(name: string) {
  // e.g., "Block 4 (Auditorium)" => { number: 4, type: Auditorium }
  const match = name.match(/Block\s*(\d+)\s*\((.+)\)/);
  if (!match) return { number: null, type: null };
  return { number: Number(match[1]), type: match[2] };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Live demo: chartData and HVAC optimization button state
  const [chartData, setChartData] = useState<any[]>([]);
  const [isOptimized, setIsOptimized] = useState(false);

  // Modal for leaderboard drilldown
  const [leaderModal, setLeaderModal] = useState<null | { name: string; drilldown: { hvac: number, lighting: number, plug: number } }>(null);

  // Alerts - for live dynamic 'terminal' and AI Alert resolution.
  const [alerts, setAlerts] = useState<any[]>([]);

  // Track whether "Optimize Block 4" alert was resolved, for correct terminal UI.
  const [block4Resolved, setBlock4Resolved] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch and initialize
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setChartData(json.blocks);
        // Set initial alerts - see if block 4 (HVAC) warning is present
        if (json.alerts) setAlerts(json.alerts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Keep in sync if data is refetched
  useEffect(() => {
    if (data) {
      // If block 4 warning alert present & not yet resolved, remember that state
      const foundBlock4 =
        ((data.alerts || []).find((a: any) =>
          String(a.message).toLowerCase().includes('hvac left running') &&
          String(a.message).toLowerCase().includes('block 4')
        ) !== undefined;
      setBlock4Resolved(!foundBlock4 && isOptimized);
      setChartData(data.blocks);
      setAlerts(data.alerts || []);
    }
    // eslint-disable-next-line
  }, [data]);

  // 'Live' data simulation heartbeat every 3s
  useEffect(() => {
    if (!chartData.length) return;
    const interval = setInterval(() => {
      // Only randomize a little, and don't bust the optimized Block 4 value!
      setChartData(current =>
        current.map((block) => {
          // Don't touch Block 4 energy if already optimized to keep that drop
          if (block.name === "Block 4 (Auditorium)" && isOptimized) return { ...block };
          // Only energy and water fluctuate, keep everything else stable.
          let deltaE = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 5)); // 1-5 up/down
          let deltaW = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 4)); // 1-4 up/down
          // Clamp minimum at a sensible floor (no negatives)
          return {
            ...block,
            energy: Math.max(0, block.energy + deltaE),
            water: Math.max(0, block.water + deltaW)
          };
        }));
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [chartData, isOptimized]);

  if (!isMounted) return null;
  if (loading || !data || !chartData.length) {
    // Minimalist loader, no neon, no shadow
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-2xl md:text-4xl font-semibold text-zinc-300 animate-pulse text-center font-sans">
          Connecting to GCET Server…
        </div>
      </div>
    );
  }

  // DATA STRUCTURE
  const {
    sustainabilityScore,
    weeklyTrend,
    metrics,
    aqi,
    energyRedirection,
  } = data;

  // Pie for water (by block)
  const pieData = chartData.map((block: any) => ({
    name: block.name,
    value: block.water,
  }));

  // Minimal trend for sustainability
  const sustainabilityMiniTrend = [
    { x: 0, y: Math.max((sustainabilityScore ?? 87) - (weeklyTrend ?? 4) - 3, 0) },
    { x: 1, y: Math.max((sustainabilityScore ?? 87) - 2, 0) },
    { x: 2, y: sustainabilityScore ?? 87 },
  ];

  // HVAC optimization: fake data mutation, toast, alert resolution
  function handleOptimizeBlock4() {
    setToast({ show: true, message: "HVAC optimized. Power dropping..." });
    setChartData(chartData =>
      chartData.map(block =>
        block.name === "Block 4 (Auditorium)"
          ? { ...block, energy: Math.round(block.energy * 0.6) }
          : block
      )
    );
    setIsOptimized(true);

    // AI Alert terminal auto-resolve
    setAlerts(prevAlerts => {
      // Find and remove existing Block 4 warning
      let newAlerts = prevAlerts.filter((a: any) =>
        !(
          String(a.message).toLowerCase().includes('hvac left running') &&
          String(a.message).toLowerCase().includes('block 4')
        )
      );
      // Now add the "RESOLVED" at the top
      newAlerts = [
        {
          type: 'RESOLVED',
          message: "AI overridden HVAC controls. Power stabilized.",
          timestamp: Date.now()
        },
        ...newAlerts
      ];
      return newAlerts;
    });
    setBlock4Resolved(true);

    setTimeout(() => setToast({ show: false, message: '' }), 2200);
  }

  // Minimal toast
  function showToast(message: string, duration = 1900) {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), duration);
  }

  // Modal drilldown: handles both open & close
  function LeaderboardDrilldown({ open, onClose, name, drilldown }: { open: boolean; onClose: () => void; name: string, drilldown: { hvac: number, lighting: number, plug: number } }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-zinc-900/90 rounded-2xl border border-zinc-800 min-w-[300px] max-w-full max-w-xs mx-3 p-8 relative overflow-hidden"
        >
          <button
            className="absolute top-3 right-4 text-zinc-500 hover:text-white p-1 rounded transition focus:outline-none"
            aria-label="Close"
            onClick={onClose}
            tabIndex={0}
          >
            ×
          </button>
          <div className="text-lg font-semibold text-white mb-3">{name} Breakdown</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <span>HVAC</span>
              <span className="font-bold text-white">{drilldown.hvac}%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Lighting</span>
              <span className="font-bold text-white">{drilldown.lighting}%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Plug Loads</span>
              <span className="font-bold text-white">{drilldown.plug}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  function Sidebar({ mobile }: { mobile?: boolean }) {
    return (
      <nav className={
        mobile
          ? "fixed bottom-0 left-0 right-0 flex md:hidden z-40 bg-black/95 border-t border-zinc-900"
          : "hidden md:flex fixed left-0 top-0 h-screen w-56 bg-black border-r border-zinc-900 flex-col z-30"
      }>
        <div className={mobile ? "hidden" : "flex items-center h-16 px-6 border-b border-zinc-900"}>
          <span className="text-lg font-semibold text-white tracking-wide select-none">GCET</span>
        </div>
        <ul className={`flex-1 ${mobile ? "flex-row justify-around px-1 py-1" : "flex flex-col px-2 pt-7 pb-6 gap-1"}`}>
          {sidebarLinks.map(link =>
            <li key={link.value} className={mobile ? "flex-1" : ""}>
              <button
                type="button"
                onClick={() => setActiveTab(link.value)}
                className={`w-full flex items-center justify-center md:justify-start px-3 py-2 rounded-md font-medium transition
                  ${activeTab === link.value
                    ? "bg-zinc-900/50 text-white border border-zinc-700"
                    : "text-zinc-400 hover:bg-zinc-900/40 transition"}
                `}
                style={{ fontWeight: 500, letterSpacing: '0.01em' }}
              >
                <span className={mobile ? "text-sm font-medium" : ""}>{link.name}</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    );
  }

  // -------- TABS ---------
  // Full-width minimalist AreaChart for Energy tab
  function EnergyTab() {
    // Get campus average for insight (excluding Block 5 for less skew? We'll use all for demo)
    const avg =
      chartData.length
        ? Math.round(chartData.reduce((sum, b) => sum + b.energy, 0) / chartData.length)
        : 1;
    const block5 =
      chartData.find(block => block.name.includes("Block 5")) || { energy: avg * 3, name: "Block 5 (AI Labs)" };
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.43 }}
        className="w-full"
      >
        <div className="flex flex-col md:flex-row justify-between items-end mt-3 mb-8">
          <div className="text-xl md:text-2xl font-semibold text-white tracking-tight">Campus Energy vs Water</div>
        </div>
        <div className="w-full h-[404px] bg-zinc-900/50 border border-zinc-800 rounded-2xl p-0.5 md:p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 28, right: 36, left: 16, bottom: 8 }}
            >
              <defs>
                <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor={rechartsColors.energy} stopOpacity={0.19} />
                  <stop offset="100%" stopColor={rechartsColors.fill1} stopOpacity={0.00} />
                </linearGradient>
                <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="15%" stopColor={rechartsColors.water} stopOpacity={0.13} />
                  <stop offset="95%" stopColor={rechartsColors.fill2} stopOpacity={0.00} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#242a33" strokeDasharray="3 4" opacity={0.09} />
              <XAxis dataKey="name" tick={{ fill: "#b7bccf", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis orientation="left" yAxisId="energy" tick={{ fill: "#33ecce", fontSize: 13 }} axisLine={false} tickLine={false} label={{ value: "Energy (kWh)", angle: -90, fill:"#b7bccf", dx:-10, position:"insideLeft" }} />
              <YAxis orientation="right" yAxisId="water" tick={{ fill: "#59b5e0", fontSize: 13 }} axisLine={false} tickLine={false} label={{ value: "Water (L)", angle: 90, fill:"#b7bccf", dx: 15, position:"insideRight" }} />
              <Tooltip
                wrapperStyle={{ border: 'none', borderRadius: 8, boxShadow: '0 2px 4px #1112', background: 'none' }}
                contentStyle={{ background: '#131518', border: '1px solid #232832', color: '#fff', borderRadius: 8, fontSize: 15 }}
                labelStyle={{ color: '#b7bccf', fontWeight: 600, border: 0 }}
              />
              <Area
                yAxisId="energy"
                type="monotone"
                dataKey="energy"
                name="Energy (kWh)"
                stroke={rechartsColors.energy}
                fill="url(#energyFill)"
                strokeWidth={3}
                dot={{ r: 5, fill: rechartsColors.fill1, stroke: rechartsColors.energy, strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#1A2E2D', stroke: rechartsColors.energy, strokeWidth: 4, opacity: 0.44 }}
              />
              <Area
                yAxisId="water"
                type="monotone"
                dataKey="water"
                name="Water (L)"
                stroke={rechartsColors.water}
                fill="url(#waterFill)"
                strokeWidth={3}
                dot={{ r: 5, fill: rechartsColors.fill2, stroke: rechartsColors.water, strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#19272D', stroke: rechartsColors.water, strokeWidth: 4, opacity: 0.39 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Insight Card */}
        <div className="mt-6 mb-2">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 font-sans text-zinc-300 text-sm flex items-start gap-3">
            <span className="text-emerald-300 text-lg">ℹ️</span>
            Insight: <span className="text-white font-medium">
              Block 5 (AI Labs) is currently drawing 3x more power than the campus average due to continuous server loads.
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Water tab: BarChart
  function WaterTab() {
    const eceBlock = chartData.find(b => b.name.includes("Block 1 (ECE)"));
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full"
      >
        <div className="text-xl md:text-2xl font-semibold text-white mb-8 tracking-tight">Water Usage By Block</div>
        <div className="w-full h-[390px] bg-zinc-900/50 border border-zinc-800 rounded-2xl p-0.5 md:p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 16, right: 32, left: 16, bottom: 18 }}>
              <CartesianGrid stroke="#232832" strokeDasharray="2 4" opacity={0.10} />
              <XAxis dataKey="name" tick={{ fill: '#b7bccf', fontWeight: 500, fontSize: 14 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: rechartsColors.water, fontWeight: 500, fontSize: 14 }} axisLine={false} tickLine={false}
                label={{ value: "Water (L)", angle: -90, fill:"#b7bccf", dx:-10, position:"insideLeft" }}
              />
              <Tooltip
                wrapperStyle={{ border: 'none', background: 'none' }}
                contentStyle={{ background: '#181d22', border: '1px solid #272d37', color: '#fff', borderRadius: 8, fontSize: 16 }}
                labelStyle={{ color: '#b7bccf', fontWeight: 600, border: 0 }}
                formatter={v => [`${v} L`, 'Water']}
              />
              <Bar
                dataKey="water"
                fill={rechartsColors.water}
                name="Water (L)"
                barSize={38}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Insight Card */}
        <div className="mt-6 mb-2">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 font-sans text-zinc-300 text-sm flex items-start gap-3">
            <span className="text-blue-300 text-lg">💧</span>
            Insight: <span className="text-white font-medium">
              Block 1 (ECE) rainwater harvesting is operating at peak efficiency, filling 80% of the reserve.
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Waste Logs: terminal-style, ultra clean
  function WasteTab() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36 }}
        className="w-full flex flex-col items-center"
      >
        <div className="w-full max-w-2xl rounded-xl bg-zinc-900/60 border border-zinc-800 px-0 pt-5 pb-0">
          <div className="px-6 pb-2 flex items-center justify-between">
            <div className="text-lg md:text-xl font-semibold tracking-tight text-white">Waste Segregation Logs</div>
            <div className="text-sm text-zinc-400 font-mono">Waste Segregated: <span className="text-emerald-300 font-bold">{metrics.wasteSegregated ?? '--'}</span></div>
          </div>
          <div className="px-6 pb-5 pt-1">
            <div
              className="w-full rounded bg-black px-4 py-4 font-mono text-[15px] text-zinc-300 border border-zinc-800"
              style={{ fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace' }}
            >
              <div className="text-zinc-500 select-none mb-2">// Waste system log — GCET</div>
              {alerts && alerts.length ? (
                alerts.map((a: any, idx: number) => (
                  <div key={idx} className={`flex gap-2 items-center leading-relaxed ${a.type === "RESOLVED" ? "text-green-400 font-semibold" : a.type === "WARNING" ? "text-yellow-400" : "text-zinc-300"}`}>
                    <span>
                      {"[" + (a.type?.toUpperCase() || "-") + "]"}
                    </span>
                    <span>{a.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-600 font-light italic">No system waste alerts.</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans bg-black relative flex flex-col md:flex-row">
      <Sidebar />
      <Sidebar mobile />

      <LeaderboardDrilldown
        open={!!leaderModal}
        onClose={() => setLeaderModal(null)}
        name={leaderModal?.name ?? ""}
        drilldown={leaderModal?.drilldown ?? { hvac: 0, lighting: 0, plug: 0 }}
      />

      <div className="flex-1 min-h-screen flex flex-col md:pl-56 bg-black">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-black/95 border-b border-zinc-900 h-18 px-5 md:px-12 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-1 md:gap-4 py-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              GCET Command Center
            </h1>
            <div className="flex flex-col md:flex-row gap-1.5 md:gap-5 items-center">
              <span className="text-xs text-emerald-400 font-mono tracking-wide animate-blink-soft select-none">
                ● Monitoring 7 Zones
              </span>
              <span className="text-xs text-zinc-400 font-mono select-none">
                Last Sync: 10s ago
              </span>
            </div>
          </div>
        </header>
        {/* Minimal toast (no glow, subtle border only) */}
        <AnimatePresence>
          {toast.show &&
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="fixed top-8 left-1/2 z-[100] -translate-x-1/2 bg-zinc-900/90 text-white border border-zinc-700 px-7 py-2.5 rounded-lg font-medium text-[15px] shadow-none"
              style={{ fontFamily: "inherit", minWidth: 240, textAlign: 'center', letterSpacing: '.02em', fontWeight: 500 }}
            >
              {toast.message}
            </motion.div>
          }
        </AnimatePresence>

        <main className="flex-1 flex flex-col py-4 md:py-10 px-2 md:px-8 max-w-[100vw] transition">

          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, type: "spring", damping: 17 }}
              className="flex flex-col gap-8"
            >
              {/* --- METRICS ROW --- */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Sustainability Score */}
                <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col relative overflow-hidden min-h-[120px]">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-base font-semibold text-white">Sustainability</span>
                  </div>
                  <div className="flex items-center gap-4 h-12">
                    <div className="text-4xl md:text-5xl font-extrabold text-white">{sustainabilityScore ?? 87}<span className="ml-1 text-zinc-500 text-2xl font-medium">/100</span></div>
                    <ResponsiveContainer width={70} height={24}>
                      <LineChart data={sustainabilityMiniTrend}>
                        <Line
                          type="monotone"
                          dataKey="y"
                          stroke={rechartsColors.energy}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={weeklyTrend >= 0 ? "text-emerald-400 font-semibold" : 'text-rose-400 font-semibold'}>
                      ↑ +{weeklyTrend ?? 4}% this week
                    </span>
                  </div>
                </div>
                {/* AQI */}
                <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-1 min-h-[120px]">
                  <span className="text-sm font-semibold text-zinc-400 mb-1">Air Quality Index</span>
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    AQI: {aqi?.value ?? 42}
                  </span>
                  <span className="text-xs mt-0.5 font-medium text-zinc-400">
                    {aqi?.label ?? 'Good Air Quality'}
                  </span>
                </div>
                {/* Energy Saved */}
                <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-1 min-h-[120px]">
                  <span className="text-sm font-semibold text-zinc-400 mb-1">Energy Saved</span>
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {metrics.energySaved}
                  </span>
                  <span className="text-xs text-zinc-400">kWh this week</span>
                </div>
                {/* CO2 Emissions Prevented */}
                <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-1 min-h-[120px]">
                  <span className="text-sm font-semibold text-zinc-400 mb-1">
                    CO<sub>2</sub> Emissions Prevented
                  </span>
                  <span className="text-2xl md:text-3xl font-bold text-white flex items-center">
                    {CO2_ICON}{CO2_METRIC.value}
                  </span>
                  <span className="text-xs text-zinc-400">{CO2_METRIC.subtext}</span>
                </div>
                {/* Water Harvested */}
                <div className="col-span-1 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-1 min-h-[120px]">
                  <span className="text-sm font-semibold text-zinc-400 mb-1">Water Harvested</span>
                  <span className="text-2xl md:text-3xl font-bold text-white">{metrics.waterHarvested}</span>
                  <span className="text-xs text-zinc-400">liters this week</span>
                </div>
              </div>
              {/* --- ANALYTICS & LEADERBOARD --- */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Analytics - Energy Efficiency & LineChart */}
                <div className="col-span-1 md:col-span-7 flex flex-col gap-6">
                  {/* Energy Efficiency Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.08 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-2">
                      <span className="text-white font-semibold text-base">Energy Efficiency</span>
                      <span className="text-xs text-zinc-400 font-mono">Campus Savings Monitor</span>
                    </div>
                    <div className="flex flex-row md:gap-7 gap-4 items-center mb-1 mt-2">
                      <div className="flex flex-col gap-0">
                        <span className="text-sm text-zinc-400">Target</span>
                        <span className="text-lg font-bold text-white">{metrics.savingsTarget ?? '15%'}</span>
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-sm text-zinc-400">Actual</span>
                        <span className="text-lg font-bold text-white">{metrics.currentSavings ?? '12%'}</span>
                      </div>
                      <div className="flex flex-col gap-0">
                        <span className="text-sm text-zinc-400">Energy Wasted</span>
                        <span className="text-lg font-bold text-white">{metrics.energyWasted ?? 210} kWh</span>
                      </div>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 mt-4 font-mono text-[13px] text-zinc-400 flex items-center gap-2">
                      <span className="font-semibold text-emerald-300">Insight:</span> {energyRedirection ?? "Wasted energy could power 142 LED bulbs for 3 days."}
                    </div>
                  </motion.div>
                  {/* Minimalist LineChart of energy */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.31, delay: 0.12 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col"
                  >
                    <div className="flex items-center mb-2">
                      <h2 className="text-white font-semibold text-base flex-1">Blockwise Energy Trends</h2>
                    </div>
                    <div className="grow h-[220px]">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 5, right: 18, left: 0, bottom: 8 }}>
                          <CartesianGrid stroke="#232a33" strokeDasharray="3 6" opacity={0.07} />
                          <XAxis dataKey="name" tick={{ fill: "#b7bccf", fontWeight: 500 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: rechartsColors.energy, fontWeight: 600 }} axisLine={false} tickLine={false} label={{ value: "kWh", angle: -90, fill: "#b7bccf", position: "insideLeft", dx: -10 }} />
                          <Tooltip
                            contentStyle={{
                              background: "#191f22",
                              border: "1px solid #232832",
                              color: "#b7bccf",
                            }}
                            itemStyle={{ color: rechartsColors.energy }}
                          />
                          <Line
                            type="monotone"
                            dataKey="energy"
                            name="kWh"
                            stroke={rechartsColors.energy}
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              fill: "#181b1f",
                              stroke: rechartsColors.energy,
                              strokeWidth: 2,
                            }}
                            activeDot={{ r: 8, fill: "black", stroke: rechartsColors.energy, strokeWidth: 3, opacity: 0.3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Insight */}
                    <div className="mt-4 mb-2">
                      <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 font-sans text-zinc-300 text-sm flex items-start gap-3">
                        <span className="text-emerald-300 text-lg">ℹ️</span>
                        Insight: <span className="text-white font-medium">
                          Block 5 (AI Labs) is currently drawing 3x more power than the campus average due to continuous server loads.
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                {/* Leaderboard & Pie */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.10 }}
                  className="col-span-1 md:col-span-5 flex flex-col gap-6">
                  {/* Leaderboard */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <span className="text-base font-semibold text-emerald-300 mb-1">The Green Leaderboard</span>
                    <ul className="flex flex-col gap-1.5 mt-2">
                      {leaderboardData.map(({ medal, name, score, drilldown }) => (
                        <li
                          key={name}
                          className="flex gap-2 items-baseline rounded cursor-pointer transition hover:bg-zinc-900/90 px-2 py-1 select-none"
                          tabIndex={0}
                          role="button"
                          aria-label={`View ${name} breakdown`}
                          onClick={() => setLeaderModal({ name, drilldown })}
                          onKeyDown={e => e.key === 'Enter' && setLeaderModal({ name, drilldown })}
                        >
                          <span className="text-xl">{medal}</span>
                          <span className="text-zinc-200 font-mono">{name}</span>
                          <span className="ml-auto text-sm text-white font-semibold">
                            {score}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 text-xs text-zinc-400 font-mono">Campus zones by sustainability</div>
                  </div>
                  {/* Water Usage PieChart */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-300 font-semibold text-base flex-1">Block Water Usage</span>
                    </div>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={29}
                          outerRadius={60}
                          paddingAngle={4}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, name }) => {
                            if (typeof midAngle !== "number" || typeof innerRadius !== "number" || typeof outerRadius !== "number" || typeof cx !== "number" || typeof cy !== "number") return null;
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 1.12;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="#94acc3"
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
                            background: "#161a1e",
                            border: "1px solid #222a33",
                            color: "#8cb4bc"
                          }}
                          formatter={(value: any) => [`${value} L`, "Water"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
              {/* --- AI INSIGHTS --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 11 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.29, delay: 0.11 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl min-h-[150px] p-6 flex flex-col"
                >
                  <div className="text-emerald-300 font-semibold text-base mb-2 flex items-center gap-1">AI Sustainability Insights</div>
                  <div className="flex flex-col gap-2">
                    {alerts && alerts.length ? (
                      <ul className="max-h-32 overflow-y-auto flex flex-col gap-0.5 pl-1">
                        {alerts.map((alert: any, idx: number) => (
                          <li key={idx} className={`font-mono text-[14px] flex gap-1 items-center
                            ${alert.type === "RESOLVED" ? "text-green-400 font-bold" : alert.type === "WARNING" ? "text-yellow-400" : "text-zinc-400"}
                          `}>
                            <span>•</span>{alert.message}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-zinc-600 italic text-sm">No alerts today</div>
                    )}
                  </div>
                </motion.div>
                {/* AI Forecast */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.29, delay: 0.12 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl min-h-[150px] p-6 flex flex-col items-stretch"
                >
                  <span className="font-semibold text-emerald-300 mb-2 text-base">AI Forecast</span>
                  <div className="grow flex flex-col justify-center items-start gap-1">
                    <div className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl text-zinc-400 font-mono mb-2">
                      Next Week Projection →
                    </div>
                    <div className="flex flex-col gap-1 mt-2 font-mono">
                      <div className="flex gap-2 items-center">
                        <span className="text-white">⚡</span>
                        <span className="font-semibold text-zinc-400">Energy</span>
                        <span className="font-bold text-emerald-300">{forecast.energy}</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-white">💧</span>
                        <span className="font-semibold text-zinc-400">Water</span>
                        <span className="font-bold text-blue-300">{forecast.water}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 mt-4">AI-driven update (daily)</div>
                </motion.div>
                {/* Spacer/future */}
                <div />
              </div>

              {/* --- CONTROL PANEL --- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Minimal Admin Control Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: 0.13 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
                >
                  <span className="text-emerald-300 font-bold text-base mb-2">Admin Control Panel</span>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {/* 1st button: the live demo */}
                    <button
                      onClick={() => !isOptimized && handleOptimizeBlock4()}
                      className={`px-5 py-2.5 text-white font-semibold rounded-md border text-base transition
                        ${
                          isOptimized
                            ? 'bg-zinc-900 border-zinc-700 text-green-400 cursor-not-allowed'
                            : 'bg-zinc-900/80 border-zinc-700 hover:bg-zinc-900 hover:border-green-400'
                        }
                      `}
                      type="button"
                      disabled={isOptimized}
                      style={{ minWidth: 210 }}
                    >
                      {isOptimized ? 'Optimized ✓' : 'Optimize Block 4 Auditorium HVAC'}
                    </button>
                    {/* 2nd button: inspect water */}
                    <button
                      onClick={() => showToast("Scheduled (simulated).")}
                      className="px-5 py-2.5 bg-zinc-900/80 border border-zinc-700 text-white font-semibold rounded-md text-base hover:border-blue-300 transition"
                      type="button"
                    >
                      Schedule Water Inspection
                    </button>
                    {/* PDF download */}
                    <a href="/GCET_Report.pdf" download tabIndex={-1} className="inline-block">
                      <button
                        onClick={() => showToast("PDF report downloaded.")}
                        className="px-5 py-2.5 bg-zinc-900/80 border border-zinc-700 text-white font-semibold rounded-md text-base hover:border-emerald-300 transition"
                        type="button"
                      >
                        📄 Generate Monthly Analytics Report
                      </button>
                    </a>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Actions send secure operations to GCET IoT devices</div>
                </motion.div>
                {/* ROI impact */}
                <motion.div
                  initial={{ opacity: 0, y: 23 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.15 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3 items-start justify-center"
                >
                  <span className="text-cyan-200 font-bold text-base mb-1">ROI Impact</span>
                  <div className="text-xl font-bold text-white flex gap-6 items-center mb-2">
                    <span className="flex items-center gap-1">
                      ⚡
                      <span className="text-emerald-200 font-extrabold text-2xl">₹2.3 Lakhs</span>
                    </span>
                    <span className="flex items-center gap-1">
                      💧
                      <span className="text-blue-200 font-extrabold text-xl">1.1M L</span>
                    </span>
                    <span className="flex items-center gap-1">
                      🌱
                      <span className="text-emerald-200 font-extrabold text-lg">17%</span>
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    Energy: ₹2,30,000 <br />
                    Water: 1,100,000 L <br />
                    Carbon Reduction: 17%
                  </div>
                </motion.div>
                {/* Just an empty col for alignment */}
                <div />
              </div>
              {/* (optional) children hidden, to avoid deopt issues */}
              <div className="hidden">{children}</div>
            </motion.div>
          )}
          {activeTab === "energy" && <EnergyTab />}
          {activeTab === "water" && <WaterTab />}
          {activeTab === "waste" && <WasteTab />}
        </main>
        <div className="hidden">{children}</div>
      </div>
      <style jsx global>{`
        html, body, #__next { background: #0a0c0f !important; }
        @keyframes blink-soft {
          0%, 100% { opacity: 0.70; }
          50% { opacity: 0.44; }
        }
        .animate-blink-soft { animation: blink-soft 1.4s infinite; }
      `}</style>
    </div>
  );
}
