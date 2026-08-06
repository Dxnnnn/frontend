import { getEvaluationSubmissionsAsync } from "@/lib/user/evaluation-submissions";
import { getSchoolHeadSubmissionsAsync } from "@/lib/faculty-portal/coordinator-submissions";
import { formatSubmissionDate } from "@/lib/user/evaluation-submissions";

export interface RecentEvaluationItem {
  id: string;
  facultyName: string;
  department: string;
  subject: string;
  source: "Student" | "School Head";
  submittedAt: string;
  dateLabel: string;
}

export async function getRecentEvaluationsAsync(limit = 20): Promise<RecentEvaluationItem[]> {
  const [studentSubs, shSubs] = await Promise.all([
    getEvaluationSubmissionsAsync(),
    getSchoolHeadSubmissionsAsync(),
  ]);

  const studentItems: RecentEvaluationItem[] = studentSubs.map((s) => ({
    id: `student-${s.id}`,
    facultyName: s.facultyName,
    department: s.department,
    subject: s.subject,
    source: "Student",
    submittedAt: s.submittedAt,
    dateLabel: formatSubmissionDate(s.submittedAt),
  }));

  const shItems: RecentEvaluationItem[] = shSubs.map((s) => ({
    id: `school-head-${s.id}`,
    facultyName: s.facultyName,
    department: s.department,
    subject: s.subject,
    source: "School Head",
    submittedAt: s.submittedAt,
    dateLabel: formatSubmissionDate(s.submittedAt),
  }));

  return [...studentItems, ...shItems]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, limit);
}

// Keep sync export for any remaining legacy callers
export function getRecentEvaluations(limit = 20): RecentEvaluationItem[] {
  return [];
}
