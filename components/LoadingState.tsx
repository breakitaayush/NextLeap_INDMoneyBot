export function LoadingState({ label = "Loading Ayuva..." }: { label?: string }) {
  return (
    <div className="card grid min-h-40 place-items-center p-6 text-center">
      <div>
        <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-ayuva-mint border-t-ayuva-green" />
        <p className="text-sm font-semibold text-ayuva-muted">{label}</p>
      </div>
    </div>
  );
}
