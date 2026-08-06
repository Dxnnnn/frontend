/**
 * Resolve the official "Prepared by" title for a school-head/dean based on department scope.
 *
 * - College            → Dean
 * - Senior High School → School Head of Senior High School
 * - Elementary / JH    → School Head of Elementary and Junior High School
 */
export function getPreparerTitle(department?: string | null): string {
  const d = (department ?? "").trim().toLowerCase();

  if (!d) return "School Head";

  if (d.includes("college")) {
    return "Dean";
  }

  if (d.includes("senior high") || d.includes("senior-high") || d.includes("shs")) {
    return "School Head of Senior High School";
  }

  if (
    d.includes("elementary") ||
    d.includes("junior high") ||
    d.includes("junior-high") ||
    d.includes("elem")
  ) {
    return "School Head of Elementary and Junior High School";
  }

  return "School Head";
}
