"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState, useTransition } from "react";

type AdminActionResult = {
  message?: string;
} | void;

type AdminActionFormProps = {
  action: (formData: FormData) => Promise<AdminActionResult>;
  children: ReactNode;
  className?: string;
  encType?: string;
};

export function AdminActionForm({ action, children, className, encType }: AdminActionFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = submitter ? new FormData(form, submitter) : new FormData(form);

    startTransition(async () => {
      const result = await action(formData);
      setMessage(result?.message ?? "Saved.");
      router.refresh();
      window.setTimeout(() => setMessage(null), 2200);
    });
  }

  return (
    <>
      <form className={className} encType={encType} onSubmit={handleSubmit} aria-busy={isPending}>
        {children}
      </form>
      {message ? (
        <div className="fixed right-4 top-4 z-[80] rounded-2xl border border-qpet/30 bg-white px-4 py-3 text-sm font-semibold text-qpet-dark shadow-[0_16px_40px_rgba(16,24,50,0.16)]">
          {message}
        </div>
      ) : null}
    </>
  );
}
