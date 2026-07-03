import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Vortex" }, { name: "description", content: "Global rankings of the top quiz players on Vortex." }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const { data } = useQuery({
    queryKey: ["leaderboard-global"],
    queryFn: async () => {
      const { data } = await supabase
        .from("attempts")
        .select("score,percentage,time_taken_seconds,completed_at,quiz:quizzes(title),user:profiles(display_name,username)")
        .order("score", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-noise px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <Trophy className="mx-auto mb-4 size-12 text-brand-gold" />
          <h1 className="font-display text-5xl font-extrabold md:text-7xl">Hall of <span className="text-gradient-brand">Fame</span></h1>
          <p className="mt-4 text-muted-foreground">Top 50 scores across the platform.</p>
        </div>
      </section>
      <section className="px-6 py-12 lg:px-16">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface">
          {(data ?? []).length === 0 ? (
            <p className="p-12 text-center text-muted-foreground">No attempts yet.</p>
          ) : (data as any[]).map((a, i) => (
            <div key={i} className={`grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border p-5 last:border-none ${i === 0 ? "bg-brand-orange/5" : ""}`}>
              <span className={`font-display text-2xl font-extrabold ${i === 0 ? "text-brand-orange" : i < 3 ? "text-brand-gold" : "text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-bold">{a.user?.display_name ?? "Anon"}</p>
                <p className="text-xs text-muted-foreground">{a.quiz?.title}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-extrabold text-brand-orange">{Number(a.score).toFixed(0)} pts</p>
                <p className="text-xs text-muted-foreground">{Number(a.percentage).toFixed(0)}% · {Math.round(a.time_taken_seconds / 60)}m</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
