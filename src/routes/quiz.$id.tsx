import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, HelpCircle, Star, Tag, Trophy, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/quiz/$id")({
  head: () => ({ meta: [{ title: "Quiz — Vortex" }] }),
  component: QuizDetail,
});

function QuizDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["quiz-detail", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("quizzes")
        .select("*,category:categories(name,slug,color),creator:profiles(display_name,username),questions(id)")
        .eq("id", id).maybeSingle();
      return data;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["quiz-leaderboard", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("attempts").select("score,percentage,time_taken_seconds,user:profiles(display_name)")
        .eq("quiz_id", id).order("score", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  if (isLoading) return <SiteLayout><div className="grid min-h-[60vh] place-items-center"><div className="size-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" /></div></SiteLayout>;
  if (!data) return <SiteLayout><div className="p-16 text-center"><h1 className="font-display text-2xl font-bold">Quiz not found</h1></div></SiteLayout>;

  const minutes = data.time_limit_seconds ? Math.round(data.time_limit_seconds / 60) : null;
  const start = () => {
    if (!user) return navigate({ to: "/auth" });
    navigate({ to: "/quiz/$id/take", params: { id } });
  };

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-noise px-6 py-12 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Link to="/browse" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand-orange">← Browse</Link>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest">
              <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-brand-orange">{data.difficulty}</span>
              {data.category && <span className="rounded-full bg-surface px-3 py-1 text-foreground">{data.category.name}</span>}
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight md:text-6xl">{data.title}</h1>
            {data.description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{data.description}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
              <Meta icon={<HelpCircle className="size-4" />} label={`${data.questions?.length ?? 0} questions`} />
              {minutes && <Meta icon={<Clock className="size-4" />} label={`${minutes} min`} />}
              <Meta icon={<Zap className="size-4" />} label={`${data.attempts_count} attempts`} />
              <Meta icon={<Star className="size-4 text-brand-gold" />} label={`${Number(data.rating_avg).toFixed(1)} rating`} />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button onClick={start} className="h-14 rounded-full bg-brand-orange px-8 font-bold text-primary-foreground shadow-glow-orange hover:bg-brand-orange/90">
                Start quiz
              </Button>
              <Button variant="outline" className="h-14 rounded-full">Save for later</Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">Created by <span className="font-bold text-foreground">{data.creator?.display_name ?? "Anon"}</span></p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h3 className="mb-4 font-display text-lg font-extrabold uppercase tracking-tight">Top scores</h3>
            <div className="space-y-2">
              {(leaderboard ?? []).length === 0 ? (
                <p className="rounded-xl bg-surface-2 p-4 text-center text-sm text-muted-foreground">Be the first to attempt this quiz.</p>
              ) : leaderboard!.map((a: any, i: number) => (
                <div key={i} className={`flex items-center gap-3 rounded-xl p-3 ${i === 0 ? "bg-brand-orange/10 ring-1 ring-brand-orange/30" : "border border-border"}`}>
                  <span className="w-5 text-center font-display font-extrabold text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 truncate font-bold">{a.user?.display_name ?? "Anon"}</span>
                  <span className="font-display font-extrabold text-brand-orange">{Number(a.percentage).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <span className="inline-flex items-center gap-2 text-muted-foreground">{icon}<span className="font-semibold text-foreground">{label}</span></span>;
}
