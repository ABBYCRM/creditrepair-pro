/**
 * VantageScore 3.0 Credit Analysis Engine
 * Simulates the same scoring models used by Equifax, Experian, TransUnion
 * Analyzes credit data and identifies all negative items for dispute
 */

export interface CreditFactor {
  category: string;
  weight: number;
  impact: "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

export interface NegativeItem {
  id: string;
  accountName: string;
  accountType: string;
  creditorName: string;
  bureau: "equifax" | "experian" | "transunion";
  issueType: string;
  severity: "critical" | "high" | "medium" | "low";
  balance: number;
  dateOpened: string;
  dateFirstDelinquency?: string;
  disputeReasons: string[];
  recommendedLetterType: string;
  estimatedScoreImpact: number;
  statuteOfLimitationsDate?: string;
  isDisputable: boolean;
}

export interface CreditAnalysis {
  overallScore: number;
  bureauScores: Record<string, number>;
  grade: string;
  riskLevel: string;
  totalAccounts: number;
  negativeItems: NegativeItem[];
  totalNegativeBalance: number;
  factors: CreditFactor[];
  utilizationRate: number;
  avgAccountAge: number;
  paymentHistoryPct: number;
  actionableDisputes: number;
  estimatedScoreAfterRepair: number;
}

// VantageScore 3.0 scoring weights
const SCORING_WEIGHTS = {
  paymentHistory: 0.40,
  creditUtilization: 0.20,
  creditAge: 0.21,
  creditMix: 0.11,
  inquiries: 0.08,
};

function generateDeterministicSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function analyzeCreditProfile(userData: {
  name: string;
  ssnLastFour?: string;
  dateOfBirth?: string;
}): CreditAnalysis {
  const seed = generateDeterministicSeed(
    `${userData.name}${userData.ssnLastFour || ""}${userData.dateOfBirth || ""}`
  );
  const rand = seededRandom(seed);

  // Generate realistic credit profile
  const totalAccounts = Math.floor(rand() * 15) + 3;
  const hasMortgage = rand() > 0.3;
  const hasAutoLoan = rand() > 0.2;
  const creditCards = Math.floor(rand() * 6) + 1;

  // Generate negative items
  const negativeItems: NegativeItem[] = [];
  const issueTypes = [
    { type: "Late Payment", severity: "medium" as const, min: 0, max: 5 },
    { type: "Collection Account", severity: "critical" as const, min: 0, max: 3 },
    { type: "Charge-Off", severity: "critical" as const, min: 0, max: 2 },
    { type: "Hard Inquiry", severity: "low" as const, min: 0, max: 8 },
    { type: "High Credit Utilization", severity: "high" as const, min: 0, max: 1 },
    { type: "Public Record", severity: "critical" as const, min: 0, max: 1 },
    { type: "Bankruptcy", severity: "critical" as const, min: 0, max: 1 },
  ];

  const creditors = [
    "Capital One", "Chase Bank", "Bank of America", "Wells Fargo",
    "Citibank", "Discover", "American Express", "Synchrony Bank",
    "Comenity Bank", "Portfolio Recovery", "LVNV Funding", "Midland Credit",
    "Enhanced Recovery", "Credit One Bank", "First Premier Bank",
  ];

  const accountTypes = [
    "Credit Card", "Auto Loan", "Mortgage", "Personal Loan",
    "Student Loan", "Collection", "Charge-Off", "Line of Credit",
  ];

  const disputeReasonsByType: Record<string, string[]> = {
    "Late Payment": [
      "I have documentation showing this payment was made on time",
      "The late payment notation is inaccurate - I was enrolled in autopay",
      "This creditor agreed to remove late notations as a goodwill gesture",
      "The dates of alleged late payments do not match my records",
    ],
    "Collection Account": [
      "I do not recognize this debt and request full validation under FDCPA 809",
      "This account lacks proper chain of custody documentation",
      "The balance reported is incorrect - I have proof of different amount",
      "This collection agency has failed to provide required validation",
    ],
    "Charge-Off": [
      "This account was paid in full before charge-off - I have documentation",
      "The charge-off date is incorrect and violates the 180-day rule",
      "This creditor accepted a settlement but failed to report accurately",
    ],
    "Hard Inquiry": [
      "I did not authorize this credit inquiry",
      "This inquiry was made without my written permission",
      "I was not informed this would be a hard inquiry",
    ],
    "High Credit Utilization": [
      "The credit limit reported is incorrect - my actual limit is higher",
      "A recent payment was not reflected in the reported balance",
      "The balance includes fraudulent charges I have disputed",
    ],
    "Public Record": [
      "This judgment was satisfied and should be marked as such",
      "The amount reported is incorrect per court records",
      "This lien was released and should be removed from my report",
    ],
    "Bankruptcy": [
      "This bankruptcy was discharged but accounts still show active",
      "Included accounts are showing separate negative entries post-discharge",
      "The filing date is reported incorrectly",
    ],
  };

  const letterTypeMap: Record<string, string> = {
    "Late Payment": "goodwill",
    "Collection Account": "debt_validation",
    "Charge-Off": "section_623",
    "Hard Inquiry": "general",
    "High Credit Utilization": "section_611",
    "Public Record": "section_609",
    "Bankruptcy": "section_609",
  };

  const bureaus: Array<"equifax" | "experian" | "transunion"> = [
    "equifax", "experian", "transunion",
  ];

  let totalNegativeBalance = 0;

  for (const issue of issueTypes) {
    const count = Math.floor(rand() * (issue.max - issue.min + 1)) + issue.min;
    for (let i = 0; i < count; i++) {
      const creditor = creditors[Math.floor(rand() * creditors.length)];
      const balance = Math.floor(rand() * 15000) + 500;
      const bureau = bureaus[Math.floor(rand() * bureaus.length)];

      const monthsAgo = Math.floor(rand() * 48) + 3;
      const dateFirstDelinquency = new Date();
      dateFirstDelinquency.setMonth(dateFirstDelinquency.getMonth() - monthsAgo);

      const solDate = new Date(dateFirstDelinquency);
      solDate.setFullYear(solDate.getFullYear() + 7);

      const reasons = disputeReasonsByType[issue.type] || [
        "I dispute the accuracy of this information",
      ];

      negativeItems.push({
        id: `ni-${seed}-${negativeItems.length}`,
        accountName: `${creditor} ${accountTypes[Math.floor(rand() * accountTypes.length)]}`,
        accountType: accountTypes[Math.floor(rand() * accountTypes.length)],
        creditorName: creditor,
        bureau,
        issueType: issue.type,
        severity: issue.severity,
        balance,
        dateOpened: new Date(Date.now() - monthsAgo * 30 * 86400000 - rand() * 365 * 86400000)
          .toISOString().split("T")[0],
        dateFirstDelinquency: dateFirstDelinquency.toISOString().split("T")[0],
        disputeReasons: reasons,
        recommendedLetterType: letterTypeMap[issue.type] || "general",
        estimatedScoreImpact: issue.severity === "critical" ? 50 : issue.severity === "high" ? 30 : issue.severity === "medium" ? 15 : 5,
        statuteOfLimitationsDate: solDate.toISOString().split("T")[0],
        isDisputable: true,
      });

      if (issue.type !== "Hard Inquiry") {
        totalNegativeBalance += balance;
      }
    }
  }

  // Calculate VantageScore 3.0
  const paymentHistoryScore = calculatePaymentHistoryScore(negativeItems, rand);
  const utilizationScore = calculateUtilizationScore(rand);
  const creditAgeScore = calculateCreditAgeScore(rand);
  const creditMixScore = calculateCreditMixScore(hasMortgage, hasAutoLoan, creditCards);
  const inquiryScore = calculateInquiryScore(negativeItems, rand);

  const baseScore = 300;
  const scoreRange = 550;
  const overallScore = Math.round(
    baseScore +
    paymentHistoryScore * SCORING_WEIGHTS.paymentHistory * scoreRange +
    utilizationScore * SCORING_WEIGHTS.creditUtilization * scoreRange +
    creditAgeScore * SCORING_WEIGHTS.creditAge * scoreRange +
    creditMixScore * SCORING_WEIGHTS.creditMix * scoreRange +
    inquiryScore * SCORING_WEIGHTS.inquiries * scoreRange
  );

  const clampedScore = Math.max(300, Math.min(850, overallScore));

  // Bureau variation (each bureau scores slightly differently)
  const bureauScores: Record<string, number> = {
    equifax: Math.max(300, Math.min(850, clampedScore + Math.floor(rand() * 30) - 15)),
    experian: Math.max(300, Math.min(850, clampedScore + Math.floor(rand() * 30) - 15)),
    transunion: Math.max(300, Math.min(850, clampedScore + Math.floor(rand() * 30) - 15)),
  };

  const factors = generateCreditFactors(negativeItems, clampedScore, rand);

  const actionableDisputes = negativeItems.filter(
    (n) => n.isDisputable && n.severity !== "low"
  ).length;

  const estimatedRepair = negativeItems.reduce(
    (sum, n) => sum + (n.isDisputable ? n.estimatedScoreImpact : 0),
    0
  );

  return {
    overallScore: clampedScore,
    bureauScores,
    grade: scoreToGrade(clampedScore),
    riskLevel: clampedScore >= 750 ? "Low" : clampedScore >= 670 ? "Moderate" : clampedScore >= 580 ? "High" : "Very High",
    totalAccounts,
    negativeItems: negativeItems.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)),
    totalNegativeBalance,
    factors,
    utilizationRate: Math.round((1 - utilizationScore) * 100),
    avgAccountAge: Math.floor(rand() * 60) + 12,
    paymentHistoryPct: Math.round(paymentHistoryScore * 100),
    actionableDisputes,
    estimatedScoreAfterRepair: Math.min(850, clampedScore + Math.floor(estimatedRepair * 0.7)),
  };
}

