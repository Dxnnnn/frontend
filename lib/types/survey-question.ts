export type SurveyAudience = "student" | "school_head";

export type StudentLevel = "all" | "junior-high" | "senior-high" | "college";

export type QuestionSection = "scoring" | "personal";

export type QuestionCategory =
  | "Instructional Design"
  | "Delivery of Instruction"
  | "Evaluation"
  | "Communication"
  | "Classroom Management"
  | "Personal and Professional Qualities"
  | "Others";

export type EvaluationType = "rating" | "essay" | "yes_no";

export type QuestionStatus = "published" | "draft";

export interface SurveyQuestion {
  id: string;
  text: string;
  audience: SurveyAudience;
  studentLevel: StudentLevel;
  section: QuestionSection;
  category: QuestionCategory;
  evaluationType: EvaluationType;
  required: boolean;
  isActive: boolean;
  status: QuestionStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewSurveyQuestion {
  text: string;
  audience: SurveyAudience;
  studentLevel: StudentLevel;
  section: QuestionSection;
  category: QuestionCategory;
  evaluationType: EvaluationType;
  required: boolean;
  isActive: boolean;
}

export interface ScoreLevel {
  value: number;
  label: string;
  description: string;
}

export const scoringScale: ScoreLevel[] = [
  { value: 5, label: "Excellent", description: "Highest score" },
  { value: 4, label: "Very Good", description: "Above average" },
  { value: 3, label: "Good", description: "Average" },
  { value: 2, label: "Fair", description: "Below average" },
  { value: 1, label: "Poor", description: "Low score" },
];

/** School head uses a different rating scale based on observation frequency */
export const schoolHeadScoringScale: ScoreLevel[] = [
  { value: 5, label: "Very True",       description: "Behavior is consistently observed" },
  { value: 4, label: "True",            description: "Behavior is frequently observed" },
  { value: 3, label: "Somewhat True",   description: "Behavior is moderately observed" },
  { value: 2, label: "Somewhat Untrue", description: "Behavior is seldom observed" },
  { value: 1, label: "Very Untrue",     description: "Behavior is not observed at all" },
];

export const questionSectionLabels: Record<QuestionSection, string> = {
  scoring: "Scoring scale",
  personal: "Personal questionnaire",
};

export const questionCategories: QuestionCategory[] = [
  "Instructional Design",
  "Delivery of Instruction",
  "Evaluation",
  "Communication",
  "Classroom Management",
  "Personal and Professional Qualities",
  "Others",
];

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  rating: "Rating (0–5)",
  essay: "Essay",
  yes_no: "Yes / No",
};

export const studentLevelLabels: Record<StudentLevel, string> = {
  "all": "All Students",
  "junior-high": "Junior High School",
  "senior-high": "Senior High School",
  "college": "College",
};

export const categoryColors: Record<QuestionCategory, string> = {
  "Instructional Design": "bg-blue-100 text-blue-700",
  "Delivery of Instruction": "bg-indigo-100 text-indigo-700",
  "Evaluation": "bg-pink-100 text-pink-700",
  "Communication": "bg-emerald-100 text-emerald-700",
  "Classroom Management": "bg-orange-100 text-orange-700",
  "Personal and Professional Qualities": "bg-violet-100 text-violet-700",
  "Others": "bg-slate-100 text-slate-600",
};
