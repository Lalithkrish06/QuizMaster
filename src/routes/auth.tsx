import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Vortex" }, { name: "description", content: "Sign in or create your Vortex account." }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome!");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="relative grid min-h-[calc(100vh-4rem-200px)] place-items-center px-4 py-16">
        <div className="absolute inset-0 -z-10 bg-noise opacity-60" />
        <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-surface p-8 shadow-2xl md:p-10">
          <h1 className="mb-2 font-display text-3xl font-extrabold">
            {mode === "signin" ? "Welcome back." : "Join Vortex."}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to keep climbing the leaderboard." : "Create an account in seconds."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="QuizMaster42" className="mt-1.5 h-12 rounded-xl bg-background" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-12 rounded-xl bg-background" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-12 rounded-xl bg-background" />
            </div>
            <Button type="submit" disabled={loading} className="h-12 w-full rounded-full bg-brand-orange font-bold text-primary-foreground shadow-glow-orange hover:bg-brand-orange/90">
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-bold text-brand-orange hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
