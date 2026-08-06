export type SemesterTerm = "1st Semester" | "2nd Semester" | "Summer";

export const SEMESTER_TERMS: SemesterTerm[] = [
  "1st Semester",
  "2nd Semester",
  "Summer",
];

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
