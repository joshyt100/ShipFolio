// src/lib/github-graphql.ts
import { type Session } from "next-auth";

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: Array<{ message: string; type?: string; path?: (string | number)[];[key: string]: unknown }>;
  message?: string; // For top-level messages from GitHub like rate limits
}

export async function fetchGitHubGraphQL<TResult>(
  query: string,
  variables: Record<string, unknown> = {},
  session: Session | null
): Promise<TResult> {
  if (!session?.accessToken) {
    throw new Error(
      "GitHub access token not found. User might not be authenticated or token is missing from session."
    );
  }

  let httpResponse: Response;
  try {
    httpResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch (networkError) {
    if (networkError instanceof Error) {
      console.error("Network error during GitHub GraphQL request:", networkError);
      throw new Error(`Network error: ${networkError.message || 'Failed to fetch from GitHub API'}`);
    }
    else {
      console.error("Unknown network error during GitHub GraphQL request:", networkError);
      throw new Error('Unknown network error: Failed to fetch from GitHub API');
    }
  }

  let result: GraphQLResponse<TResult>;
  try {
    result = await httpResponse.json() as GraphQLResponse<TResult>;
  } catch (jsonParseError) {
    if (jsonParseError instanceof Error) {
      console.error("Failed to parse GitHub GraphQL response as JSON. Status:", httpResponse.status, "Body:", jsonParseError.message);
      throw new Error(`GraphQL API request failed with status ${httpResponse.status} ${httpResponse.statusText}. Non-JSON response received. ${jsonParseError.message}`);
    }
    else {
      console.error("Failed to parse GitHub GraphQL response as JSON. Status:", httpResponse.status, "Body:", jsonParseError);
      throw new Error(`GraphQL API request failed with status ${httpResponse.status} ${httpResponse.statusText}. Non-JSON response received.`);
    }
  }

  if (!httpResponse.ok) {
    let errorMessage = `GitHub API request failed: ${httpResponse.status} ${httpResponse.statusText}.`;
    if (result.message) { // e.g., "Bad credentials", "API rate limit exceeded"
      errorMessage += ` GitHub Message: ${result.message}.`;
    }
    if (result.errors && result.errors.length > 0) {
      errorMessage += ` GraphQL Errors: ${result.errors
        .map((e) => `${e.type ? `(${e.type}) ` : ""}${e.message}${e.path ? ` at path ${e.path.join('.')}` : ''}`)
        .join("; ")}`;
    }
    console.error("GitHub GraphQL Fetch Error. Full result:", JSON.stringify(result, null, 2));
    throw new Error(errorMessage);
  }

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors
      .map((e) => `${e.type ? `(${e.type}) ` : ""}${e.message}${e.path ? ` at path ${e.path.join('.')}` : ''}`)
      .join("; ");

    const isNotFoundError = result.errors.some((e) => e.type === "NOT_FOUND");

    if (isNotFoundError) {
      console.warn(`GitHub GraphQL: Resource not found. Errors: ${errorMessages}`);
      // Allow to proceed if data for "NOT_FOUND" is typically { field: null }
    } else {
      console.error(`GitHub GraphQL Query Errors: ${errorMessages}. Full errors:`, JSON.stringify(result.errors, null, 2));
    }

    // If there's no data at all, and the errors aren't just "NOT_FOUND", then throw.
    // This allows returning partial data or null data (for NOT_FOUND) if available.
    if (typeof result.data === 'undefined' && !isNotFoundError) {
      throw new Error(`GraphQL query failed with errors: ${errorMessages}`);
    }
  }

  if (typeof result.data === 'undefined' && !(result.errors?.some(e => e.type === 'NOT_FOUND'))) {
    // This case implies no data and no specific "NOT_FOUND" error, which is unexpected
    // if the HTTP response was OK and no other GraphQL errors were thrown.
    console.warn("GraphQL query returned no data and no specific NOT_FOUND error. Query:", query, "Variables:", variables);
    // Consider throwing an error or returning a more specific null/empty object based on TResult.
    // For now, we'll allow casting, but this might lead to runtime errors if TResult expects an object.
  }

  return result.data as TResult;
}
