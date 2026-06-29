"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { scheduleViva } from "@/app/actions/lms/viva-actions";
import StudentSearchPicker from "@/components/portal/lms/StudentSearchPicker";

export default function VivaScheduleForm({
  courses,
  teachers,
}: {
  courses: { id: string; title: string }[];
  teachers: { id: string; name: string; email: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentId, setStudentId] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!studentId) {
      setError("Select a student from search results");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const scheduledAt = new Date(`${fd.get("date")}T${fd.get("time")}:00`);

    startTransition(async () => {
      const res = await scheduleViva({
        courseId: fd.get("courseId") as string,
        studentId,
        examinerId: (fd.get("examinerId") as string) || undefined,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: fd.get("duration") ? Number(fd.get("duration")) : 30,
        meetingLink: (fd.get("meetingLink") as string) || "",
      });
      if (!res.success) setError(res.error ?? "Failed to schedule");
      else {
        setSuccess("Viva session scheduled");
        setStudentId("");
        router.refresh();
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <section className="portal-panel mb-6">
      <header className="portal-panel__header portal-panel__header--compact">
        <div>
          <h2 className="portal-panel__title">Schedule viva</h2>
          <p className="portal-panel__desc">Student must be eligible (final exam passed if required).</p>
        </div>
      </header>

      {error && <div className="alert-error mb-4 text-sm">{error}</div>}
      {success && <div className="alert-success mb-4 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label-caps">Course</label>
          <select name="courseId" required className="form-select">
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <StudentSearchPicker
          label="Student"
          value={studentId}
          onChange={(id) => setStudentId(id)}
          disabled={pending}
        />
        <div>
          <label className="form-label-caps">Examiner</label>
          <select name="examinerId" className="form-select">
            <option value="">Assign later</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label-caps">Duration (minutes)</label>
          <input name="duration" type="number" min={15} max={180} defaultValue={30} className="form-input" />
        </div>
        <div>
          <label className="form-label-caps">Date</label>
          <input name="date" type="date" required className="form-input" />
        </div>
        <div>
          <label className="form-label-caps">Time</label>
          <input name="time" type="time" required className="form-input" />
        </div>
        <div className="md:col-span-2">
          <label className="form-label-caps">Meeting link (optional)</label>
          <input name="meetingLink" type="url" className="form-input" placeholder="https://meet.google.com/..." />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={pending} className="portal-btn portal-btn--primary">
            Schedule session
          </button>
        </div>
      </form>
    </section>
  );
}
