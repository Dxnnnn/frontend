import { notifyEvaluationsUpdated } from "@/lib/admin/evaluation-events";
import type {
  EvaluationSubmission,
  NewEvaluationSubmission,
} from "@/lib/types/evaluation-submission";

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeScoringAnswers(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .map(([k, v]) => [k, Number(v)])
      .filter(([, v]) => !Number.isNaN(v)),
  );
}

function normalizePersonalAnswers(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .map(([k, v]) => [k, Number(v)])
      .filter(([, v]) => !Number.isNaN(v)),
  );
}

function normalizeSubmission(
  s: EvaluationSubmission & { answers?: Record<string, unknown> },
): EvaluationSubmission {
  if (s.scoringAnswers || s.personalAnswers) {
    return {
      ...s,
      subject: s.subject ?? "General Subject",
      scoringAnswers: normalizeScoringAnswers(s.scoringAnswers),
      personalAnswers: normalizePersonalAnswers(s.personalAnswers),
    };
  }
  // legacy shape
  const legacyAnswers = s.answers ?? {};
  const scoringAnswers: Record<string, number> = {};
  for (const [key, value] of Object.entries(legacyAnswers)) {
    const n = Number(value);
    if (!Number.isNaN(n) && n >= 0 && n <= 5) scoringAnswers[key] = n;
  }
  return { ...s, subject: s.subject ?? "General Subject", scoringAnswers, personalAnswers: {} };
}

// ── Backend persistence ───────────────────────────────────────────────────────

async function persistToBackend(submission: EvaluationSubmission): Promise<void> {
  try {
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
        source: "school_head",
      }),
    });
    if (!res.ok) {
      console.warn("[school-head] Failed to persist submission:", await res.text());
    }
  } catch (err) {
    console.warn("[school-head] Backend unreachable:", err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches all school-head submissions from MySQL via the backend API.
 * Filters by student_id prefix convention or returns all — backend returns
 * everything from evaluation_submissions; we tag school-head ones via
 * the studentId field being set to the school head's id_number.
 */
export async function getSchoolHeadSubmissionsAsync(): Promise<EvaluationSubmission[]> {
  try {
    const res = await fetch("/api/evaluations?source=school_head", { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { success?: boolean; submissions?: EvaluationSubmission[] };
    return (data.submissions ?? []).map(normalizeSubmission).sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
  } catch {
    return [];
  }
}
/**
 * Sync version — kept for components that haven't been migrated yet.
 * Returns an empty array on first call and triggers a background fetch.
 * Prefer getSchoolHeadSubmissionsAsync() in new code.
 */
let _cache: EvaluationSubmission[] = [];
let _syncPromise: Promise<void> | null = null;

export function getSchoolHeadSubmissions(): EvaluationSubmission[] {
  if (typeof window !== "undefined" && !_syncPromise) {
    _syncPromise = getSchoolHeadSubmissionsAsync()
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

/**
 * Saves a school-head evaluation submission to MySQL via the backend API.
 */
export async function addSchoolHeadSubmission(
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

  // Persist to MySQL
  await persistToBackend(submission);

  // Update local cache so UI reflects immediately without a re-fetch
  _cache = [submission, ..._cache];
  notifyEvaluationsUpdated();

  return submission;
}
