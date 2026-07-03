import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Save, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Create a quiz — Vortex" }] }),
  component: CreatePage,
});

type DraftQuestion = {
  type: "mcq_single" | "mcq_multi" | "true_false";
  prompt: string;
  options: string[];
  correct: number[]; // indexes
  marks: number;
  explanation: string;
};

const emptyMcq = (): DraftQuestion => ({ type: "mcq_single", prompt: "", options: ["", "", "", ""], correct: [], marks: 1, explanation: "" });

function CreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories } = useQuery({
    queryKey: ["categories"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "expert">("medium");
  const [timeLimitMin, setTimeLimitMin] = useState<number>(10);
  const [randomizeQ, setRandomizeQ] = useState(false);
  const [randomizeO, setRandomizeO] = useState(false);
  const [negative, setNegative] = useState(false);
  const [tagsRaw, setTagsRaw] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyMcq()]);
  const [saving, setSaving] = useState(false);

  const setQ = (i: number, patch: Partial<DraftQuestion>) =>
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));

  const save = async (publish: boolean) => {
    if (!user) return;
    if (!title.trim()) return toast.error("Title is required");
    if (questions.length === 0) return toast.error("Add at least one question");
    for (const q of questions) {
      if (!q.prompt.trim()) return toast.error("Every question needs a prompt");
      if (q.type !== "true_false" && q.options.filter(o => o.trim()).length < 2) return toast.error("MCQs need 2+ options");
      if (q.correct.length === 0) return toast.error("Mark the correct answer(s)");
    }
    setSaving(true);
    try {
      const { data: quiz, error } = await supabase.from("quizzes").insert({
        creator_id: user.id, title, description: description || null,
        category_id: categoryId || null, difficulty,
        time_limit_seconds: timeLimitMin > 0 ? timeLimitMin * 60 : null,
        randomize_questions: randomizeQ, randomize_options: randomizeO, negative_marking: negative,
        tags: tagsRaw.split(",").map(t => t.trim()).filter(Boolean),
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
      }).select("id").single();
      if (error) throw error;

      const rows = questions.map((q, pos) => {
        const opts = q.type === "true_false" ? ["True", "False"] : q.options.filter(o => o.trim());
        return {
          quiz_id: quiz!.id, question_type: q.type,
          prompt: q.prompt, explanation: q.explanation || null,
          options: opts,
          correct_answers: q.correct.filter(i => i < opts.length),
          marks: q.marks, position: pos,
        };
      });
      const { error: qErr } = await supabase.from("questions").insert(rows);
      if (qErr) throw qErr;
      toast.success(publish ? "Quiz published" : "Draft saved");
      navigate({ to: "/quiz/$id", params: { id: quiz!.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <SiteLayout>
      <section className="border-b border-border/60 bg-noise px-6 py-12 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="font-display text-4xl font-extrabold md:text-5xl">Create a quiz</h1>
          <p className="mt-2 text-muted-foreground">Add details, write your questions, hit publish.</p>
        </div>
      </section>

      <section className="px-6 py-12 lg:px-16">
        <div className="mx-auto grid max-w-5xl gap-6">
          <div className="rounded-3xl border border-border bg-surface p-6 md:p-8">
            <h2 className="mb-6 font-display text-xl font-extrabold">Quiz details</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The History of Quantum Mechanics" className="mt-1.5 h-12 rounded-xl bg-background" />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5 rounded-xl bg-background" />
              </div>
              <div>
                <Label>Category</Label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-3">
                  <option value="">Select…</option>
                  {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-3">
                  {["easy", "medium", "hard", "expert"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label>Time limit (minutes, 0 = none)</Label>
                <Input type="number" min={0} value={timeLimitMin} onChange={(e) => setTimeLimitMin(parseInt(e.target.value || "0"))} className="mt-1.5 h-12 rounded-xl bg-background" />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="science, physics" className="mt-1.5 h-12 rounded-xl bg-background" />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                <ToggleField label="Randomize questions" checked={randomizeQ} onChange={setRandomizeQ} />
                <ToggleField label="Randomize options" checked={randomizeO} onChange={setRandomizeO} />
                <ToggleField label="Negative marking" checked={negative} onChange={setNegative} />
              </div>
            </div>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="rounded-3xl border border-border bg-surface p-6 md:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-5 text-muted-foreground" />
                  <span className="font-display text-lg font-extrabold">Question {i + 1}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}><Trash2 className="size-4" /></Button>
              </div>
              <div className="grid gap-4">
                <select value={q.type} onChange={(e) => {
                  const t = e.target.value as DraftQuestion["type"];
                  setQ(i, { type: t, options: t === "true_false" ? ["True", "False"] : (q.options.length >= 2 ? q.options : ["", "", "", ""]), correct: [] });
                }} className="h-11 w-fit rounded-xl border border-border bg-background px-3 text-sm">
                  <option value="mcq_single">Multiple choice (one answer)</option>
                  <option value="mcq_multi">Multiple choice (multiple answers)</option>
                  <option value="true_false">True / False</option>
                </select>
                <Textarea value={q.prompt} onChange={(e) => setQ(i, { prompt: e.target.value })} rows={2} placeholder="Question prompt…" className="rounded-xl bg-background" />
                {q.type === "true_false" ? (
                  <div className="grid gap-2">
                    {["True", "False"].map((label, idx) => (
                      <label key={idx} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${q.correct.includes(idx) ? "border-brand-orange bg-brand-orange/10" : "border-border bg-background"}`}>
                        <input type="radio" name={`tf-${i}`} checked={q.correct[0] === idx} onChange={() => setQ(i, { correct: [idx] })} className="size-4 accent-brand-orange" />
                        <span className="font-semibold">{label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`flex items-center gap-3 rounded-xl border p-2 ${q.correct.includes(idx) ? "border-brand-orange bg-brand-orange/10" : "border-border bg-background"}`}>
                        <input
                          type={q.type === "mcq_multi" ? "checkbox" : "radio"}
                          name={`opt-${i}`}
                          checked={q.correct.includes(idx)}
                          onChange={() => {
                            if (q.type === "mcq_multi") setQ(i, { correct: q.correct.includes(idx) ? q.correct.filter(x => x !== idx) : [...q.correct, idx] });
                            else setQ(i, { correct: [idx] });
                          }}
                          className="size-4 accent-brand-orange"
                        />
                        <Input value={opt} onChange={(e) => setQ(i, { options: q.options.map((o, oi) => oi === idx ? e.target.value : o) })} placeholder={`Option ${idx + 1}`} className="border-0 bg-transparent" />
                        {q.options.length > 2 && (
                          <Button variant="ghost" size="sm" onClick={() => setQ(i, { options: q.options.filter((_, oi) => oi !== idx), correct: q.correct.filter(c => c !== idx).map(c => c > idx ? c - 1 : c) })}><Trash2 className="size-4" /></Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-fit rounded-full" onClick={() => setQ(i, { options: [...q.options, ""] })}><Plus className="size-3.5" /> Option</Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Marks</Label>
                    <Input type="number" step="0.5" min={0.5} value={q.marks} onChange={(e) => setQ(i, { marks: parseFloat(e.target.value || "1") })} className="mt-1.5 h-11 rounded-xl bg-background" />
                  </div>
                </div>
                <div>
                  <Label>Explanation (shown after answer)</Label>
                  <Textarea value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} rows={2} className="mt-1.5 rounded-xl bg-background" />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" className="rounded-2xl" onClick={() => setQuestions([...questions, emptyMcq()])}>
            <Plus className="size-4" /> Add question
          </Button>

          <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-border bg-background/80 p-4 backdrop-blur-xl md:flex-row md:justify-end">
            <Button variant="outline" disabled={saving} onClick={() => save(false)} className="rounded-full"><Save className="size-4" /> Save draft</Button>
            <Button disabled={saving} onClick={() => save(true)} className="rounded-full bg-brand-orange text-primary-foreground shadow-glow-orange hover:bg-brand-orange/90"><Send className="size-4" /> Publish</Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}
