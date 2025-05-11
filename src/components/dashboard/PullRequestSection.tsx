// components/dashboard/PullRequestSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitPullRequest } from "lucide-react";
import { VirtualizedPRList } from "./VirtualizedPRList";
import type { PullRequest } from "./types";
import type { SessionContextValue } from "next-auth/react";

interface PullRequestSectionProps {
  currentUsername: string;
  featuredPRs: PullRequest[];
  loadingPRs: boolean;
  sessionStatus: SessionContextValue["status"]; // For isLoading logic in VirtualizedPRList
}

export function PullRequestSection({
  currentUsername,
  featuredPRs,
  loadingPRs,
  sessionStatus,
}: PullRequestSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Featured Pull Requests
        </h2>
        {/* {currentUsername && ( */}
        {/*   <Button */}
        {/*     variant="ghost" */}
        {/*     size="sm" */}
        {/*     className="font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100" */}
        {/*     onClick={() => */}
        {/*       window.open( */}
        {/*         `https://github.com/pulls?q=is%3Apr+author%3A${currentUsername}`, */}
        {/*         "_blank" */}
        {/*       ) */}
        {/*     } */}
        {/*   > */}
        {/*     View All on GitHub <ExternalLink className="ml-2 h-3.5 w-3.5" /> */}
        {/*   </Button> */}
        {/* )} */}
        {currentUsername && (
          <Button
            variant="default"
            size="sm"
            className="cursor-pointer"

          > Edit Featured
            <GitPullRequest />
          </Button>

        )}
      </div>
      <VirtualizedPRList
        pullRequests={featuredPRs}
        isLoading={loadingPRs && sessionStatus === 'authenticated'} // Pass session status for accurate loading
        usernameForEmptyMessage={currentUsername}
      />
    </motion.div >
  );
}
