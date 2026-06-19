import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_SIZE, totalPages } from "@/lib/list-query";

interface PaginationProps {
  page: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams?: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

export default function Pagination({
  page,
  total,
  basePath,
  searchParams,
}: PaginationProps) {
  const pages = totalPages(total);
  if (total <= PAGE_SIZE) return null;

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <nav className="portal-pagination" aria-label="Pagination">
      <p className="portal-pagination__meta">
        Showing {start}–{end} of {total}
      </p>
      <div className="portal-pagination__controls">
        <Link
          href={buildHref(basePath, page - 1, searchParams)}
          className={`portal-btn portal-btn--ghost portal-pagination__btn ${
            page <= 1 ? "portal-pagination__btn--disabled" : ""
          }`}
          aria-disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Previous
        </Link>
        <span className="portal-pagination__page">
          Page {page} of {pages}
        </span>
        <Link
          href={buildHref(basePath, page + 1, searchParams)}
          className={`portal-btn portal-btn--ghost portal-pagination__btn ${
            page >= pages ? "portal-pagination__btn--disabled" : ""
          }`}
          aria-disabled={page >= pages}
        >
          Next
          <ChevronRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </nav>
  );
}
