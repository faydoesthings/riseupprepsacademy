"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  actionLabel?: string;
  actionHref?: string;
  searchPlaceholder?: string;
  searchParamName?: string;
  customAction?: React.ReactNode;
}

function PageHeaderSearch({
  placeholder,
  paramName = "search",
}: {
  placeholder: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(urlValue);

  useEffect(() => {
    setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = value.trim();
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set(paramName, trimmed);
      } else {
        params.delete(paramName);
      }
      params.delete("page");
      const query = params.toString();
      const next = query ? `${pathname}?${query}` : pathname;
      const current = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      if (next !== current) {
        router.push(next);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams, paramName]);

  return (
    <div className="portal-list-search">
      <Search className="portal-list-search__icon" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="form-input portal-list-search__input"
        aria-label={placeholder}
      />
    </div>
  );
}

function PageHeaderInner({
  title,
  description,
  eyebrow = "Admin portal",
  actionLabel,
  actionHref,
  searchPlaceholder,
  searchParamName,
  customAction,
}: PageHeaderProps) {
  return (
    <header className="portal-list-header">
      <div className="portal-list-header__copy">
        <p className="admin-dashboard__eyebrow">{eyebrow}</p>
        <h1 className="admin-dashboard__title">{title}</h1>
        <p className="admin-dashboard__subtitle">{description}</p>
      </div>

      {(searchPlaceholder || customAction || (actionLabel && actionHref)) && (
        <div className="portal-list-header__actions">
          {searchPlaceholder && (
            <PageHeaderSearch
              placeholder={searchPlaceholder}
              paramName={searchParamName}
            />
          )}
          {customAction ? (
            customAction
          ) : actionLabel && actionHref ? (
            <Link href={actionHref} className="portal-btn portal-btn--primary">
              <Plus className="w-4 h-4" aria-hidden />
              {actionLabel}
            </Link>
          ) : null}
        </div>
      )}
    </header>
  );
}

export default function PageHeader(props: PageHeaderProps) {
  return (
    <Suspense
      fallback={
        <header className="portal-list-header">
          <div className="portal-list-header__copy">
            <p className="admin-dashboard__eyebrow">{props.eyebrow ?? "Admin portal"}</p>
            <h1 className="admin-dashboard__title">{props.title}</h1>
            <p className="admin-dashboard__subtitle">{props.description}</p>
          </div>
        </header>
      }
    >
      <PageHeaderInner {...props} />
    </Suspense>
  );
}
