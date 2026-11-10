import { UserDashboardPanel } from "@/components/user/dashboard/user-dashboard-panel";

export default function UserDashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your teacher evaluation activity and progress.
        </p>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-8 sm:px-8">
        <UserDashboardPanel />
      </main>
    </div>
  );
}
