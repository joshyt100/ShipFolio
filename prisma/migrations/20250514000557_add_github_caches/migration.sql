-- CreateTable
CREATE TABLE "GitHubStatsCache" (
    "username" TEXT NOT NULL,
    "profileData" JSONB NOT NULL,
    "basicStats" JSONB NOT NULL,
    "topLanguages" JSONB NOT NULL,
    "contributionBreakdown" JSONB NOT NULL,
    "activityStats" JSONB NOT NULL,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubStatsCache_pkey" PRIMARY KEY ("username")
);

-- CreateTable
CREATE TABLE "GitHubPRsCache" (
    "username" TEXT NOT NULL,
    "prs" JSONB NOT NULL,
    "lastFetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubPRsCache_pkey" PRIMARY KEY ("username")
);
