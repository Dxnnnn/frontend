import { FacultyDetailReport } from "@/components/admin/reports/faculty-detail-report";
import { getSessionUser } from "@/lib/auth/session";

export default async function FacultyPortalReportDetailPage({
  params,
}: {
  params: Promise<{ facultyId: string }>;
}) {
  const { facultyId } = await params;
  const user = await getSessionUser();

  return (
    <FacultyDetailReport
      facultyId={facultyId}
      includeSchoolHead
      backHref="/faculty/reports"
      preparerName={user?.name}
      preparerDepartment={user?.department}
    />
  );
}
