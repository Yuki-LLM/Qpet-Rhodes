import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-stone-600">{body}</p>
      {actionHref && actionLabel ? (
        <Link className="btn-primary mt-5" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
