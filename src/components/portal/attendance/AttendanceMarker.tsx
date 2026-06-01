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
}

export default function AttendanceMarker({ periodId, dateString, teacherId, students }: AttendanceMarkerProps) {
  const [attendance, setAttendance] = useState<Record<string, StatusType>>(() => {
    const initial: Record<string, StatusType> = {};
    students.forEach(s => {
      initial[s.id] = s.existingStatus || "PRESENT"; // Default all to present to speed up
    });
    return initial;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = (studentId: string, status: StatusType) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status
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

  return (
    <div className="card-elevated overflow-hidden">
      <div className="bg-[#F8FAFC] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-[#05335C]">Mark Attendance</h3>
          <p className="text-sm text-gray-500">For {new Date(dateString).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-green-600">Present: {Object.values(attendance).filter(s => s === "PRESENT").length}</span>
          <span className="text-red-600">Absent: {Object.values(attendance).filter(s => s === "ABSENT").length}</span>
          <span className="text-orange-500">Late: {Object.values(attendance).filter(s => s === "LATE").length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-gray-100">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Roll No</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-[#05335C]">{student.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{student.rollNumber || "-"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => handleStatusChange(student.id, "PRESENT")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        attendance[student.id] === "PRESENT" 
                          ? "bg-white text-green-700 shadow-sm" 
                          : "text-gray-500 hover:text-green-600"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, "LATE")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        attendance[student.id] === "LATE" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-gray-500 hover:text-orange-500"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Late
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, "ABSENT")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        attendance[student.id] === "ABSENT" 
                          ? "bg-white text-red-600 shadow-sm" 
                          : "text-gray-500 hover:text-red-600"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No students found in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-100 bg-[#F8FAFC] flex justify-between items-center">
        <div>
          {error && <span className="text-red-600 text-sm">{error}</span>}
          {success && <span className="text-green-600 text-sm font-medium">Attendance successfully recorded!</span>}
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || students.length === 0}
          className="btn btn-primary disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
}
