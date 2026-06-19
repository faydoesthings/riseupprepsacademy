"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { submitAttendance } from "@/app/actions/attendance-actions";

type StatusType = "PRESENT" | "ABSENT" | "LATE";

interface StudentData {
  id: string;
  name: string;
  rollNumber: string | null;
  existingStatus?: StatusType;
}

interface AttendanceMarkerProps {
  periodId: string;
  dateString: string;
  teacherId: string;
  students: StudentData[];
  periodLabel?: string;
  isToday?: boolean;
  alreadyMarkedCount?: number;
  lastMarkedAt?: string;
}

const statusOptions: Array<{
  value: StatusType;
  label: string;
  shortLabel: string;
  icon: typeof CheckCircle;
  tone: "present" | "late" | "absent";
}> = [
  { value: "PRESENT", label: "Present", shortLabel: "P", icon: CheckCircle, tone: "present" },
  { value: "LATE", label: "Late", shortLabel: "L", icon: Clock, tone: "late" },
  { value: "ABSENT", label: "Absent", shortLabel: "A", icon: XCircle, tone: "absent" },
];

export default function AttendanceMarker({
  periodId,
  dateString,
  teacherId,
  students,
  periodLabel,
  isToday = false,
  alreadyMarkedCount = 0,
  lastMarkedAt,
}: AttendanceMarkerProps) {
  const [attendance, setAttendance] = useState<Record<string, StatusType>>(() => {
    const initial: Record<string, StatusType> = {};
    students.forEach((s) => {
      initial[s.id] = s.existingStatus || "PRESENT";
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const counts = {
    present: Object.values(attendance).filter((s) => s === "PRESENT").length,
    absent: Object.values(attendance).filter((s) => s === "ABSENT").length,
    late: Object.values(attendance).filter((s) => s === "LATE").length,
  };

  const handleStatusChange = (studentId: string, status: StatusType) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    const result = await submitAttendance(periodId, dateString, records, teacherId);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to submit attendance");
    }

    setIsSubmitting(false);
  };

  const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="portal-attendance-marker portal-panel">
      <header className="portal-attendance-marker__header">
        <div className="portal-attendance-marker__intro">
          <div className="portal-attendance-marker__date-row">
            <span className="portal-attendance-marker__date-chip">{formattedDate}</span>
            {isToday && (
              <span className="portal-attendance-marker__today-pill">Today</span>
            )}
          </div>
          <h3 className="portal-attendance-marker__title">Mark attendance</h3>
          {periodLabel && (
            <p className="portal-attendance-marker__period">{periodLabel}</p>
          )}
          {alreadyMarkedCount > 0 && (
            <p className="portal-attendance-marker__saved">
              {alreadyMarkedCount} of {students.length} students already marked for this date
              {lastMarkedAt
                ? ` · Last saved ${new Date(lastMarkedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
            </p>
          )}
        </div>

        <div className="portal-attendance-marker__stats" aria-label="Attendance summary">
          <span className="portal-attendance-stat portal-attendance-stat--present">
            Present <strong>{counts.present}</strong>
          </span>
          <span className="portal-attendance-stat portal-attendance-stat--late">
            Late <strong>{counts.late}</strong>
          </span>
          <span className="portal-attendance-stat portal-attendance-stat--absent">
            Absent <strong>{counts.absent}</strong>
          </span>
        </div>
      </header>

      {students.length === 0 ? (
        <div className="portal-attendance-marker__empty">
          <p>No students found in this class.</p>
        </div>
      ) : (
        <ul className="portal-attendance-marker__list">
          {students.map((student) => (
            <li key={student.id} className="portal-attendance-row">
              <div className="portal-attendance-row__student">
                <p className="portal-attendance-row__name">{student.name}</p>
                <p className="portal-attendance-row__roll">
                  Roll no. {student.rollNumber || "—"}
                </p>
              </div>

              <div
                className="portal-attendance-row__toggle"
                role="group"
                aria-label={`Attendance status for ${student.name}`}
              >
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = attendance[student.id] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(student.id, option.value)}
                      className={`portal-attendance-toggle portal-attendance-toggle--${option.tone} ${
                        isActive ? "is-active" : ""
                      }`}
                      aria-pressed={isActive}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      <span className="portal-attendance-toggle__label">{option.label}</span>
                      <span className="portal-attendance-toggle__short" aria-hidden>
                        {option.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="portal-attendance-marker__footer">
        <div className="portal-attendance-marker__feedback">
          {error && <p className="portal-attendance-marker__error">{error}</p>}
          {success && (
            <p className="portal-attendance-marker__success">Attendance saved successfully.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || students.length === 0}
          className="portal-btn portal-btn--primary min-h-[44px] disabled:opacity-70 portal-attendance-marker__submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Submit attendance"
          )}
        </button>
      </footer>
    </section>
  );
}
