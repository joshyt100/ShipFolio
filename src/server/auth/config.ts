// src/auth/config.ts (or your equivalent file)
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth"; // Removed NextAuthAccount as it wasn't used
import GitHubProvider from "next-auth/providers/github";

// Assuming db is your Prisma client instance
import { db } from "~/server/db"; // Adjust path as needed

/**
 * Module augmentation for `next-auth` types.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties you might add to user in session
    } & DefaultSession["user"];
    accessToken?: string; // To hold the GitHub access token
  }
}

/**
 * Options for NextAuth.js
 */
export const authConfig = {
  adapter: PrismaAdapter(db), // Using PrismaAdapter implies database sessions
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      // Ensure you have requested the necessary scopes from GitHub, e.g.:
      // authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
  session: {
    // Strategy is "database" by default when an adapter is used.
    // Explicitly setting it can be good for clarity.
    strategy: "database",
  },
  callbacks: {
    // The JWT callback is still invoked and can be used to encode information
    // into the session cookie. However, for database sessions, the session object
    // passed to the client is primarily built from the database in the `session` callback.
    async jwt({ token, user, account }) {
      if (account?.access_token) {
        // You can store the access token in the JWT if desired,
        // but we'll also explicitly fetch it in the session callback for reliability with database sessions.
        token.accessToken = account.access_token;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // The session callback is crucial for shaping the session object.
    // For database strategy, the `user` parameter here is the user object from your database.
    async session({ session, user }) {
      // 1. Ensure the session's user object gets the ID from the database user.
      if (user && session.user) {
        session.user.id = user.id;
      }

      // 2. Fetch the access token from the `Account` table for the current user and provider (GitHub).
      //    This is the reliable way to get the accessToken for database sessions.
      if (user?.id) {
        try {
          const account = await db.account.findFirst({
            where: {
              userId: user.id,
              provider: "github", // This should match the provider ID used by NextAuth for GitHub
            },
          });
          if (account?.access_token) {
            session.accessToken = account.access_token;
          } else {
            // This warning is useful for debugging if the token isn't found
            console.warn(`[Auth Callback] GitHub account or access token not found for user ${user.id} in Account table.`);
          }
        } catch (dbError) {
          console.error("[Auth Callback] Error fetching GitHub account from DB for access token:", dbError);
        }
      } else {
        console.warn("[Auth Callback] Session callback: User ID is undefined, cannot fetch access token.");
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
