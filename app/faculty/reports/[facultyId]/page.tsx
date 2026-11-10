import { FacultyDetailReport } from "@/components/admin/reports/faculty-detail-report";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyPortalReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ facultyId: string }>;
  searchParams: Promise<{ subject?: string; source?: string }>;
}) {
  const { facultyId } = await params;
  const { subject } = await searchParams;
  const user = await getSessionUser();

  return (
    <FacultyDetailReport
      facultyId={facultyId}
      includeSchoolHead
      backHref="/faculty/reports"
      preparerName={user?.name}
      preparerDepartment={user?.department}
      subjectFilter={subject ?? undefined}
    />
  );
}
