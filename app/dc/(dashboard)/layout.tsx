import { DCShell } from "@/components/dc/dc-shell";

export default function DCDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <DCShell>{children}</DCShell>;
}
