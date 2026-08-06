import { notifyEvaluationsUpdated } from "@/lib/admin/evaluation-events";
import type {
  EvaluationSubmission,
  NewEvaluationSubmission,
} from "@/lib/types/evaluation-submission";

// ── Public async API (preferred) ─────────────────────────────────────────────

export async function getEvaluationSubmissionsAsync(): Promise<EvaluationSubmission[]> {
  try {
    const res = await fetch("/api/evaluations", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { success?: boolean; submissions?: EvaluationSubmission[] };
    return (data.submissions ?? []).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  } catch {
    return [];
  }
}

/**
 * Sync bridge — kept so older components still compile.
 * Returns in-memory cache and triggers a background fetch from MySQL.
 * Prefer getEvaluationSubmissionsAsync() in new/updated code.
 */
let _cache: EvaluationSubmission[] = [];
let _syncPromise: Promise<void> | null = null;

export function getEvaluationSubmissions(): EvaluationSubmission[] {
  if (typeof window !== "undefined" && !_syncPromise) {
    _syncPromise = getEvaluationSubmissionsAsync()
      .then((subs) => {
        _cache = subs;
        notifyEvaluationsUpdated();
      })
      .finally(() => {
        _syncPromise = null;
      });
  }
  return _cache;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function addEvaluationSubmissionAsync(
  input: NewEvaluationSubmission,
): Promise<EvaluationSubmission> {
  const submission: EvaluationSubmission = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    studentName: input.studentName,
    facultyId: input.facultyId,
    facultyName: input.facultyName,
    department: input.department,
    subject: input.subject,
    semester: input.semester,
    remarks: input.remarks,
    scoringAnswers: input.scoringAnswers,
    personalAnswers: input.personalAnswers,
    submittedAt: new Date().toISOString(),
  };

  const res = await fetch("/api/evaluations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: submission.id,
      student_id: submission.studentId,
      student_name: submission.studentName,
      faculty_id: submission.facultyId,
      faculty_name: submission.facultyName,
      department: submission.department,
      subject: submission.subject,
      semester: submission.semester,
      remarks: submission.remarks,
      scoring_answers: submission.scoringAnswers,
      personal_answers: submission.personalAnswers,
      submitted_at: submission.submittedAt,
      source: "student",
    }),
  });

  if (res.status === 409) {
    const data = (await res.json()) as { message?: string };
    throw new Error(data.message ?? "You have already submitted an evaluation for this instructor.");
  }

  if (!res.ok) {
    let message = "Failed to submit evaluation. Please try again.";
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  // Update cache immediately
  _cache = [submission, ..._cache];
  notifyEvaluationsUpdated();

  return submission;
}

/** Sync wrapper for components not yet migrated to async. */
export function addEvaluationSubmission(
  input: NewEvaluationSubmission,
): EvaluationSubmission {
  const submission: EvaluationSubmission = {
    id: crypto.randomUUID(),
    studentId: input.studentId,
    studentName: input.studentName,
    facultyId: input.facultyId,
    facultyName: input.facultyName,
    department: input.department,
    subject: input.subject,
    semester: input.semester,
    remarks: input.remarks,
    scoringAnswers: input.scoringAnswers,
    personalAnswers: input.personalAnswers,
    submittedAt: new Date().toISOString(),
  };

  // Fire-and-forget persist to backend
  void addEvaluationSubmissionAsync(input);

  return submission;
}

// ── Utility helpers ───────────────────────────────────────────────────────────

export function getOverallScore(answers: Record<string, number>): number {
  const scores = Object.values(answers);
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function countPersonalAnswers(answers: Record<string, number>): number {
  return Object.values(answers).filter((answer) => !Number.isNaN(answer)).length;
}

export function formatSubmissionDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
