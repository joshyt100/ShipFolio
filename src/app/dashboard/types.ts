import type React from "react";

// --- Core Data Structures for UI ---

export interface Block {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  colorIndex: number;
}

export interface UserProfile {
  followers: number;
  public_gists: number;
  public_repos: number;
  avatar_url: string | null;
  name: string | null;
  bio: string | null;
  login: string;
  createdAt: string; // ISO 8601 date string
}

export interface PullRequest {
  id: number; // databaseId from GraphQL
  title: string;
  number: number;
  url: string;
  state: "open" | "closed" | "merged"; // Transformed from GraphQL state
  createdAt: string; // ISO 8601 date string
  repository: {
    name: string; // Transformed from nameWithOwner
    url: string;
  };
  user: { // Corresponds to 'author' in GraphQL
    login: string;
    avatar_url: string;
  };
  commentsCount: number; // NEW: Total comments on the PR
  approvedReviewsCount: number; // NEW: Total approved reviews
}

export interface VirtualizedPRItem extends PullRequest {
  id_str: string; // String version of id for DND kit or other libraries
}

export type PRState = PullRequest["state"];

export interface LanguageStat {
  name: string;
  size: number;
  color: string | null;
  percentage: number;
}

export interface ContributionTypeStat {
  type: "commits" | "pullRequests" | "reviews" | "issues";
  label: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  colorClass: string;
}

// --- GraphQL Response Structures ---
// These usually map directly to what the GitHub GraphQL API returns.
// Transformation into the UI-facing types (like PullRequest above) happens after fetching.

export interface GraphQLLanguageEdge {
  size: number;
  node: {
    name: string;
    color: string | null;
  };
}
export interface GraphQLRepositoryNodeForStats {
  stargazerCount: number;
  forkCount: number;
  languages: {
    edges: GraphQLLanguageEdge[] | null;
  } | null;
}

export interface GraphQLContributionsCollection {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
}

export interface GraphQLUserStatsData {
  user: {
    name: string | null;
    login: string;
    bio: string | null;
    avatarUrl: string;
    createdAt: string; // ISO 8601 date string
    followers: { totalCount: number };
    gists: { totalCount: number };
    repositories: {
      totalCount: number;
      nodes: GraphQLRepositoryNodeForStats[] | null;
    };
    contributionsCollection: GraphQLContributionsCollection | null;
  } | null;
}

export interface GraphQLSearchEdge<TNode> {
  node: TNode;
}

export interface GraphQLPullRequestNode {
  id: string; // GraphQL node ID
  databaseId: number | null; // The numeric ID
  title: string;
  number: number;
  url: string;
  state: "OPEN" | "CLOSED" | "MERGED"; // Raw state from GitHub
  createdAt: string; // ISO 8601 date string
  merged: boolean;
  repository: {
    nameWithOwner: string; // e.g., "owner/repo"
    url: string;
  };
  author: {
    login: string;
    avatarUrl: string;
  } | null;
  comments: { // NEW: For comments count
    totalCount: number;
  };
  reviews: { // NEW: For approved reviews count
    totalCount: number;
  } | null; // reviews can be null if no reviews match the criteria
}

export interface GraphQLUserPullRequestsData {
  search: {
    issueCount: number;
    edges: GraphQLSearchEdge<GraphQLPullRequestNode>[] | null;
  };
}




// --- Constants ---
export const PR_LIST_STORAGE_KEY = "dashboardVPRListOrder_v3_graphql";
export const PR_ITEM_ESTIMATED_HEIGHT = 128; // px
export const MAX_TOP_LANGUAGES_DISPLAY = 6;

export const GITHUB_CALENDAR_LIGHT_THEME_COLORS: [string, string, string, string, string] = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
export const GITHUB_CALENDAR_DARK_THEME_COLORS: [string, string, string, string, string] = ["#010409", "#0e4429", "#006d32", "#26a641", "#39d353"];

// --- GraphQL Queries ---
export const USER_STATS_QUERY = `
  query UserStats($username: String!) {
    user(login: $username) {
      name
      login
      bio
      avatarUrl
      createdAt
      followers {
        totalCount
      }
      gists(privacy: PUBLIC) {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          stargazerCount
          forkCount
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
      contributionsCollection { # For Contribution Breakdown (defaults to last year)
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

export const USER_PULL_REQUESTS_QUERY = `
  query UserPullRequests($searchQueryString: String!, $first: Int = 15) {
    search(query: $searchQueryString, type: ISSUE, first: $first) {
      issueCount
      edges {
        node {
          ... on PullRequest {
            id
            databaseId
            title
            number
            url
            state
            createdAt
            merged
            repository {
              nameWithOwner
              url
            }
            author {
              login
              avatarUrl
            }
            comments { # NEW: Fetch total comments
              totalCount
            }
            reviews(states: APPROVED, first: 0) { # NEW: Fetch total approved reviews (first: 0 is ok for just totalCount)
              totalCount
            }
          }
        }
      }
    }
  }
`;

// Helper function (example) to transform GraphQL PR data to your UI PullRequest type
// This function would typically live where you fetch and process your GraphQL data,
// before passing it to the VirtualizedPRList component.
export function transformGraphQLPRToUIPR(graphqlPR: GraphQLPullRequestNode): PullRequest | null {
  if (!graphqlPR.databaseId || !graphqlPR.author) {
    return null; // Or handle error appropriately
  }

  let uiState: PullRequest["state"];
  switch (graphqlPR.state) {
    case "OPEN":
      uiState = "open";
      break;
    case "CLOSED":
      uiState = graphqlPR.merged ? "merged" : "closed";
      break;
    case "MERGED":
      uiState = "merged";
      break;
    default:
      // Handle unknown state if necessary, or default
      uiState = "closed";
  }

  // Extracting owner/repo from nameWithOwner for a simpler 'name'
  const repoName = graphqlPR.repository.nameWithOwner.split('/')[1] || graphqlPR.repository.nameWithOwner;

  return {
    id: graphqlPR.databaseId,
    title: graphqlPR.title,
    number: graphqlPR.number,
    url: graphqlPR.url,
    state: uiState,
    createdAt: graphqlPR.createdAt,
    repository: {
      name: repoName, // Using the repository name part from nameWithOwner
      url: graphqlPR.repository.url,
    },
    user: {
      login: graphqlPR.author.login,
      avatar_url: graphqlPR.author.avatarUrl,
    },
    commentsCount: graphqlPR.comments.totalCount,
    approvedReviewsCount: graphqlPR.reviews?.totalCount ?? 0, // Use nullish coalescing for safety
  };
}
