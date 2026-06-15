import { FormEvent, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { apiClient } from "@/services/api";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "register") {
        await apiClient.register(name || email.split("@")[0], email, password);
      }
      await apiClient.login(email, password);
      setMessage("Signed in. You can upload notes now.");
    } catch {
      setMessage("Authentication failed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="00 / auth"
        title={
          <>
            Keep your <span className="text-gradient italic">notes</span> private.
          </>
        }
        subtitle="Create an account or sign in before uploading documents."
      />

      <section className="max-w-xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-surface border border-border p-8">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-background p-1 mb-8">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                  mode === item ? "bg-acid text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" ? (
              <label className="block">
                <span className="block text-sm text-muted-foreground mb-2">Name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="input-field w-full"
                  placeholder="Ada Lovelace"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="block text-sm text-muted-foreground mb-2">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                className="input-field w-full"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-muted-foreground mb-2">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                minLength={8}
                className="input-field w-full"
                placeholder="At least 8 characters"
              />
            </label>

            <button
              disabled={busy}
              className="w-full px-6 py-3 rounded-2xl bg-acid text-background font-bold hover:bg-foreground transition-colors disabled:opacity-60"
            >
              {busy ? "Working..." : mode === "register" ? "Create account" : "Sign in"}
            </button>
          </form>

          {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </section>
    </PageShell>
  );
}
