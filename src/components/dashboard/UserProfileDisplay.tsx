// components/dashboard/UserProfileDisplay.tsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Archive } from "lucide-react";
import type { UserProfile } from "@/app/dashboard/types";

interface UserProfileDisplayProps {
  userProfile: UserProfile | null;
  currentUsername: string;
}

export function UserProfileDisplay({
  userProfile,
  currentUsername,
}: UserProfileDisplayProps) {
  if (!userProfile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="overflow-hidden shadow-sm bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <Avatar className="h-24 w-24 border-2 shadow-lg border-neutral-300 dark:border-neutral-700">
              <AvatarImage
                src={userProfile.avatar_url || "/placeholder.svg"}
                alt={userProfile.name || currentUsername}
              />
              <AvatarFallback className="font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                {(userProfile.login || currentUsername)
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold mb-1 text-black dark:text-white">
                {userProfile.name || userProfile.login}
              </h2>
              <a
                href={`https://github.com/${currentUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Badge
                  variant="outline"
                  className="mb-3 py-1 px-2.5 text-xs cursor-pointer transition-colors border-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                >
                  <Github className="h-3.5 w-3.5 mr-1.5" /> {currentUsername}
                </Badge>
              </a>
              <p className="mb-4 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
                {userProfile.bio || "No biography provided."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  onClick={() =>
                    window.open(
                      `https://github.com/${currentUsername}`,
                      "_blank"
                    )
                  }
                >
                  <Github className="h-4 w-4 mr-2" /> Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-300 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  onClick={() =>
                    window.open(
                      `https://github.com/${currentUsername}?tab=repositories`,
                      "_blank"
                    )
                  }
                >
                  <Archive className="h-4 w-4 mr-2" /> Repositories
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
