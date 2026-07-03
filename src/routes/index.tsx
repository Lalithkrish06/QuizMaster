import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { QuizCard, QuizCardSkeleton, type QuizCardData } from "@/components/site/quiz-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import heroCover from "@/assets/hero-cover.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vortex — Create, Share & Compete in Premium Quizzes" },
      { name: "description", content: "The premium quiz arena. Build beautiful quizzes, climb the leaderboards, and challenge a global community." },
      { property: "og:title", content: "Vortex — Premium Quiz Platform" },
      { property: "og:description", content: "Create, share, and compete in premium interactive quizzes." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <StatsStrip />
      <FeaturedSection />
      <CategoriesSection />
      <LeaderboardBento />
      <FaqSection />
      <Newsletter />
    </SiteLayout>
  );
}

function Hero() {
  const [q, setQ] = useState("");
  return (
    <section className="relative grid min-h-[85vh] border-b border-border/60 lg:grid-cols-12">
      <div className="absolute inset-0 -z-10 bg-noise opacity-80" />
      <div className="flex flex-col justify-center border-r border-border/60 p-8 lg:col-span-7 lg:p-16">
        <div className="mb-8 inline-flex w-max items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-violet">
          <span className="animate-pulse">●</span> Issue #042 · Summer
        </div>
        <h1 className="mb-8 text-balance font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          Unleash the <span className="text-gradient-brand">intellect.</span>
        </h1>
        <p className="mb-8 max-w-xl text-base text-muted-foreground md:text-lg">
          Build beautiful, gamified quizzes. Compete on the global leaderboard. Earn XP, badges, and bragging rights.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) window.location.assign(`/browse?q=${encodeURIComponent(q)}`); }}
          className="relative max-w-xl"
        >
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search the knowledge base…"
            className="h-16 rounded-2xl border border-border bg-surface pl-14 pr-32 text-base shadow-2xl focus-visible:ring-brand-orange"
          />
          <Button type="submit" className="absolute right-2 top-2 h-12 rounded-xl bg-brand-gold px-5 font-bold text-primary-foreground hover:bg-brand-gold/90">
            Search
          </Button>
        </form>
        <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>Trending:</span>
          {["AstroPhysics", "90s Pop", "WebDev", "World Cup"].map((t) => (
            <Link key={t} to="/browse" search={{ q: t }} className="rounded-full bg-surface px-3 py-1.5 text-foreground transition-colors hover:text-brand-pink">
              #{t}
            </Link>
          ))}
        </div>
      </div>
      <div className="relative min-h-[400px] overflow-hidden lg:col-span-5">
        <img src={heroCover} alt="" className="size-full object-cover opacity-90 animate-drift" width={1024} height={1280} />
        <div className="absolute inset-x-6 bottom-6 rounded-3xl border border-border bg-background/70 p-6 backdrop-blur-xl md:inset-x-12 md:bottom-12 md:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-pink">Weekly Highlight</p>
          <h2 className="mb-4 font-display text-2xl font-extrabold md:text-3xl">The Quantum Mechanics Challenge</h2>
          <div className="flex items-end justify-between">
            <div className="flex gap-6">
              <Stat label="Attempts" value="12.4k" />
              <Stat label="Rating" value="4.9★" />
            </div>
            <Button asChild className="rounded-full bg-brand-orange font-bold text-primary-foreground shadow-glow-orange">
              <Link to="/browse">Play <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-extrabold">{value}</p>
    </div>
  );
}

function StatsStrip() {
  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [{ count: quizzes }, { count: attempts }, { count: users }] = await Promise.all([
        supabase.from("quizzes").select("*", { head: true, count: "exact" }).eq("status", "published"),
        supabase.from("attempts").select("*", { head: true, count: "exact" }),
        supabase.from("profiles").select("*", { head: true, count: "exact" }),
      ]);
      return { quizzes: quizzes ?? 0, attempts: attempts ?? 0, users: users ?? 0 };
    },
  });
  return (
    <div className="flex flex-wrap items-center justify-around gap-6 border-y border-black/10 bg-brand-orange px-6 py-6 text-primary-foreground">
      <StripStat icon={<Sparkles className="size-4" />} label="Global Quizzes" value={(stats?.quizzes ?? 0).toLocaleString()} />
      <StripStat icon={<Users className="size-4" />} label="Active Members" value={(stats?.users ?? 0).toLocaleString()} />
      <StripStat icon={<Zap className="size-4" />} label="Total Attempts" value={(stats?.attempts ?? 0).toLocaleString()} />
      <StripStat icon={<Trophy className="size-4" />} label="Avg. Rating" value="4.8 / 5" />
    </div>
  );
}

function StripStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary-foreground/60">{icon}{label}</span>
      <span className="font-display text-2xl font-extrabold">{value}</span>
    </div>
  );
}

function FeaturedSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["featured-quizzes"],
    queryFn: async (): Promise<QuizCardData[]> => {
      const { data } = await supabase
        .from("quizzes")
        .select("id,title,difficulty,cover_image_url,time_limit_seconds,attempts_count,rating_avg,category:categories(name),creator:profiles(display_name),questions(count)")
        .eq("status", "published")
        .order("attempts_count", { ascending: false })
        .limit(6);
      return (data ?? []).map((q: any) => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        cover_image_url: q.cover_image_url,
        time_limit_seconds: q.time_limit_seconds,
        attempts_count: q.attempts_count,
        rating_avg: Number(q.rating_avg ?? 0),
        category_name: q.category?.name,
        creator_name: q.creator?.display_name,
        question_count: q.questions?.[0]?.count ?? 0,
      }));
    },
  });
  return (
    <section className="px-6 py-20 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand-pink italic">Curated selection</p>
            <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">Hottest tickets.</h2>
          </div>
          <Button asChild variant="ghost" className="hidden font-bold uppercase tracking-widest md:inline-flex">
            <Link to="/browse">View library <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <QuizCardSkeleton key={i} />)
            : data && data.length > 0
              ? data.map((q) => <QuizCard key={q.id} q={q} />)
              : <EmptyState />}
        </div>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface/50 p-12 text-center">
      <h3 className="font-display text-2xl font-bold">No quizzes published yet</h3>
      <p className="mt-2 text-muted-foreground">Be the first to publish a quiz on Vortex.</p>
      <Button asChild className="mt-6 rounded-full bg-brand-orange text-primary-foreground">
        <Link to="/create">Create the first quiz</Link>
      </Button>
    </div>
  );
}

function CategoriesSection() {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
  return (
    <section className="border-y border-border/60 bg-surface/40 px-6 py-20 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 font-display text-3xl font-extrabold md:text-4xl">Trending categories</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(data ?? []).map((c) => (
            <Link
              key={c.id}
              to="/browse"
              search={{ category: c.slug }}
              className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-brand-orange/40"
            >
              <div className="mb-3 size-10 rounded-xl" style={{ background: `${c.color}33`, border: `1px solid ${c.color}55` }} />
              <p className="font-display text-lg font-bold group-hover:text-brand-orange">{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeaderboardBento() {
  const { data } = useQuery({
    queryKey: ["leaderboard-preview"],
    queryFn: async () => {
      const { data } = await supabase
        .from("attempts")
        .select("score,percentage,user:profiles(display_name,username)")
        .order("score", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });
  return (
    <section className="px-6 py-20 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-12">
        <div className="rounded-[2.5rem] border border-border bg-surface p-8 lg:col-span-8 lg:p-10">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
              Hall of <span className="text-brand-gold">Fame</span>
            </h3>
            <Link to="/leaderboard" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brand-orange">View all →</Link>
          </div>
          <div className="space-y-3">
            {(data ?? []).length === 0 ? (
              <p className="rounded-2xl bg-surface-2 p-6 text-center text-sm text-muted-foreground">No attempts yet — be the first to top the chart.</p>
            ) : (
              (data ?? []).map((a: any, i: number) => (
                <div key={i} className={`flex items-center gap-4 rounded-2xl p-4 transition-all ${i === 0 ? "bg-brand-orange/10 ring-1 ring-brand-orange/30" : "border border-border"}`}>
                  <span className={`w-6 font-display text-xl font-extrabold ${i === 0 ? "text-brand-orange" : "text-muted-foreground"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <div className="grid size-10 place-items-center rounded-full bg-surface-2 font-bold text-foreground/60">{(a.user?.display_name ?? "?")[0]}</div>
                  <div className="flex-1">
                    <p className="font-bold">{a.user?.display_name ?? a.user?.username ?? "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{Number(a.percentage).toFixed(0)}% accuracy</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-lg font-extrabold ${i === 0 ? "text-brand-orange" : ""}`}>{Number(a.score).toFixed(0)}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">pts</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid gap-6 lg:col-span-4">
          <div className="rounded-[2.5rem] bg-brand-violet p-8 text-primary-foreground">
            <h4 className="mb-2 text-sm font-extrabold uppercase tracking-widest text-foreground/70">Earn badges</h4>
            <p className="mb-6 font-display text-xl font-extrabold leading-tight text-foreground md:text-2xl">Unlock Curator status by publishing 5 popular quizzes.</p>
            <Button asChild variant="secondary" className="rounded-full font-bold"><Link to="/create">Start creating</Link></Button>
          </div>
          <div className="rounded-[2.5rem] bg-brand-pink p-8 text-foreground">
            <div className="font-display text-5xl font-extrabold">98%</div>
            <p className="mt-2 text-sm font-bold uppercase tracking-tighter">Completion rate — quality is our obsession.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    ["Is Vortex free to use?", "Yes — creating and taking quizzes is free. Premium tiers unlock advanced analytics."],
    ["Can I monetize my quizzes?", "Monetization for top creators is coming in our next release."],
    ["How are difficulties calculated?", "A blend of creator-set difficulty and live attempt analytics across the platform."],
    ["Are there seasonal tournaments?", "Weekly and monthly leaderboards run continuously, with seasonal cups coming soon."],
  ];
  return (
    <section className="border-t border-border/60 px-6 py-20 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center font-display text-3xl font-extrabold md:text-4xl">Intellectual queries</h2>
        <div className="space-y-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-border bg-surface p-6 transition-colors open:border-brand-orange/40">
              <summary className="flex cursor-pointer items-center justify-between text-base font-bold md:text-lg">
                {q}<span className="font-display text-2xl text-brand-orange transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <h3 className="mb-6 font-display text-3xl font-extrabold md:text-5xl">
          Stay curious. <span className="italic text-brand-gold">Join the inner circle.</span>
        </h3>
        <p className="mb-10 text-muted-foreground">The finest quizzes, logic puzzles, and brain training delivered every Sunday.</p>
        <form onSubmit={(e) => { e.preventDefault(); }} className="mx-auto flex max-w-md gap-3">
          <Input type="email" placeholder="your@email.com" className="h-12 rounded-full border-border bg-surface px-5" required />
          <Button className="h-12 rounded-full bg-brand-orange px-6 font-bold uppercase tracking-widest text-primary-foreground shadow-glow-orange">Subscribe</Button>
        </form>
      </div>
    </section>
  );
}
