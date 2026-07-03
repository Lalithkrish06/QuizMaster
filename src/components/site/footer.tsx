import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-6 py-12 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="font-display text-2xl font-extrabold tracking-tight italic">
              VORTEX<span className="text-brand-orange">.</span>
            </span>
            <p className="mt-4 text-sm text-muted-foreground">
              The premium quiz arena for creators and curious minds.
            </p>
          </div>
          <FooterCol title="Platform" links={[["/browse","Discover"],["/leaderboard","Leaderboard"],["/create","Create"]]} />
          <FooterCol title="Account" links={[["/dashboard","Dashboard"],["/auth","Sign in"]]} />
          <FooterCol title="Connect" links={[["#","Twitter"],["#","Discord"],["#","Instagram"]]} />
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Vortex Quiz Labs</p>
          <div className="flex gap-6">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-widest">
      <p className="text-foreground/60 mb-2">{title}</p>
      {links.map(([to, label]) => (
        <Link key={label} to={to} className="text-muted-foreground transition-colors hover:text-brand-orange">{label}</Link>
      ))}
    </div>
  );
}
