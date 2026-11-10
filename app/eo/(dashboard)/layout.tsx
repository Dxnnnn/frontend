import { EOShell } from "@/components/eo/eo-shell";

export default function EODashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <EOShell>{children}</EOShell>;
}
