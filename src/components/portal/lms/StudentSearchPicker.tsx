"use client";

import { useCallback, useEffect, useState } from "react";
import { listStudentsForEnroll } from "@/app/actions/lms/enrollment-actions";

type Student = { id: string; name: string | null; email: string };

export default function StudentSearchPicker({
  label = "Student",
  value,
  onChange,
  excludeIds = [],
  disabled = false,
}: {
  label?: string;
  value: string;
  onChange: (studentId: string, student: Student | null) => void;
  excludeIds?: string[];
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const res = await listStudentsForEnroll(q.trim());
    if (res.success) {
      const excluded = new Set(excludeIds);
      setResults(res.data.filter((s) => !excluded.has(s.id)));
    }
  }, [excludeIds]);

  useEffect(() => {
    const timer = setTimeout(() => void search(query), 250);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  function pick(student: Student) {
    setSelected(student);
    onChange(student.id, student);
    setQuery(student.name ?? student.email);
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    onChange("", null);
  }

  return (
    <div className="lms-enroll-search">
      <label className="form-label-caps">{label}</label>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (selected && e.target.value !== (selected.name ?? selected.email)) {
              setSelected(null);
              onChange("", null);
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name or email…"
          className="form-input"
          disabled={disabled}
          aria-label={label}
        />
        {selected && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/45 hover:text-white/70"
          >
            Clear
          </button>
        )}
      </div>
      {open && results.length > 0 && !selected && (
        <div className="lms-enroll-results">
          {results.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => pick(student)}
              className="lms-enroll-result"
            >
              <p className="lms-enroll-result__name">{student.name ?? "Unnamed student"}</p>
              <p className="lms-enroll-result__email">{student.email}</p>
            </button>
          ))}
        </div>
      )}
      <input type="hidden" name="studentId" value={value} required />
    </div>
  );
}
