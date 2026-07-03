import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGuard,
});

function AuthGuard() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) navigate({ to: "/auth" });
      else setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate({ to: "/auth" });
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="size-12 animate-spin rounded-full border-4 border-brand-orange border-t-transparent" />
      </div>
    );
  }
  return <Outlet />;
}
