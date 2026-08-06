export interface EvaluationSubmission {
  id: string;
  studentId?: string;
  studentName?: string;
  facultyId: string;
  facultyName: string;
  department: string;
  subject: string;
  semester?: string;
  remarks?: string;
  scoringAnswers: Record<string, number>;
  personalAnswers: Record<string, number>;
  submittedAt: string;
  /** "student" | "school_head" — populated by the backend */
  source?: string;
}

export interface NewEvaluationSubmission {
  studentId?: string;
  studentName?: string;
  facultyId: string;
  facultyName: string;
  department: string;
  subject: string;
  semester?: string;
  remarks?: string;
  scoringAnswers: Record<string, number>;
  personalAnswers: Record<string, number>;
}
