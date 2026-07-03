import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookMarked, FileEdit, Plus, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { QuizCard, type QuizCardData } from "@/components/site/quiz-card";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Vortex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"creator" | "participant">("participant");

  const { data: myQuizzes } = useQuery({
    enabled: !!user, queryKey: ["my-quizzes", user?.id],
    queryFn: async (): Promise<QuizCardData[]> => {
      const { data } = await supabase
        .from("quizzes")
        .select("id,title,difficulty,status,cover_image_url,time_limit_seconds,attempts_count,rating_avg,category:categories(name),questions(count)")
        .eq("creator_id", user!.id).order("updated_at", { ascending: false });
      return (data ?? []).map((q: any) => ({
        id: q.id, title: q.title, difficulty: q.difficulty, cover_image_url: q.cover_image_url,
        time_limit_seconds: q.time_limit_seconds, attempts_count: q.attempts_count,
        rating_avg: Number(q.rating_avg ?? 0), category_name: q.category?.name,
        creator_name: "you", question_count: q.questions?.[0]?.count ?? 0,
      }));
    },
  });

  const { data: history } = useQuery({
    enabled: !!user, queryKey: ["my-attempts", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("attempts")
        .select("id,score,percentage,completed_at,quiz:quizzes(id,title,difficulty)")
        .eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(20);
      return data ?? [];
    },
  });

  const totalAttempts = history?.length ?? 0;
  const best = Math.max(0, ...(history ?? []).map((h: any) => Number(h.percentage)));
  const avg = totalAttempts ? ((history ?? []).reduce((s: number, h: any) => s + Number(h.percentage), 0) / totalAttempts) : 0;

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-noise px-6 py-12 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-orange">Dashboard</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">Hey, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant={tab === "participant" ? "default" : "outline"} className="rounded-full" onClick={() => setTab("participant")}>Player</Button>
            <Button variant={tab === "creator" ? "default" : "outline"} className="rounded-full" onClick={() => setTab("creator")}>Creator</Button>
          </div>
        </div>
      </section>

      {tab === "participant" ? (
        <section className="px-6 py-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard icon={<Zap />} label="Quizzes taken" value={totalAttempts.toString()} />
              <StatCard icon={<Trophy />} label="Best score" value={`${best.toFixed(0)}%`} color="text-brand-gold" />
              <StatCard icon={<BookMarked />} label="Average" value={`${avg.toFixed(0)}%`} color="text-brand-pink" />
            </div>
            <h2 className="mt-12 mb-6 font-display text-2xl font-extrabold">Recent attempts</h2>
            <div className="overflow-hidden rounded-3xl border border-border bg-surface">
              {(history ?? []).length === 0 ? (
                <p className="p-10 text-center text-muted-foreground">No attempts yet. <Link to="/browse" className="font-bold text-brand-orange">Browse quizzes</Link></p>
              ) : (history ?? []).map((h: any) => (
                <Link key={h.id} to="/quiz/$id" params={{ id: h.quiz?.id }} className="flex items-center justify-between border-b border-border p-5 last:border-none hover:bg-surface-2">
                  <div>
                    <p className="font-bold">{h.quiz?.title}</p>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{h.quiz?.difficulty} · {new Date(h.completed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-extrabold text-brand-orange">{Number(h.percentage).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">{Number(h.score).toFixed(0)} pts</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-6 py-12 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold">Your quizzes</h2>
              <Button asChild className="rounded-full bg-brand-orange text-primary-foreground"><Link to="/create"><Plus className="size-4" /> New quiz</Link></Button>
            </div>
            {(myQuizzes ?? []).length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-16 text-center">
                <FileEdit className="mx-auto mb-4 size-10 text-muted-foreground" />
                <p className="font-display text-xl font-bold">You haven't created any quizzes yet.</p>
                <Button asChild className="mt-6 rounded-full bg-brand-orange text-primary-foreground"><Link to="/create">Create your first quiz</Link></Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myQuizzes!.map((q) => <QuizCard key={q.id} q={q} />)}
              </div>
            )}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-surface-2 ${color ?? "text-brand-orange"}`}>{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}