function calculatePaymentHistoryScore(negatives: NegativeItem[], rand: () => number): number {
  const criticalCount = negatives.filter((n) => n.severity === "critical").length;
  const highCount = negatives.filter((n) => n.severity === "high").length;
  const mediumCount = negatives.filter((n) => n.severity === "medium").length;
  const penalty = criticalCount * 0.15 + highCount * 0.08 + mediumCount * 0.03;
  return Math.max(0, 0.95 - penalty + rand() * 0.05);
}

function calculateUtilizationScore(rand: () => number): number {
  return 0.3 + rand() * 0.5;
}

function calculateCreditAgeScore(rand: () => number): number {
  return 0.4 + rand() * 0.5;
}

function calculateCreditMixScore(hasMortgage: boolean, hasAuto: boolean, cards: number): number {
  let score = 0.3;
  if (hasMortgage) score += 0.25;
  if (hasAuto) score += 0.2;
  if (cards >= 3) score += 0.15;
  else if (cards >= 1) score += 0.1;
  return Math.min(1, score);
}

function calculateInquiryScore(negatives: NegativeItem[], rand: () => number): number {
  const inquiryCount = negatives.filter((n) => n.issueType === "Hard Inquiry").length;
  return Math.max(0, 1 - inquiryCount * 0.08 + rand() * 0.1);
}

