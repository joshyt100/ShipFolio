"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import GitHubCalendar from "react-github-calendar";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const USERNAME = "joshyt100";

interface Block {
  id: string;
  title: string;
  content: string;
}

function DraggableBlock({
  id,
  title,
  content,
  isDragging = false,
}: Block & { isDragging?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        pointerEvents: isDragging ? "none" : "auto",
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <Card className="p-4 mb-4 shadow-md hover:shadow-lg transition-all rounded-xl bg-white border w-full">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </div>
        <p className="text-sm text-gray-700">{content}</p>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken;
  const hasToken = Boolean(token);
  const sensors = useSensors(useSensor(PointerSensor));

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Force sign-in if totally unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("github", { callbackUrl: "/dashboard" });
    }
  }, [status]);

  // Load either public-only or full stats
  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadPublicStats() {
      // public profile + repos
      const profile = await fetch(`https://api.github.com/users/${USERNAME}`).then(r => r.json());
      const repos = await fetch(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100`
      ).then(r => r.json());

      const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);

      // languages
      const langTotals: Record<string, number> = {};
      await Promise.all(repos.map(async (r: any) => {
        const langs = await fetch(r.languages_url).then(r => r.json());
        Object.entries<number>(langs).forEach(([lang, bytes]) => {
          langTotals[lang] = (langTotals[lang] || 0) + bytes;
        });
      }));
      const topLangs = Object.entries(langTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang)
        .join(", ") || "N/A";

      setBlocks([
        { id: "followers", title: "Followers", content: `${profile.followers}` },
        { id: "stars", title: "Stars Earned", content: `${totalStars}` },
        { id: "prs", title: "Open PRs", content: "Sign in to view" },
        { id: "merged", title: "Merged PRs", content: "Sign in to view" },
        { id: "repos", title: "Public Repos", content: `${profile.public_repos}` },
        { id: "languages", title: "Languages Used", content: topLangs },
        { id: "heatmap", title: "Contribution Heatmap", content: "" },
      ]);
    }

    async function loadFullStats() {
      const headers: Record<string, string> = { Authorization: `token ${token}` };

      // profile & repos
      const [profile, repos] = await Promise.all([
        fetch("https://api.github.com/user", { headers }).then(r => r.json()),
        fetch("https://api.github.com/user/repos?per_page=100", { headers }).then(r => r.json()),
      ]);

      const totalStars = repos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);

      // languages
      const langTotals: Record<string, number> = {};
      await Promise.all(repos.map(async (r: any) => {
        const langs = await fetch(r.languages_url, { headers }).then(r => r.json());
        Object.entries<number>(langs).forEach(([lang, bytes]) => {
          langTotals[lang] = (langTotals[lang] || 0) + bytes;
        });
      }));
      const topLangs = Object.entries(langTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang)
        .join(", ") || "N/A";

      // safe search helper
      async function safeSearchCount(query: string) {
        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers });
        const json = await res.json();
        return json.total_count ?? 0;
      }

      const [openPRs, mergedPRs] = await Promise.all([
        safeSearchCount(`author:${USERNAME}+is:pr+state:open`),
        safeSearchCount(`author:${USERNAME}+is:pr+is:merged`),
      ]);

      setBlocks([
        { id: "followers", title: "Followers", content: `${profile.followers}` },
        { id: "stars", title: "Stars Earned", content: `${totalStars}` },
        { id: "prs", title: "Open PRs", content: `${openPRs}` },
        { id: "merged", title: "Merged PRs", content: `${mergedPRs}` },
        { id: "repos", title: "Public Repos", content: `${profile.public_repos}` },
        { id: "languages", title: "Languages Used", content: topLangs },
        { id: "heatmap", title: "Contribution Heatmap", content: "" },
      ]);
    }

    if (hasToken) {
      loadFullStats().catch(console.error);
    } else {
      loadPublicStats().catch(console.error);
    }
  }, [status, hasToken, token]);

  if (status === "loading" || blocks.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading your GitHub data…</p>
      </div>
    );
  }

  const mid = Math.ceil(blocks.length / 2);
  const leftCol = blocks.slice(0, mid);
  const rightCol = blocks.slice(mid);
  const all = [...leftCol, ...rightCol];
  const activeItem = all.find((b) => b.id === activeId) || null;

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = all.findIndex((b) => b.id === active.id);
    const newIndex = all.findIndex((b) => b.id === over.id);
    setBlocks(arrayMove(all, oldIndex, newIndex));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your ShipFolio Dashboard</h1>
        {!hasToken && (
          <Button
            onClick={() =>
              signIn("github", {
                callbackUrl: "/dashboard",
                scope: "read:user user:email repo",
              })
            }
          >
            Show Private Data
          </Button>
        )}
      </div>

      <Card className="mb-8 p-6 bg-white border shadow-md rounded-xl text-center overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">GitHub Contribution Graph</h2>
        <GitHubCalendar username={USERNAME} />
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-screen-xl mx-auto">
          <SortableContext items={leftCol.map((b) => b.id)} strategy={rectSortingStrategy}>
            {leftCol.map((b) => (
              <DraggableBlock key={b.id} {...b} isDragging={activeId === b.id} />
            ))}
          </SortableContext>
          <SortableContext items={rightCol.map((b) => b.id)} strategy={rectSortingStrategy}>
            {rightCol.map((b) => (
              <DraggableBlock key={b.id} {...b} isDragging={activeId === b.id} />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeItem && (
            <Card className="p-4 w-72 shadow-lg bg-white border rounded-xl">
              <h2 className="text-lg font-semibold mb-2">{activeItem.title}</h2>
              <p className="text-sm text-gray-700">{activeItem.content}</p>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </main>
  );
}

