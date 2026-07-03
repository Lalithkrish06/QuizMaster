import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { QuizCard, QuizCardSkeleton, type QuizCardData } from "@/components/site/quiz-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional(),
  sort: z.enum(["recent", "popular", "rating"]).optional().default("recent"),
});

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Browse quizzes — Vortex" },
      { name: "description", content: "Discover thousands of quizzes across science, tech, pop culture and more." },
    ],
  }),
  component: BrowsePage,
});

const difficulties = ["easy", "medium", "hard", "expert"] as const;

function BrowsePage() {
  const params = Route.useSearch();
  const navigate = Route.useNavigate();
  const [search, setSearch] = useState(params.q ?? "");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["browse", params],
    queryFn: async (): Promise<QuizCardData[]> => {
      let q = supabase
        .from("quizzes")
        .select("id,title,difficulty,cover_image_url,time_limit_seconds,attempts_count,rating_avg,category:categories!inner(name,slug),creator:profiles(display_name),questions(count)")
        .eq("status", "published")
        .limit(36);
      if (params.q) q = q.ilike("title", `%${params.q}%`);
      if (params.difficulty) q = q.eq("difficulty", params.difficulty);
      if (params.sort === "popular") q = q.order("attempts_count", { ascending: false });
      else if (params.sort === "rating") q = q.order("rating_avg", { ascending: false });
      else q = q.order("created_at", { ascending: false });

      const { data } = await q;
      let rows = (data ?? []) as any[];
      if (params.category) rows = rows.filter((r) => r.category?.slug === params.category);
      return rows.map((r) => ({
        id: r.id, title: r.title, difficulty: r.difficulty, cover_image_url: r.cover_image_url,
        time_limit_seconds: r.time_limit_seconds, attempts_count: r.attempts_count,
        rating_avg: Number(r.rating_avg ?? 0), category_name: r.category?.name,
        creator_name: r.creator?.display_name, question_count: r.questions?.[0]?.count ?? 0,
      }));
    },
  });

  const update = (patch: Partial<typeof params>) => navigate({ search: (prev: typeof params) => ({ ...prev, ...patch }) as any });

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-noise px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 font-display text-4xl font-extrabold md:text-6xl">Discover <span className="text-gradient-brand">quizzes</span></h1>
          <form onSubmit={(e) => { e.preventDefault(); update({ q: search || undefined }); }} className="relative max-w-2xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title…" className="h-14 rounded-2xl bg-surface pl-14 pr-28" />
            <Button type="submit" className="absolute right-2 top-2 h-10 rounded-xl bg-brand-orange text-primary-foreground">Search</Button>
          </form>
        </div>
      </section>

      <section className="border-b border-border/60 px-6 py-6 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Chip active={!params.category} onClick={() => update({ category: undefined })}>All</Chip>
          {(categories ?? []).map((c) => (
            <Chip key={c.id} active={params.category === c.slug} onClick={() => update({ category: c.slug })}>{c.name}</Chip>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <select value={params.difficulty ?? ""} onChange={(e) => update({ difficulty: (e.target.value || undefined) as any })} className="rounded-full border border-border bg-surface px-4 py-2 text-sm">
              <option value="">Any difficulty</option>
              {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={params.sort ?? "recent"} onChange={(e) => update({ sort: e.target.value as any })} className="rounded-full border border-border bg-surface px-4 py-2 text-sm">
              <option value="recent">Recent</option>
              <option value="popular">Popular</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? Array.from({ length: 9 }).map((_, i) => <QuizCardSkeleton key={i} />)
              : (data ?? []).length === 0 ? (
                <div className="col-span-full rounded-3xl border border-dashed border-border p-16 text-center">
                  <p className="font-display text-xl font-bold">No quizzes match your filters.</p>
                  <Button asChild className="mt-4 rounded-full bg-brand-orange text-primary-foreground"><Link to="/create">Create one</Link></Button>
                </div>
              ) : (data ?? []).map((q) => <QuizCard key={q.id} q={q} />)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${active ? "bg-brand-orange text-primary-foreground shadow-glow-orange" : "border border-border bg-surface text-foreground hover:border-brand-orange/40"}`}
    >
      {children}
    </button>
  );
}
