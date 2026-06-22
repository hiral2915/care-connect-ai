/**
 * CareConnect AI — NGO Patient Priority Scoring Service
 *
 * This mirrors the explainable scoring algorithm already present in the
 * frontend (/src/routes/ai-prioritization.tsx) so scores are consistent
 * whether calculated client-side or persisted server-side.
 *
 * Score range: 0–100
 * Labels: high (≥70), medium (40–69), low (<40)
 * Subsidy: high→90%, medium→60%, low→30%
 */

const EMPLOYMENT_WEIGHT = {
  employed: 0.4,
  self: 0.6,
  informal: 0.85,
  unemployed: 1.0,
};

const DISABILITY_WEIGHT = {
  none: 0,
  partial: 0.6,
  severe: 1.0,
};

/**
 * Calculate priority score and label.
 *
 * @param {object} input
 * @param {number}  input.income           - Monthly household income (INR)
 * @param {number}  input.family_size       - Number of dependents
 * @param {string}  input.employment_status - employed | self | unemployed | informal
 * @param {number}  input.medical_urgency   - 1–10
 * @param {number}  input.age
 * @param {string}  input.disability        - none | partial | severe
 * @returns {{ score: number, label: string, subsidy_pct: number, factors: object[] }}
 */
function calculatePriority(input) {
  const {
    income,
    family_size,
    employment_status,
    medical_urgency,
    age,
    disability = "none",
  } = input;

  // Per-capita income (lower income → higher need). Normalise against 8 000 INR/person.
  const perCapita = income / Math.max(1, family_size);
  const incomeScore = Math.max(0, Math.min(1, 1 - perCapita / 8000));

  const familyScore     = Math.min(1, family_size / 8);
  const employmentScore = EMPLOYMENT_WEIGHT[employment_status] ?? 0.5;
  const urgencyScore    = Math.min(1, Math.max(0, medical_urgency / 10));
  const ageScore        = age <= 12 ? 1 : age >= 60 ? 0.9 : 0.3;
  const disabilityScore = DISABILITY_WEIGHT[disability] ?? 0;

  const factors = [
    { key: "Income (per-capita)",  value: incomeScore,     weight: 0.30 },
    { key: "Medical urgency",      value: urgencyScore,    weight: 0.25 },
    { key: "Disability",           value: disabilityScore, weight: 0.15 },
    { key: "Employment",           value: employmentScore, weight: 0.12 },
    { key: "Family size",          value: familyScore,     weight: 0.10 },
    { key: "Age vulnerability",    value: ageScore,        weight: 0.08 },
  ];

  const raw   = factors.reduce((acc, f) => acc + f.value * f.weight, 0);
  const score = Math.round(raw * 100 * 10) / 10; // round to 1 dp

  const label =
    score >= 70 ? "high" :
    score >= 40 ? "medium" : "low";

  const subsidy_pct =
    label === "high"   ? 90 :
    label === "medium" ? 60 : 30;

  return {
    score,
    label,
    subsidy_pct,
    factors: factors.map((f) => ({
      key:         f.key,
      score:       Math.round(f.value * f.weight * 100 * 10) / 10,
      raw_value:   Math.round(f.value * 100),
      weight_pct:  Math.round(f.weight * 100),
    })),
  };
}

module.exports = { calculatePriority };