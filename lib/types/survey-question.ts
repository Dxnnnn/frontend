export type SurveyAudience = "student" | "school_head";

export type QuestionSection = "scoring" | "personal";

export type QuestionCategory =
  | "Instructional Competence"
  | "Professionalism"
  | "Communication"
  | "Classroom Management"
  | "Assessment"
  | "Other";

export type EvaluationType = "rating" | "essay" | "yes_no";

export type QuestionStatus = "published" | "draft";

export interface SurveyQuestion {
  id: string;
  text: string;
  audience: SurveyAudience;
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

export const questionSectionLabels: Record<QuestionSection, string> = {
  scoring: "Scoring scale",
  personal: "Personal questionnaire",
};

export const questionCategories: QuestionCategory[] = [
  "Instructional Competence",
  "Professionalism",
  "Communication",
  "Classroom Management",
  "Assessment",
  "Other",
];

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  rating: "Rating (0–5)",
  essay: "Essay",
  yes_no: "Yes / No",
};

export const categoryColors: Record<QuestionCategory, string> = {
  "Instructional Competence": "bg-blue-100 text-blue-700",
  "Professionalism": "bg-violet-100 text-violet-700",
  "Communication": "bg-emerald-100 text-emerald-700",
  "Classroom Management": "bg-orange-100 text-orange-700",
  "Assessment": "bg-pink-100 text-pink-700",
  "Other": "bg-slate-100 text-slate-600",
};
