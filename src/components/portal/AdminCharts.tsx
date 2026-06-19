"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AdminChartData } from "@/lib/dashboard-types";
import { formatPKR } from "@/lib/format";

const PIE_COLORS = ["#F78C1F", "#0ABFBC"];

const tooltipStyle = {
  backgroundColor: "#0A1628",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  borderRadius: 12,
  fontSize: 13,
  padding: "10px 12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
};

export function AdminCharts({ data }: { data: AdminChartData }) {
  const { monthlyRevenue, feeCollection, collectionRate } = data;

  return (
    <div className="admin-dashboard__charts-grid">
      <article className="portal-panel portal-panel--chart">
        <div className="portal-panel__header portal-panel__header--compact">
          <div>
            <h2 className="portal-panel__title">Monthly revenue</h2>
            <p className="portal-panel__desc">Confirmed fee payments by month</p>
          </div>
        </div>
        <div className="portal-chart portal-chart--bar">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.35)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="rgba(255,255,255,0.35)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatPKR(Number(v))}
                width={72}
              />
              <Tooltip
                cursor={{ fill: "rgba(247, 140, 31, 0.08)", radius: 8 }}
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatPKR(value), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#F78C1F" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="portal-panel portal-panel--chart">
        <div className="portal-panel__header portal-panel__header--compact">
          <div>
            <h2 className="portal-panel__title">Fee collection</h2>
            <p className="portal-panel__desc">This month&apos;s collection split</p>
          </div>
        </div>
        <div className="portal-chart portal-chart--donut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={feeCollection}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="78%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {feeCollection.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize={26}
                fontWeight={700}
                fontFamily="var(--font-heading), system-ui, sans-serif"
              >
                {collectionRate}%
              </text>
              <text x="50%" y="56%" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={11}>
                Collected
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="portal-chart-legend">
          {feeCollection.map((entry, idx) => (
            <li key={entry.name}>
              <span
                className="portal-chart-legend__dot"
                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                aria-hidden
              />
              <span className="portal-chart-legend__label">{entry.name}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
