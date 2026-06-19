"use client";

import { Download } from "lucide-react";
import type { FinanceExportRow } from "@/lib/stats";

export default function MonthlyFinanceCsvExport({
  rows,
  filename,
}: {
  rows: FinanceExportRow[];
  filename: string;
}) {
  function download() {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const header = "Type,Date,Description,Amount (PKR),Status\n";
    const body = rows
      .map((r) =>
        [r.type, r.date, escape(r.description), r.amount, r.status].join(",")
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={rows.length === 0}
      className="portal-btn portal-btn--primary disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      Download CSV ({rows.length} rows)
    </button>
  );
}
