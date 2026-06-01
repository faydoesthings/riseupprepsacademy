"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
];

const pieData = [
  { name: "Collected", value: 73 },
  { name: "Outstanding", value: 27 },
];

const COLORS = ["#F78C1F", "#C0392B"];

export function AdminCharts() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
        <h2 className="text-base font-bold text-white mb-6">Monthly Revenue</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#5A6A7A" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#5A6A7A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs${v}`} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ backgroundColor: "#1A2744", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12, fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill="#F78C1F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-[16px] p-6">
        <h2 className="text-base font-bold text-white mb-6">Fee Collection This Month</h2>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value">
                {pieData.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1A2744", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 12, fontSize: 13 }} />
              <text x="50%" y="48%" textAnchor="middle" fill="#FFFFFF" fontSize={28} fontWeight="bold">73%</text>
              <text x="50%" y="58%" textAnchor="middle" fill="#5A6A7A" fontSize={12}>Collected</text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-2">
          {pieData.map((entry, idx) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
              <span className="text-xs text-white/40">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
