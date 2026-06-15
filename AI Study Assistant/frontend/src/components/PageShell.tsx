import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/summary", label: "Summary" },
  { href: "/quiz", label: "Quiz" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/chat", label: "Chat" },
  { href: "/auth", label: "Auth" },
];

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="relative border-b border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acid mb-6">
          <span className="w-8 h-px bg-acid" /> {eyebrow}
        </div>
        <h1 className="text-display text-5xl md:text-7xl font-bold leading-none max-w-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}

function Nav() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-acid text-background grid place-items-center font-display font-bold text-lg brutal-shadow-magenta transition-transform group-hover:rotate-6">
            N
          </div>
          <span className="text-display font-bold text-xl tracking-normal">
            noted<span className="text-acid">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-surface/70 border border-border rounded-full p-1">
          {links.map((link) => {
            const active = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-acid text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/auth"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-acid transition-colors"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="text-display text-[16vw] leading-none font-bold text-gradient">
          noted.
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 text-sm text-muted-foreground font-mono">
          <p>// built for curious minds</p>
          <p>v0.1 - AI study assistant</p>
        </div>
      </div>
    </footer>
  );
}
