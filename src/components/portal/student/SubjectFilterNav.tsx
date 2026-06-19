import { BookOpen, LayoutGrid } from "lucide-react";

type Subject = { id: string; name: string };

export default function SubjectFilterNav({
  subjects,
  basePath,
  currentSubjectId,
  counts,
}: {
  subjects: Subject[];
  basePath: string;
  currentSubjectId?: string;
  counts?: Record<string, number>;
}) {
  const totalCount = counts
    ? Object.values(counts).reduce((sum, count) => sum + count, 0)
    : undefined;

  return (
    <>
      <header className="portal-panel__header portal-panel__header--compact">
        <div>
          <h2 className="portal-panel__title flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#F78C1F]" aria-hidden />
            Subjects
          </h2>
          <p className="portal-panel__desc">Choose a subject to filter</p>
        </div>
      </header>

      <nav className="space-y-2" aria-label="Filter by subject">
        <a
          href={basePath}
          className={`portal-period-card ${!currentSubjectId ? "portal-period-card--active" : ""}`}
        >
          <p className="portal-period-card__subject flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#F78C1F] shrink-0" aria-hidden />
            All subjects
            {totalCount !== undefined && (
              <span className="ml-auto text-xs font-mono text-white/35">{totalCount}</span>
            )}
          </p>
        </a>

        {subjects.map((subject) => (
          <a
            key={subject.id}
            href={`${basePath}?subject=${subject.id}`}
            className={`portal-period-card ${
              currentSubjectId === subject.id ? "portal-period-card--active" : ""
            }`}
          >
            <p className="portal-period-card__subject">{subject.name}</p>
            {counts?.[subject.id] !== undefined && (
              <p className="text-xs text-white/35 mt-1 font-mono">
                {counts[subject.id]} {counts[subject.id] === 1 ? "item" : "items"}
              </p>
            )}
          </a>
        ))}
      </nav>
    </>
  );
}
