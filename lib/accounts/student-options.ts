export type StudentLevel =
  | "elementary"
  | "junior-high"
  | "senior-high"
  | "college";

export const STUDENT_LEVEL_OPTIONS: {
  id: StudentLevel;
  label: string;
  createLabel: string;
}[] = [
  {
    id: "junior-high",
    label: "Junior High",
    createLabel: "Create Junior High Student",
  },
  {
    id: "senior-high",
    label: "Senior High",
    createLabel: "Create Senior High Student",
  },
  {
    id: "college",
    label: "College",
    createLabel: "Create College Student",
  },
];

export const SENIOR_HIGH_STRANDS = [
  "STEM",
  "HUMSS",
  "ABM",
  "GAS",
  "TVL",
] as const;

export type SeniorHighStrand = (typeof SENIOR_HIGH_STRANDS)[number];

export const COLLEGE_COURSES = [
  "BSIT",
  "BSCS",
  "BSHM",
  "BSBA",
  "BSED",
] as const;

export type CollegeCourse = (typeof COLLEGE_COURSES)[number];

export const ELEMENTARY_GRADES = ["1", "2", "3", "4", "5", "6"] as const;

export const JUNIOR_HIGH_GRADES = ["7", "8", "9", "10"] as const;

export const SENIOR_HIGH_GRADES = ["11", "12"] as const;

export const COLLEGE_YEAR_LEVELS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
] as const;

export type CollegeYearLevel = (typeof COLLEGE_YEAR_LEVELS)[number];

export const STUDENT_SECTIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
] as const;

export type StudentSection = (typeof STUDENT_SECTIONS)[number];

export function getGradesForLevel(level: StudentLevel): readonly string[] {
  switch (level) {
    case "elementary":
      return ELEMENTARY_GRADES;
    case "junior-high":
      return JUNIOR_HIGH_GRADES;
    case "senior-high":
      return SENIOR_HIGH_GRADES;
    default:
      return [];
  }
}

export function formatStudentDetails(account: {
  studentLevel?: StudentLevel;
  grade?: string;
  yearLevel?: string;
  section?: string;
  strand?: string;
  course?: string;
}): string {
  const parts: string[] = [];

  if (account.studentLevel === "college") {
    if (account.yearLevel) {
      parts.push(account.yearLevel);
    }
    if (account.course) {
      parts.push(account.course);
    }
  } else {
    if (account.grade) {
      parts.push(`Grade ${account.grade}`);
    }
    if (account.strand) {
      parts.push(account.strand);
    }
  }

  if (account.section) {
    parts.push(`Section ${account.section}`);
  }

  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function getStudentLevelLabel(level?: StudentLevel): string {
  if (!level) {
    return "—";
  }

  return (
    STUDENT_LEVEL_OPTIONS.find((option) => option.id === level)?.label ?? level
  );
}
