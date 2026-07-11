"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/auth";

type ProfileFormProps = {
  email: string | null | undefined;
  role: string | null | undefined;
  fullName: string | null | undefined;
  phone: string | null | undefined;
};

export function ProfileForm({ email, role, fullName, phone }: ProfileFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    fullName: fullName ?? "",
    phone: phone ?? ""
  });
  const [isPending, startTransition] = useTransition();

  if (!isEditing) {
    return (
      <div className="mt-5">
        <div className="grid gap-3 text-sm text-stone-700">
          <p>
            <span className="font-semibold">Email:</span> {email}
          </p>
          <p>
            <span className="font-semibold">Name:</span> {profile.fullName || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {profile.phone || "Not set"}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {role ?? "customer"}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMessage("");
              setIsEditing(true);
            }}
            className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-white text-qpet-dark transition hover:bg-qpet-soft"
            aria-label="Edit profile"
          >
            <Pencil size={16} />
          </button>
          {message ? <p className="text-sm font-semibold text-qpet-dark">{message}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <form
      className="mt-5 grid gap-4"
      action={(formData) => {
        setMessage("");
        startTransition(async () => {
          const result = await updateProfile(formData);
          setMessage(result.message);

          if (result.status === "success") {
            setProfile({
              fullName: String(formData.get("full_name") ?? "").trim(),
              phone: String(formData.get("phone") ?? "").trim()
            });
            setIsEditing(false);
            router.refresh();
          }
        });
      }}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="account-full-name">
            Full name
          </label>
          <input id="account-full-name" className="field" name="full_name" defaultValue={profile.fullName} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700" htmlFor="account-phone">
            Phone
          </label>
          <input id="account-phone" className="field" name="phone" defaultValue={profile.phone} />
        </div>
      </div>
      <div className="grid gap-3 text-sm text-stone-700">
        <p>
          <span className="font-semibold">Email:</span> {email}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {role ?? "customer"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary py-2.5" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </button>
        <button type="button" className="btn-secondary py-2.5" onClick={() => setIsEditing(false)} disabled={isPending}>
          Cancel
        </button>
        {message ? <p className="text-sm font-semibold text-qpet-dark">{message}</p> : null}
      </div>
    </form>
  );
}
