export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
        <p className="text-sm text-gray-500">Chargement…</p>
      </div>
    </div>
  );
}
