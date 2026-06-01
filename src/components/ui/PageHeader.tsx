import { Plus, Search } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  searchPlaceholder?: string;
  customAction?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  searchPlaceholder,
  customAction,
}: PageHeaderProps) {
  return (
    <div className="portal-page-shell flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white font-display">{title}</h1>
        <p className="text-sm text-white/50 mt-1 leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        {searchPlaceholder && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="form-input pl-10 min-h-[44px]"
              aria-label={searchPlaceholder}
            />
          </div>
        )}

        {customAction ? (
          customAction
        ) : actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="btn btn-primary py-2.5 min-h-[44px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
