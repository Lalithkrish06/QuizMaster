import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/quiz/$id/take")({
  head: () => ({ meta: [{ title: "Take quiz — Vortex" }] }),
  component: TakeQuiz,
});

type Q = {
  id: string;
  question_type: "mcq_single" | "mcq_multi" | "true_false";
  prompt: string;
  options: string[];
  correct_answers: number[];
  marks: number;
  explanation: string | null;
};

function TakeQuiz() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["take-quiz", id],
    queryFn: async () => {
      const [{ data: quiz }, { data: qs }] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", id).maybeSingle(),
        supabase.from("questions").select("*").eq("quiz_id", id).order("position"),
      ]);
      return { quiz, questions: (qs ?? []) as unknown as Q[] };
    },
  });

  const questions = useMemo(() => {
    if (!data?.questions) return [];
    const arr = [...data.questions];
    if (data.quiz?.randomize_questions) arr.sort(() => Math.random() - 0.5);
    return arr;
  }, [data]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [startedAt] = useState(() => Date.now());
  const [remaining, setRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data?.quiz?.time_limit_seconds) setRemaining(data.quiz.time_limit_seconds);
  }, [data?.quiz?.time_limit_seconds]);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) { submit(); return; }
    const t = setTimeout(() => setRemaining((r) => (r ?? 0) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  if (isLoading) return <SiteLayout><div className="grid min-h-[60vh] place-items-center"><div className="size-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" /></div></SiteLayout>;
  if (!questions.length) return <SiteLayout><div className="p-16 text-center"><h1 className="font-display text-2xl font-bold">This quiz has no questions yet.</h1></div></SiteLayout>;

  const q = questions[idx];
  const selected = answers[q.id] ?? [];

  const toggle = (i: number) => {
    if (q.question_type === "mcq_multi") {
      setAnswers({ ...answers, [q.id]: selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i] });
    } else {
      setAnswers({ ...answers, [q.id]: [i] });
    }
  };

  const submit = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    let score = 0, max = 0, correct = 0, wrong = 0, skipped = 0;
    for (const qq of questions) {
      max += Number(qq.marks);
      const ans = answers[qq.id] ?? [];
      if (ans.length === 0) { skipped++; continue; }
      const isRight = ans.length === qq.correct_answers.length && ans.every(a => qq.correct_answers.includes(a));
      if (isRight) { score += Number(qq.marks); correct++; }
      else { wrong++; if (data?.quiz?.negative_marking) score -= Number(qq.marks) * 0.25; }
    }
    const pct = max ? Math.max(0, (score / max) * 100) : 0;
    const taken = Math.round((Date.now() - startedAt) / 1000);
    try {
      const { data: att, error } = await supabase.from("attempts").insert({
        quiz_id: id, user_id: user.id, score, max_score: max, percentage: pct,
        correct_count: correct, wrong_count: wrong, skipped_count: skipped,
        time_taken_seconds: taken, answers: answers as any,
      }).select("id").single();
      if (error) throw error;
      navigate({ to: "/quiz/$id/results/$attemptId", params: { id, attemptId: att!.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit");
      setSubmitting(false);
    }
  };

  const progress = ((idx + 1) / questions.length) * 100;
  const mm = remaining !== null ? String(Math.floor(remaining / 60)).padStart(2, "0") : null;
  const ss = remaining !== null ? String(remaining % 60).padStart(2, "0") : null;

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-surface/40 px-6 py-6 lg:px-16">
        <div className="mx-auto flex max-w-4xl items-center gap-6">
          <div className="flex-1">
            <Progress value={progress} className="h-2 [&>div]:bg-brand-orange" />
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Question {idx + 1} of {questions.length}</p>
          </div>
          {remaining !== null && (
            <div className={`rounded-2xl px-4 py-2 font-display text-2xl font-extrabold tabular-nums ${remaining < 60 ? "bg-destructive/20 text-destructive" : "bg-surface text-foreground"}`}>
              {mm}:{ss}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-12 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-surface p-6 md:p-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className="font-display text-2xl font-extrabold leading-tight md:text-3xl">{q.prompt}</h2>
            <Button variant="ghost" size="sm" onClick={() => {
              const s = new Set(flagged); s.has(q.id) ? s.delete(q.id) : s.add(q.id); setFlagged(s);
            }} className={flagged.has(q.id) ? "text-brand-pink" : ""}><Flag className="size-4" /></Button>
          </div>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const active = selected.includes(i);
              return (
                <button key={i} onClick={() => toggle(i)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${active ? "border-brand-orange bg-brand-orange/10 shadow-glow-orange" : "border-border bg-background hover:border-brand-orange/40"}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full font-display font-extrabold ${active ? "bg-brand-orange text-primary-foreground" : "bg-surface text-muted-foreground"}`}>{String.fromCharCode(65 + i)}</span>
                  <span className="font-semibold">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between">
          <Button variant="outline" disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="rounded-full"><ChevronLeft className="size-4" /> Previous</Button>
          {idx === questions.length - 1 ? (
            <Button onClick={submit} disabled={submitting} className="rounded-full bg-brand-orange text-primary-foreground shadow-glow-orange hover:bg-brand-orange/90"><Send className="size-4" /> Submit</Button>
          ) : (
            <Button onClick={() => setIdx(idx + 1)} className="rounded-full bg-brand-orange text-primary-foreground">Next <ChevronRight className="size-4" /></Button>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