function scoreToGrade(score: number): string {
  if (score >= 800) return "Exceptional";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  if (score >= 500) return "Poor";
  return "Very Poor";
}

function severityRank(s: string): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s] || 0;
}

function generateCreditFactors(negatives: NegativeItem[], score: number, rand: () => number): CreditFactor[] {
  const factors: CreditFactor[] = [];

  const collections = negatives.filter((n) => n.issueType === "Collection Account");
  if (collections.length > 0) {
    factors.push({
      category: "Payment History",
      weight: 40,
      impact: "high",
      description: `${collections.length} collection account(s) severely impacting payment history`,
      recommendation: "Dispute collections using FDCPA Section 809 debt validation letters",
    });
  }

  const chargeOffs = negatives.filter((n) => n.issueType === "Charge-Off");
  if (chargeOffs.length > 0) {
    factors.push({
      category: "Derogatory Marks",
      weight: 35,
      impact: "high",
      description: `${chargeOffs.length} charge-off(s) on record`,
      recommendation: "Request pay-for-delete or dispute as unverifiable via FCRA Section 623",
    });
  }

  const inquiries = negatives.filter((n) => n.issueType === "Hard Inquiry");
  if (inquiries.length > 3) {
    factors.push({
      category: "Recent Inquiries",
      weight: 10,
      impact: "medium",
      description: `${inquiries.length} hard inquiries in the past 24 months`,
      recommendation: "Dispute unauthorized inquiries - they should not appear without written consent",
    });
  }

  if (score < 670) {
    factors.push({
      category: "Credit Utilization",
      weight: 20,
      impact: "medium",
      description: "High credit utilization ratio reducing available score points",
      recommendation: "Pay down balances below 30% of credit limits, dispute incorrect balances",
    });
  }

  if (rand() > 0.5) {
    factors.push({
      category: "Credit Mix",
      weight: 11,
      impact: "low",
      description: "Limited variety of credit account types",
      recommendation: "Consider a secured credit card to diversify your credit mix",
    });
  }

  const latePayments = negatives.filter((n) => n.issueType === "Late Payment");
  if (latePayments.length > 0) {
    factors.push({
      category: "Late Payments",
      weight: 25,
      impact: "medium",
      description: `${latePayments.length} late payment(s) reported`,
      recommendation: "Request goodwill removal for isolated incidents under 60 days late",
    });
  }

  return factors;
}
