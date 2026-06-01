import { ReactNode } from "react";

interface DataTableProps {
  headers: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export default function DataTable({
  headers,
  children,
  emptyMessage = "No records found.",
  isEmpty = false,
}: DataTableProps) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.04] border-b border-white/[0.06]">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-white/40 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
