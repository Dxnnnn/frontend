"use client";

import { use } from "react";
import { FacultyDetailReport } from "@/components/admin/reports/faculty-detail-report";

export default function FacultyReportPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = use(params);
  return <FacultyDetailReport facultyId={facultyId} />;
}
