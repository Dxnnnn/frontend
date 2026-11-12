export type SemesterTerm =
  | "1st Semester"
  | "2nd Semester"
  | "Summer"
  | "Quarter 1 & 2"
  | "Quarter 3 & 4"
  | "Quarter 1"
  | "Quarter 2"
  | "Quarter 3"
  | "Quarter 4";

export const SEMESTER_TERMS: SemesterTerm[] = [
  "1st Semester",
  "2nd Semester",
  "Summer",
  "Quarter 1 & 2",
  "Quarter 3 & 4",
  "Quarter 1",
  "Quarter 2",
  "Quarter 3",
  "Quarter 4",
];

/** Terms that are for JH/SHS (quarter-based) */
export const QUARTER_TERMS: SemesterTerm[] = [
  "Quarter 1 & 2",
  "Quarter 3 & 4",
  "Quarter 1",
  "Quarter 2",
  "Quarter 3",
  "Quarter 4",
];

/** Returns true if the term is a quarter (JH/SHS) */
export function isQuarterTerm(term: string): boolean {
  return term.includes("Quarter");
}

export interface Semester {
  id: string;
  schoolYear: string;
  term: SemesterTerm;
  subjects: string[];
  isActive: boolean;
  createdAt: string;
}

export interface NewSemester {
  schoolYear: string;
  term: SemesterTerm;
  subjects: string[];
}
