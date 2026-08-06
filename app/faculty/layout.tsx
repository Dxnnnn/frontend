import { FacultyPortalShell } from "@/components/faculty-portal/faculty-portal-shell";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <FacultyPortalShell userName={user?.name} department={user?.department}>
      {children}
    </FacultyPortalShell>
  );
}
