'use client';

import React, { useState, useEffect } from 'react';
// Import Recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Geist, Geist_Mono } from 'next/font/google';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Prevent hydration mismatch, per React best practices
  if (!isMounted) return null;

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-2xl md:text-4xl font-bold text-cyan-400 drop-shadow-glow animate-pulse text-center">
          Connecting to GCET Server...
        </div>
      </div>
    );
  }

  const { sustainabilityScore, weeklyTrend, metrics, blocks } = data;

  return (
    <div className="min-h-screen bg-background font-sans antialiased p-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Sustainability Score Card */}
        <div className="bg-card border border-accent/60 rounded-xl p-6 shadow-xl hover:border-accent/80 transition-colors relative overflow-hidden">
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-cyan-500/10 blur-xl pointer-events-none" />
          <h2 className="text-foreground mb-2 text-lg font-semibold">
            Sustainability Score
          </h2>
          <div className="text-4xl font-bold text-cyan-400 drop-shadow-glow">{sustainabilityScore}</div>
          <div className="mt-1 text-sm text-foreground/70">
            Weekly trend:{' '}
            <span className={weeklyTrend >= 0 ? 'text-green-400' : 'text-red-400'}>
              {weeklyTrend > 0 ? '+' : ''}{weeklyTrend}%
            </span>
          </div>
        </div>
        {/* Energy Saved */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:border-accent/50 transition-colors">
          <h2 className="text-foreground mb-2 text-lg font-semibold">
            Energy Saved
          </h2>
          <div className="text-3xl font-bold text-emerald-400 drop-shadow-glow">{metrics.energySaved}</div>
          <div className="mt-1 text-sm text-foreground/60">kWh this week</div>
        </div>
        {/* Water Harvested */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:border-accent/50 transition-colors">
          <h2 className="text-foreground mb-2 text-lg font-semibold">
            Water Harvested
          </h2>
          <div className="text-3xl font-bold text-sky-400 drop-shadow-glow">{metrics.waterHarvested}</div>
          <div className="mt-1 text-sm text-foreground/60">liters this week</div>
        </div>
        {/* Waste Segregated */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:border-accent/50 transition-colors">
          <h2 className="text-foreground mb-2 text-lg font-semibold">
            Waste Segregated
          </h2>
          <div className="text-3xl font-bold text-lime-400 drop-shadow-glow">{metrics.wasteSegregated}</div>
          <div className="mt-1 text-sm text-foreground/60">kg this week</div>
        </div>
      </div>

      {/* Charts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* BarChart for Block Energy */}
        <div className="bg-card border border-accent/50 rounded-xl p-6 shadow-lg transition-colors flex flex-col">
          <h2 className="text-foreground/90 text-lg font-semibold mb-4">
            Energy Consumption by Block
          </h2>
          <div className="h-80 flex items-center justify-center bg-secondary/30 rounded-lg border border-border/50 relative overflow-hidden">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-cyan-400/20 blur-2xl pointer-events-none" />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={blocks} margin={{ top: 24, right: 18, left: 0, bottom: 8 }}>
                <defs>
                  <filter id="glow-bar" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00ffe7" floodOpacity="0.8" />
                  </filter>
                </defs>
                <CartesianGrid stroke="#222a33" strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fill: "#a3e6e6", fontWeight: 500 }} axisLine={{ stroke: "#00fff2", opacity: 0.15 }} />
                <YAxis tick={{ fill: "#a3e6e6" }} axisLine={{ stroke: "#00fff2", opacity: 0.15 }} />
                <Tooltip
                  contentStyle={{ background: "#14222f", border: "1px solid #00fff2", color: "#e0fff9" }}
                  itemStyle={{ color: "#00ffe7" }}
                  cursor={{ fill: "#14222f", opacity: 0.1 }}
                />
                <Bar
                  dataKey="energy"
                  name="Energy (kWh)"
                  fill="#00ffe7"
                  radius={[6, 6, 0, 0]}
                  filter="url(#glow-bar)"
                  label={{ position: 'top', fill: '#56ffc7', fontSize: 14, fontWeight: "bold" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Placeholder 2 (unchanged) */}
        <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
          <div className="h-80 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
            <p className="text-foreground/40 text-sm">Chart Placeholder 2</p>
          </div>
        </div>
      </div>

      {/* Wide Chart Placeholder (unchanged) */}
      <div className="bg-card border border-border rounded-xl p-6 hover:border-accent/50 transition-colors">
        <div className="h-80 bg-secondary/30 rounded-lg flex items-center justify-center border border-border/50">
          <p className="text-foreground/40 text-sm">Wide Chart Placeholder</p>
        </div>
      </div>

      {/* Children, e.g. page content (Overview, etc.) */}
      <div className="hidden">{children}</div>
    </div>
  );
}
