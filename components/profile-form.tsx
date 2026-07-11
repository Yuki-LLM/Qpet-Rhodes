"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/auth";

type ProfileFormProps = {
  email: string | null | undefined;
  role: string | null | undefined;
  fullName: string | null | undefined;
  phone: string | null | undefined;
};

export function ProfileForm({ email, role, fullName, phone }: ProfileFormProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-5 grid gap-4"
      action={(formData) => {
        setMessage("");
        startTransition(async () => {
          const result = await updateProfile(formData);
          setMessage(result.message);
        });
      }}
    >
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="account-email">
          Email
        </label>
        <input id="account-email" className="field bg-slate-50 text-slate-500" value={email ?? ""} readOnly />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="account-full-name">
            Full name
          </label>
          <input id="account-full-name" className="field" name="full_name" defaultValue={fullName ?? ""} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="account-phone">
            Phone
          </label>
          <input id="account-phone" className="field" name="phone" defaultValue={phone ?? ""} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="account-role">
          Role
        </label>
        <input id="account-role" className="field bg-slate-50 text-slate-500" value={role ?? "customer"} readOnly />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save Profile"}
        </button>
        {message ? <p className="text-sm font-semibold text-qpet-dark">{message}</p> : null}
      </div>
    </form>
  );
}
