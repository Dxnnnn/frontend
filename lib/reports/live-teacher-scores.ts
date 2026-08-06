import { getEvaluationSubmissionsAsync } from "@/lib/user/evaluation-submissions";
import type { ScoreDistribution, ScoreLevelKey, TeacherScore } from "@/lib/types/teacher-score";
import type { EvaluationSubmission } from "@/lib/types/evaluation-submission";

function buildTeacherScores(submissions: EvaluationSubmission[]): TeacherScore[] {
  if (submissions.length === 0) return [];

  const grouped = new Map<string, EvaluationSubmission[]>();
  for (const sub of submissions) {
    const existing = grouped.get(sub.facultyId) ?? [];
    existing.push(sub);
    grouped.set(sub.facultyId, existing);
  }

  const scores: TeacherScore[] = [];
  for (const [facultyId, subs] of grouped) {
    const first = subs[0];
    const distribution: ScoreDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    let totalScore = 0;
    let totalAnswers = 0;

    for (const sub of subs) {
      for (const v of Object.values(sub.scoringAnswers)) {
        const rounded = Math.round(v) as ScoreLevelKey;
        const key = (rounded >= 0 && rounded <= 5 ? rounded : 0) as ScoreLevelKey;
        distribution[key] = (distribution[key] ?? 0) + 1;
        totalScore += v;
        totalAnswers += 1;
      }
    }

    scores.push({
      id: facultyId,
      name: first.facultyName,
      department: first.department,
      overallScore: totalAnswers > 0 ? totalScore / totalAnswers : 0,
      evaluationCount: subs.length,
      scoreDistribution: distribution,
    });
  }

  return scores.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Fetch all submissions from MySQL and compute teacher scores.
 */
export async function getLiveTeacherScoresAsync(): Promise<TeacherScore[]> {
  const submissions = await getEvaluationSubmissionsAsync();
  return buildTeacherScores(submissions);
}

/**
 * Compute combined score distribution from MySQL submissions.
 */
export async function getLiveCombinedDistributionAsync(): Promise<ScoreDistribution> {
  const scores = await getLiveTeacherScoresAsync();
  return scores.reduce(
    (acc, t) => ({
      5: acc[5] + t.scoreDistribution[5],
      4: acc[4] + t.scoreDistribution[4],
      3: acc[3] + t.scoreDistribution[3],
      2: acc[2] + t.scoreDistribution[2],
      1: acc[1] + t.scoreDistribution[1],
      0: acc[0] + t.scoreDistribution[0],
    }),
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 },
  );
}

// ── Sync bridges kept for legacy callers ──────────────────────────────────────

let _scoresCache: TeacherScore[] = [];
let _distCache: ScoreDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };

export function getLiveTeacherScores(): TeacherScore[] {
  return _scoresCache;
}

export function getLiveCombinedDistribution(): ScoreDistribution {
  return _distCache;
}

/**
 * Refresh the in-memory cache from MySQL. Call this in useEffect.
 */
export async function refreshLiveScores(): Promise<void> {
  const [scores, dist] = await Promise.all([
    getLiveTeacherScoresAsync(),
    getLiveCombinedDistributionAsync(),
  ]);
  _scoresCache = scores;
  _distCache = dist;
}
