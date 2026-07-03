import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { to: "/browse", label: "Discover" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight italic">
            VORTEX<span className="text-brand-orange">.</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground md:flex">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="transition-colors hover:text-brand-orange"
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/create"><Plus className="size-4" /> Create</Link>
              </Button>
              <Button onClick={signOut} variant="outline" size="sm" className="rounded-full">Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-brand-orange text-primary-foreground shadow-glow-orange hover:bg-brand-orange/90">
                <Link to="/auth"><Sparkles className="size-4" /> Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <div className="mt-12 flex flex-col gap-2">
              {navItems.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-surface">
                  {n.label}
                </Link>
              ))}
              <div className="mt-6 flex flex-col gap-3">
                {user ? (
                  <>
                    <Button asChild className="w-full rounded-full"><Link to="/create" onClick={() => setOpen(false)}>Create Quiz</Link></Button>
                    <Button variant="outline" className="w-full rounded-full" onClick={() => { setOpen(false); signOut(); }}>Sign out</Button>
                  </>
                ) : (
                  <Button asChild className="w-full rounded-full bg-brand-orange text-primary-foreground"><Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link></Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
