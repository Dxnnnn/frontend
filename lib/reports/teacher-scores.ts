import type {
  ScoreDistribution,
  ScoreLevelKey,
  TeacherScore,
} from "@/lib/types/teacher-score";
import { scoringScale } from "@/lib/types/survey-question";

export const teacherScores: TeacherScore[] = [
  {
    id: "1",
    name: "Dr. Maria Santos",
    department: "Computer Science",
    overallScore: 4.72,
    evaluationCount: 28,
    scoreDistribution: { 5: 142, 4: 68, 3: 18, 2: 4, 1: 2, 0: 0 },
  },
  {
    id: "2",
    name: "Prof. James Lim",
    department: "Mathematics",
    overallScore: 4.48,
    evaluationCount: 24,
    scoreDistribution: { 5: 98, 4: 82, 3: 34, 2: 12, 1: 4, 0: 0 },
  },
  {
    id: "3",
    name: "Dr. Ana Reyes",
    department: "English",
    overallScore: 4.26,
    evaluationCount: 22,
    scoreDistribution: { 5: 76, 4: 88, 3: 42, 2: 18, 1: 6, 0: 0 },
  },
  {
    id: "4",
    name: "Prof. Carlo Mendoza",
    department: "Business",
    overallScore: 4.02,
    evaluationCount: 20,
    scoreDistribution: { 5: 58, 4: 72, 3: 56, 2: 26, 1: 8, 0: 2 },
  },
  {
    id: "5",
    name: "Dr. Elena Cruz",
    department: "Nursing",
    overallScore: 4.64,
    evaluationCount: 26,
    scoreDistribution: { 5: 118, 4: 74, 3: 22, 2: 8, 1: 2, 0: 0 },
  },
  {
    id: "6",
    name: "Prof. Mark Villanueva",
    department: "Engineering",
    overallScore: 3.86,
    evaluationCount: 18,
    scoreDistribution: { 5: 42, 4: 64, 3: 58, 2: 32, 1: 10, 0: 4 },
  },
];

export interface ScoreSlice {
  value: ScoreLevelKey;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const sliceColors: Record<ScoreLevelKey, string> = {
  5: "#059669",
  4: "#10b981",
  3: "#3b82f6",
  2: "#f59e0b",
  1: "#94a3b8",
  0: "#64748b",
};

export function getCombinedScoreDistribution(): ScoreDistribution {
  return teacherScores.reduce(
    (combined, teacher) => ({
      5: combined[5] + teacher.scoreDistribution[5],
      4: combined[4] + teacher.scoreDistribution[4],
      3: combined[3] + teacher.scoreDistribution[3],
      2: combined[2] + teacher.scoreDistribution[2],
      1: combined[1] + teacher.scoreDistribution[1],
      0: combined[0] + teacher.scoreDistribution[0],
    }),
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 },
  );
}

export function getTotalResponses(distribution: ScoreDistribution): number {
  return (
    distribution[5] +
    distribution[4] +
    distribution[3] +
    distribution[2] +
    distribution[1] +
    distribution[0]
  );
}

export function getOverallAverageScore(): number {
  const distribution = getCombinedScoreDistribution();
  const total = getTotalResponses(distribution);

  if (total === 0) {
    return 0;
  }

  const weightedTotal =
    distribution[5] * 5 +
    distribution[4] * 4 +
    distribution[3] * 3 +
    distribution[2] * 2 +
    distribution[1] * 1 +
    distribution[0] * 0;

  return weightedTotal / total;
}

export function getScoreSlices(distribution: ScoreDistribution): ScoreSlice[] {
  const total = getTotalResponses(distribution);

  return scoringScale.map((level) => {
    const value = level.value as ScoreLevelKey;
    const count = distribution[value];

    return {
      value,
      label: level.label,
      count,
      percentage: total === 0 ? 0 : (count / total) * 100,
      color: sliceColors[value],
    };
  });
}
