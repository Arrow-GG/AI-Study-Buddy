import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { apiClient } from "@/services/api";

type Msg = { from: "user" | "ai"; text: string; sources?: string[] };

const initial: Msg[] = [
  {
    from: "ai",
    text: "I am ready to answer from your uploaded notes. Upload a document first, then use its document id here.",
  },
];

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [documentId, setDocumentId] = useState("1");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMsgs((current) => [...current, { from: "user", text: userMessage }]);
    setInput("");
    setBusy(true);

    try {
      const response = await apiClient.askQuestion(userMessage, Number(documentId));
      setMsgs((current) => [
        ...current,
        {
          from: "ai",
          text: response.response,
          sources: response.sources.map((source) => source.metadata?.filename || "uploaded notes"),
        },
      ]);
    } catch {
      setMsgs((current) => [
        ...current,
        {
          from: "ai",
          text: "I could not reach that document. Upload a note first, then set the document id from the upload result.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="05 / chat"
        title={
          <>
            Ask your <span className="text-gradient italic">notes.</span>
          </>
        }
        subtitle="Grounded Q&A over your uploaded documents."
      />

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="rounded-3xl bg-surface border border-border overflow-hidden flex flex-col h-[70vh]">
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-background/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-acid text-background grid place-items-center font-bold">
                AI
              </div>
              <div>
                <div className="font-semibold">Study Buddy</div>
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
                  backend connected
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              doc
              <input
                value={documentId}
                onChange={(event) => setDocumentId(event.target.value)}
                className="w-16 rounded-lg bg-surface border border-border px-2 py-1 text-foreground outline-none focus:border-acid"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {msgs.map((message, index) => (
              <motion.div
                key={`${message.from}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.from === "user" ? "justify-end" : ""}`}
              >
                {message.from === "ai" ? (
                  <div className="w-8 h-8 rounded-lg bg-acid text-background grid place-items-center text-xs font-bold shrink-0">
                    AI
                  </div>
                ) : null}
                <div className="max-w-[75%]">
                  <div
                    className={`p-4 rounded-2xl ${
                      message.from === "user"
                        ? "bg-acid text-background rounded-br-sm"
                        : "bg-background border border-border rounded-bl-sm"
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.sources ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.sources.map((source) => (
                        <span key={source} className="font-mono text-[10px] px-2 py-1 rounded-md bg-magenta/10 text-magenta border border-magenta/20">
                          {source}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-3 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything about your notes..."
                className="flex-1 resize-none bg-surface border border-border rounded-2xl px-5 py-3 outline-none focus:border-acid transition-colors"
              />
              <button
                onClick={send}
                disabled={busy}
                className="px-5 py-3 bg-acid text-background font-bold rounded-2xl hover:bg-foreground transition-colors disabled:opacity-60"
              >
                {busy ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
