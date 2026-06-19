import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface DataTableProps {
  headers: ReactNode[];
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  /** Use inside an existing portal-panel (no nested card border) */
  embedded?: boolean;
}

export default function DataTable({
  headers,
  children,
  emptyMessage = "No records found.",
  isEmpty = false,
  embedded = false,
}: DataTableProps) {
  return (
    <div className={embedded ? "portal-table-embed" : "portal-panel portal-table-wrap"}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              {headers.map((header, index) => (
                <th key={index} className="portal-table-th">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="portal-table-body divide-y divide-white/[0.05]">
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="portal-table-empty">
                  <div className="portal-table-empty__content">
                    <div className="portal-table-empty__icon" aria-hidden>
                      <Inbox className="w-7 h-7" />
                    </div>
                    <p className="portal-table-empty__text">{emptyMessage}</p>
                  </div>
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
