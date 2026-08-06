import type {
  EvaluationType,
  NewSurveyQuestion,
  QuestionCategory,
  QuestionSection,
  QuestionStatus,
  SurveyAudience,
  SurveyQuestion,
} from "@/lib/types/survey-question";

function normalizeQuestion(record: unknown, index: number): SurveyQuestion {
  const q = record as Partial<SurveyQuestion>;
  const now = new Date().toISOString();

  return {
    id: q.id ?? crypto.randomUUID(),
    text: q.text ?? "",
    audience: q.audience ?? "student",
    section: q.section ?? "scoring",
    category: (q.category as QuestionCategory) ?? "Other",
    evaluationType: (q.evaluationType as EvaluationType) ?? "rating",
    required: q.required ?? true,
    isActive: q.isActive === false ? false : (q.isActive ?? true),
    status: (q.status as QuestionStatus) ?? "published",
    order: q.order ?? index,
    createdAt: q.createdAt ?? now,
    updatedAt: q.updatedAt ?? now,
  };
}

/**
 * Load all questions from MySQL via the API.
 */
export async function loadQuestions(): Promise<SurveyQuestion[]> {
  const res = await fetch("/api/survey-questions", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load questions from server.");
  const data = (await res.json()) as { success?: boolean; questions?: SurveyQuestion[] };
  if (!Array.isArray(data.questions)) throw new Error("Invalid response from server.");
  return data.questions.map((q, i) => normalizeQuestion(q, i));
}

/**
 * Get questions filtered by audience and optional section.
 * Always fetches from the server.
 */
export async function getSurveyQuestionsAsync(
  audience: SurveyAudience,
  section?: QuestionSection,
): Promise<SurveyQuestion[]> {
  const params = new URLSearchParams({ audience });
  if (section) params.set("section", section);
  const res = await fetch(`/api/survey-questions?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load questions.");
  const data = (await res.json()) as { questions?: SurveyQuestion[] };
  return (data.questions ?? []).map((q, i) => normalizeQuestion(q, i));
}

/**
 * Get only published/active questions for a given audience.
 */
export async function getPublishedQuestionsAsync(
  audience: SurveyAudience,
  section?: QuestionSection,
): Promise<SurveyQuestion[]> {
  const params = new URLSearchParams({ audience, active_only: "1" });
  if (section) params.set("section", section);
  const res = await fetch(`/api/survey-questions?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load questions.");
  const data = (await res.json()) as { questions?: SurveyQuestion[] };
  return (data.questions ?? [])
    .map((q, i) => normalizeQuestion(q, i))
    .filter((q) => q.status === "published");
}

export async function addSurveyQuestion(
  input: NewSurveyQuestion,
): Promise<SurveyQuestion | null> {
  try {
    const res = await fetch("/api/survey-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: input.text.trim(),
        audience: input.audience,
        section: input.section,
        category: input.category,
        evaluationType: input.evaluationType,
        required: input.required,
        isActive: input.isActive,
        status: input.isActive ? "published" : "draft",
      }),
    });
    const data = (await res.json()) as { success?: boolean; question?: SurveyQuestion };
    if (!res.ok || !data.question) return null;
    return normalizeQuestion(data.question, 0);
  } catch {
    return null;
  }
}

export async function updateSurveyQuestion(
  id: string,
  updates: Partial<Omit<SurveyQuestion, "id" | "createdAt">>,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/survey-questions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteSurveyQuestion(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/survey-questions/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function duplicateSurveyQuestion(
  id: string,
): Promise<SurveyQuestion | null> {
  // Fetch the original from the server
  const res = await fetch("/api/survey-questions", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { questions?: SurveyQuestion[] };
  const original = (data.questions ?? []).find((q) => q.id === id);
  if (!original) return null;

  return addSurveyQuestion({
    text: `${original.text} (copy)`,
    audience: original.audience,
    section: original.section,
    category: original.category,
    evaluationType: original.evaluationType,
    required: original.required,
    isActive: original.isActive,
  });
}

export async function reorderQuestions(orderedIds: string[]): Promise<boolean> {
  try {
    const res = await fetch("/api/survey-questions/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function publishQuestions(audience: SurveyAudience): Promise<boolean> {
  try {
    const res = await fetch("/api/survey-questions/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, status: "published", isActive: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveAsDraft(audience: SurveyAudience): Promise<boolean> {
  try {
    const res = await fetch("/api/survey-questions/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, status: "draft", isActive: false }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getQuestionStats(audience: SurveyAudience) {
  const all = await getSurveyQuestionsAsync(audience);
  const active = all.filter((q) => q.isActive).length;
  const inactive = all.filter((q) => !q.isActive).length;
  const categories = new Set(all.map((q) => q.category)).size;
  const lastUpdated = all.length
    ? [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0].updatedAt
    : null;

  return { total: all.length, active, inactive, categories, lastUpdated };
}

export async function exportQuestionsCSV(audience: SurveyAudience): Promise<string> {
  const questions = await getSurveyQuestionsAsync(audience);
  const headers = ["#", "Text", "Section", "Category", "Type", "Required", "Active", "Status"];
  const rows = questions.map((q, i) => [
    i + 1,
    `"${q.text.replace(/"/g, '""')}"`,
    q.section,
    q.category,
    q.evaluationType,
    q.required ? "Yes" : "No",
    q.isActive ? "Yes" : "No",
    q.status,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export async function importQuestionsCSV(
  csv: string,
  audience: SurveyAudience,
): Promise<number> {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return 0;

  const existing = await getSurveyQuestionsAsync(audience);
  const maxOrder = existing.length > 0
    ? Math.max(...existing.map((q) => q.order))
    : -1;

  const toImport: SurveyQuestion[] = [];
  const now = new Date().toISOString();

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const text = cols[1]?.replace(/^"|"$/g, "").replace(/""/g, '"').trim();
    if (!text) continue;

    toImport.push({
      id: crypto.randomUUID(),
      text,
      audience,
      section: (cols[2]?.trim() as QuestionSection) ?? "scoring",
      category: (cols[3]?.trim() as QuestionCategory) ?? "Other",
      evaluationType: (cols[4]?.trim() as EvaluationType) ?? "rating",
      required: cols[5]?.trim() !== "No",
      isActive: cols[6]?.trim() !== "No",
      status: "draft",
      order: maxOrder + 1 + toImport.length,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (toImport.length === 0) return 0;

  try {
    const res = await fetch("/api/survey-questions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions: toImport }),
    });
    return res.ok ? toImport.length : 0;
  } catch {
    return 0;
  }
}
