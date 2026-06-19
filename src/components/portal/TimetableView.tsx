"use client";

import { useMemo, useState } from "react";
import { BookOpen, Clock } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SCHOOL_DAYS = [1, 2, 3, 4, 5];

type PeriodRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: { name: string };
  class?: { grade: string; section: string | null };
  teacher?: { user: { name: string } } | null;
};

function classLabel(cls?: { grade: string; section: string | null }) {
  if (!cls) return null;
  return `${cls.grade}${cls.section ? ` ${cls.section}` : ""}`;
}

function gradeTone(grade: string): "teal" | "orange" | "navy" | "neutral" {
  const n = parseInt(grade.replace(/\D/g, ""), 10);
  if (n === 6) return "teal";
  if (n === 7) return "orange";
  if (n === 8) return "navy";
  return "neutral";
}

export default function TimetableView({ periods }: { periods: PeriodRow[] }) {
  const today = new Date().getDay();

  const activeDays = useMemo(() => {
    const days = SCHOOL_DAYS.filter((d) => periods.some((p) => p.dayOfWeek === d));
    return days.length > 0 ? days : [...new Set(periods.map((p) => p.dayOfWeek))].sort();
  }, [periods]);

  const [selectedDay, setSelectedDay] = useState(() =>
    activeDays.includes(today) ? today : activeDays[0] ?? 1
  );

  const dayPeriods = useMemo(
    () =>
      periods
        .filter((p) => p.dayOfWeek === selectedDay)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [periods, selectedDay]
  );

  const countsByDay = useMemo(() => {
    const counts = new Map<number, number>();
    for (const day of activeDays) {
      counts.set(day, periods.filter((p) => p.dayOfWeek === day).length);
    }
    return counts;
  }, [periods, activeDays]);

  if (periods.length === 0) {
    return (
      <div className="portal-empty-state">
        <Clock className="w-12 h-12 text-[#F78C1F]/40 mx-auto mb-4" aria-hidden />
        <h3 className="text-lg font-bold text-white mb-2">No schedule found</h3>
        <p className="text-white/45 text-sm max-w-sm mx-auto">
          Your timetable will appear here once periods are assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="portal-timetable-v2">
      <div className="portal-timetable-v2__days" role="tablist" aria-label="Select day">
        {activeDays.map((day) => {
          const isActive = selectedDay === day;
          const isToday = day === today;
          return (
            <button
              key={day}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedDay(day)}
              className={`portal-timetable-v2__day ${isActive ? "is-active" : ""} ${
                isToday ? "is-today" : ""
              }`}
            >
              <span className="portal-timetable-v2__day-label">{DAY_LABELS[day]}</span>
              <span className="portal-timetable-v2__day-count">
                {countsByDay.get(day)} class{countsByDay.get(day) === 1 ? "" : "es"}
              </span>
            </button>
          );
        })}
      </div>

      <section className="portal-panel portal-timetable-v2__panel">
        <header className="portal-panel__header portal-panel__header--compact">
          <div>
            <h2 className="portal-panel__title">{DAY_NAMES[selectedDay]}</h2>
            <p className="portal-panel__desc">
              {dayPeriods.length === 0
                ? "No classes on this day."
                : `${dayPeriods.length} scheduled period${dayPeriods.length === 1 ? "" : "s"}`}
              {selectedDay === today ? " · Today" : ""}
            </p>
          </div>
        </header>

        {dayPeriods.length === 0 ? (
          <div className="portal-empty-state portal-empty-state--inline">
            <p className="text-white/45 text-sm">Nothing scheduled for this day.</p>
          </div>
        ) : (
          <ol className="portal-timetable-v2__timeline">
            {dayPeriods.map((period, index) => {
              const label = classLabel(period.class);
              const tone = period.class ? gradeTone(period.class.grade) : "neutral";

              return (
                <li key={period.id} className="portal-timetable-v2__slot">
                  <div className="portal-timetable-v2__rail" aria-hidden>
                    <span className="portal-timetable-v2__dot" />
                    {index < dayPeriods.length - 1 && (
                      <span className="portal-timetable-v2__line" />
                    )}
                  </div>

                  <div className="portal-timetable-v2__time">
                    <span className="portal-timetable-v2__time-start">{period.startTime}</span>
                    <span className="portal-timetable-v2__time-end">{period.endTime}</span>
                  </div>

                  <article
                    className={`portal-timetable-v2__card portal-timetable-v2__card--${tone}`}
                  >
                    <div className="portal-timetable-v2__card-top">
                      <p className="portal-timetable-v2__subject">{period.subject.name}</p>
                      {label && <span className="badge badge-info text-xs">{label}</span>}
                    </div>
                    {period.teacher && (
                      <p className="portal-timetable-v2__teacher">
                        <BookOpen className="w-3.5 h-3.5" aria-hidden />
                        {period.teacher.user.name}
                      </p>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
