import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Trophy, XCircle, MinusCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/quiz/$id/results/$attemptId")({
  head: () => ({ meta: [{ title: "Results — Vortex" }] }),
  component: Results,
});

function Results() {
  const { id, attemptId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["attempt", attemptId],
    queryFn: async () => {
      const [{ data: att }, { data: quiz }, { data: qs }] = await Promise.all([
        supabase.from("attempts").select("*").eq("id", attemptId).maybeSingle(),
        supabase.from("quizzes").select("title").eq("id", id).maybeSingle(),
        supabase.from("questions").select("*").eq("quiz_id", id).order("position"),
      ]);
      return { att, quiz, questions: qs ?? [] };
    },
  });

  if (!data?.att) return <SiteLayout><div className="grid min-h-[60vh] place-items-center"><div className="size-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" /></div></SiteLayout>;
  const a = data.att;
  const pct = Math.round(Number(a.percentage));
  const verdict = pct >= 80 ? "Excellent" : pct >= 60 ? "Great" : pct >= 40 ? "Decent" : "Keep practicing";

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-noise px-6 py-12 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-orange">{data.quiz?.title}</p>
          <h1 className="mt-3 font-display text-5xl font-extrabold md:text-7xl">{verdict}.</h1>
          <div className="mt-8 inline-block">
            <div className="relative grid size-48 place-items-center rounded-full bg-surface ring-4 ring-brand-orange/30 md:size-56">
              <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(var(--brand-orange) ${pct}%, transparent ${pct}%)`, mask: "radial-gradient(circle, transparent 60%, black 61%)", WebkitMask: "radial-gradient(circle, transparent 60%, black 61%)" }} />
              <div className="text-center">
                <p className="font-display text-6xl font-extrabold">{pct}<span className="text-2xl text-muted-foreground">%</span></p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full bg-brand-orange text-primary-foreground"><Link to="/quiz/$id" params={{ id }}>Retry</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/browse">More quizzes</Link></Button>
            <Button variant="outline" className="rounded-full" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 className="size-4" /> Share</Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-16">
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-4">
          <StatBlock icon={<CheckCircle2 className="text-emerald-500" />} label="Correct" value={a.correct_count} />
          <StatBlock icon={<XCircle className="text-destructive" />} label="Wrong" value={a.wrong_count} />
          <StatBlock icon={<MinusCircle className="text-muted-foreground" />} label="Skipped" value={a.skipped_count} />
          <StatBlock icon={<Clock className="text-brand-pink" />} label="Time" value={`${Math.floor(a.time_taken_seconds / 60)}m ${a.time_taken_seconds % 60}s`} />
        </div>

        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          <h2 className="font-display text-2xl font-extrabold">Review</h2>
          {(data.questions as any[]).map((q, i) => {
            const ans = (a.answers as any)?.[q.id] ?? [];
            const right = ans.length === q.correct_answers.length && ans.every((x: number) => q.correct_answers.includes(x));
            return (
              <div key={q.id} className={`rounded-2xl border p-5 ${right ? "border-emerald-500/30 bg-emerald-500/5" : ans.length === 0 ? "border-border bg-surface" : "border-destructive/30 bg-destructive/5"}`}>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">Q{i + 1} · {right ? "Correct" : ans.length === 0 ? "Skipped" : "Wrong"}</p>
                <p className="mb-3 font-bold">{q.prompt}</p>
                <div className="space-y-1.5 text-sm">
                  {q.options.map((opt: string, oi: number) => {
                    const isCorrect = q.correct_answers.includes(oi);
                    const isPicked = ans.includes(oi);
                    return (
                      <div key={oi} className={`rounded-lg px-3 py-2 ${isCorrect ? "bg-emerald-500/15 text-emerald-300" : isPicked ? "bg-destructive/15 text-destructive" : "bg-surface-2 text-muted-foreground"}`}>
                        {opt} {isCorrect && "✓"} {isPicked && !isCorrect && "✗"}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-muted-foreground"><span className="font-bold text-foreground">Why: </span>{q.explanation}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}

function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 text-center">
      <div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-surface-2">{icon}</div>
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
