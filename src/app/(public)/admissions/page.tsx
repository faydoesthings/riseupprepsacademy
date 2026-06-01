"use client";

import { useState } from "react";
import { GraduationCap, Upload, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import { submitAdmissionApplication } from "@/app/actions/admission-actions";

export default function AdmissionsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    studentName: "",
    dateOfBirth: "",
    gradeApplying: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    previousSchool: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => fd.append(key, value));

    const result = await submitAdmissionApplication(fd);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to submit application");
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <main>
        <section className="relative pt-32 pb-20">
          <div className="absolute inset-0 gradient-hero" />
          <div className="container-main relative z-10 text-center py-20">
            <div className="glass-card max-w-lg mx-auto p-8 sm:p-10">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Application Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for applying to RiseUp Preps Academy. Our admin team will review your
                application and contact you within 3–5 business days.
              </p>
              <p className="text-sm text-gray-400">
                Please keep your phone available for a call from our admissions office.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#F78C1F]/10 blur-3xl" />
        </div>
        <div className="container-main relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
            <GraduationCap className="w-4 h-4 text-[#F78C1F]" />
            <span className="text-sm text-white/80 font-medium">Now Accepting Applications</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Apply for Admission</h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Begin your journey with RiseUp Preps Academy. Fill out the application form below and our
            team will get back to you.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#0A0E1A]">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <div className="card-elevated p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#F78C1F]/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#F78C1F]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Admission Application Form</h2>
                  <p className="text-sm text-gray-400">All fields marked with * are required</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 text-red-700 rounded-xl p-4 mb-6 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Student Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Student Full Name *</label>
                      <input
                        type="text"
                        name="studentName"
                        required
                        className="form-input"
                        placeholder="Enter student's full name"
                        value={formData.studentName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        required
                        className="form-input"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Grade Applying For *</label>
                      <select
                        name="gradeApplying"
                        required
                        className="form-select"
                        value={formData.gradeApplying}
                        onChange={handleChange}
                      >
                        <option value="">Select Grade</option>
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Previous School</label>
                      <input
                        type="text"
                        name="previousSchool"
                        className="form-input"
                        placeholder="Name of previous school"
                        value={formData.previousSchool}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Parent / Guardian Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Parent / Guardian Name *</label>
                      <input
                        type="text"
                        name="parentName"
                        required
                        className="form-input"
                        placeholder="Enter parent's full name"
                        value={formData.parentName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="parentPhone"
                        required
                        className="form-input"
                        placeholder="+92 300 1234567"
                        value={formData.parentPhone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="parentEmail"
                        className="form-input"
                        placeholder="email@example.com"
                        value={formData.parentEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-input"
                        placeholder="City, District, Province"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-100 pb-6">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Documents
                  </h3>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center bg-white/[0.02]">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-1">
                      Document upload will be available in the next release
                    </p>
                    <p className="text-xs text-gray-400">You may bring documents to the campus visit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    After submission, our admin team will review your application. You will be
                    notified via phone about the decision within 3–5 business days.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg w-full disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5" />
                      Submit Application
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
