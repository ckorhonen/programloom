import type { Review, RubricCriterion } from "./types";

export interface AggregateScore {
  reviewCount: number;
  abstentionCount: number;
  weightedAverage: number | null;
  criterionAverages: Record<string, number>;
}

export function calculateReviewScore(criteria: RubricCriterion[], review: Review): number | null {
  if (review.abstained) return null;
  const weights = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (weights <= 0) return null;
  let weighted = 0;
  for (const criterion of criteria) {
    const score = review.scores.find((item) => item.criterionKey === criterion.key)?.score;
    if (typeof score !== "number") return null;
    weighted += (score / criterion.maxScore) * criterion.weight;
  }
  return round((weighted / weights) * 100);
}

export function aggregateScores(criteria: RubricCriterion[], reviews: Review[]): AggregateScore {
  const counted = reviews.filter((review) => !review.abstained);
  const reviewScores = counted
    .map((review) => calculateReviewScore(criteria, review))
    .filter((score): score is number => score !== null);
  const criterionAverages: Record<string, number> = {};
  for (const criterion of criteria) {
    const scores = counted
      .map((review) => review.scores.find((item) => item.criterionKey === criterion.key)?.score)
      .filter((score): score is number => typeof score === "number");
    if (scores.length > 0) {
      criterionAverages[criterion.key] = round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length,
      );
    }
  }

  return {
    reviewCount: reviewScores.length,
    abstentionCount: reviews.length - counted.length,
    weightedAverage:
      reviewScores.length === 0
        ? null
        : round(reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length),
    criterionAverages,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
