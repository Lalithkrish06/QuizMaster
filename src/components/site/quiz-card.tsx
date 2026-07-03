import { Link } from "@tanstack/react-router";
import { Clock, HelpCircle, Star, Zap } from "lucide-react";

export interface QuizCardData {
  id: string;
  title: string;
  difficulty: string;
  category_name?: string | null;
  cover_image_url?: string | null;
  time_limit_seconds?: number | null;
  question_count?: number;
  attempts_count?: number;
  rating_avg?: number;
  creator_name?: string | null;
}

const diffColor: Record<string, string> = {
  easy: "text-brand-gold",
  medium: "text-brand-orange",
  hard: "text-brand-pink",
  expert: "text-brand-violet",
};

export function QuizCard({ q }: { q: QuizCardData }) {
  const mins = q.time_limit_seconds ? Math.max(1, Math.round(q.time_limit_seconds / 60)) : null;
  return (
    <Link
      to="/quiz/$id"
      params={{ id: q.id }}
      className="group block overflow-hidden rounded-3xl bg-surface ring-1 ring-border transition-all hover:-translate-y-1 hover:ring-brand-orange/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {q.cover_image_url ? (
          <img src={q.cover_image_url} alt={q.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="size-full bg-noise" />
        )}
        <span className={`absolute left-3 top-3 rounded-full bg-background/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${diffColor[q.difficulty] ?? "text-brand-orange"}`}>
          {q.difficulty} · {q.question_count ?? 0} Qs
        </span>
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>{q.category_name ?? "General"}</span>
          {mins && <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {mins}m</span>}
        </div>
        <h3 className="mb-4 font-display text-xl font-bold leading-tight transition-colors group-hover:text-brand-orange">
          {q.title}
        </h3>
        <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span className="italic">by {q.creator_name ?? "Anon"}</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Star className="size-3 text-brand-gold" /> {q.rating_avg?.toFixed(1) ?? "—"}</span>
            <span className="inline-flex items-center gap-1"><Zap className="size-3" /> {q.attempts_count ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function QuizCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border">
      <div className="aspect-[16/10] animate-pulse bg-surface-2" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-2" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}
