export type ScoreLevelKey = 5 | 4 | 3 | 2 | 1 | 0;

export interface ScoreDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
  0: number;
}

export interface TeacherScore {
  id: string;
  name: string;
  department: string;
  overallScore: number;
  evaluationCount: number;
  scoreDistribution: ScoreDistribution;
}

export const maxOverallScore = 5;
