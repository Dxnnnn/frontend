export function FacultyPortalPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </header>
      <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6 py-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-10 text-center">
          <p className="text-sm font-medium text-brand-700">Coming soon</p>
          <p className="mt-2 text-sm text-slate-500">
            This section will be built in a future update.
          </p>
        </div>
      </main>
    </div>
  );
}
