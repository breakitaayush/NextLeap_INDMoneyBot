import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <section className="card p-6 text-center">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ayuva-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
