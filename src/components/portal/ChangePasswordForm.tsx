"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { changePassword } from "@/app/actions/user-actions";

export default function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);

    if (result.success) {
      toast.success("Password updated successfully");
      e.currentTarget.reset();
    } else {
      const msg = result.error || "Failed to update password";
      setError(msg);
      toast.error(msg);
    }
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="portal-panel portal-settings-security">
      <header className="portal-panel__header portal-panel__header--compact">
        <div className="portal-settings-security__title-wrap">
          <span className="portal-settings-security__icon" aria-hidden>
            <Lock className="w-4 h-4" />
          </span>
          <div>
            <h2 className="portal-panel__title">Security</h2>
            <p className="portal-panel__desc">
              Choose a strong password with at least 8 characters.
            </p>
          </div>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="portal-settings-security__fields">
        <div>
          <label className="form-label-caps" htmlFor="currentPassword">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            required
            autoComplete="current-password"
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label-caps" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label-caps" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            autoComplete="new-password"
            className="form-input"
          />
        </div>
      </div>

      <div className="portal-settings-security__actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="portal-btn portal-btn--primary min-h-[44px] disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </div>
    </form>
  );
}
