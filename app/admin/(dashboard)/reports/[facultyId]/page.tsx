"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { FacultyDetailReport } from "@/components/admin/reports/faculty-detail-report";

export default function FacultyReportPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = use(params);
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const subject = searchParams.get("subject");
  const includeSchoolHead = source === "school_head";

  return (
    <FacultyDetailReport
      facultyId={facultyId}
      includeSchoolHead={includeSchoolHead}
      subjectFilter={subject ?? undefined}
    />
  );
}
