import { cookies } from "next/headers";
import { EOSettingsPanel } from "@/components/eo/eo-settings-panel";
import type { AuthUser } from "@/lib/types/auth";

export default async function DCSettingsPage() {
  let adminName = "Admin";
  let adminEmail = "";
  let adminRole = "Data Center";

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("eval_session")?.value;
    if (raw) {
      const user = JSON.parse(raw) as AuthUser;
      adminName = user.name ?? "Admin";
      adminEmail = user.email ?? "";
      adminRole = user.adminRole ?? "Data Center";
    }
  } catch { /* use defaults */ }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile and account password.</p>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <EOSettingsPanel
          currentAdminName={adminName}
          currentAdminEmail={adminEmail}
          currentAdminRole={adminRole}
        />
      </main>
    </div>
  );
}
