import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { apiClient } from "@/services/api";
import type { Document } from "@/types";

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [busy, setBusy] = useState(false);
  const [textBusy, setTextBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textTitle, setTextTitle] = useState("Pasted article");
  const [pastedText, setPastedText] = useState("");

  const upload = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const document = await apiClient.uploadDocument(file);
      setDocuments((current) => [document, ...current]);
    } catch {
      setError("Upload failed. Make sure the backend is running and the file is PDF, DOCX, or TXT.");
    } finally {
      setBusy(false);
    }
  }, []);

  const submitText = async () => {
    setTextBusy(true);
    setError(null);
    try {
      const document = await apiClient.createTextDocument(textTitle, pastedText);
      setDocuments((current) => [document, ...current]);
      setPastedText("");
    } catch {
      setError("Text import failed. Sign in first and paste at least a short article or note.");
    } finally {
      setTextBusy(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="01 / upload"
        title={
          <>
            Drop the notes. <span className="text-gradient italic">We handle the rest.</span>
          </>
        }
        subtitle="PDF, DOCX, or TXT. We extract text, chunk it, and make it ready for summaries, quizzes, flashcards, and chat."
      />

      <section className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) upload(file);
            }}
            className={`relative block rounded-3xl border-2 border-dashed transition-all p-16 text-center cursor-pointer ${
              dragging ? "border-acid bg-acid/5 scale-[1.01]" : "border-border bg-surface/40"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) upload(file);
              }}
            />
            <div className="absolute inset-0 grid-bg opacity-30 rounded-3xl pointer-events-none" />
            <div className="relative">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-acid text-background grid place-items-center text-3xl brutal-shadow animate-float">
                UP
              </div>
              <h3 className="mt-8 text-display text-3xl font-bold">
                {busy ? "Processing..." : "Drop files here"}
              </h3>
              <p className="text-muted-foreground mt-3">or click to browse, up to 50MB per file</p>
              <span className="inline-flex mt-8 px-6 py-3 bg-foreground text-background font-semibold rounded-xl hover:bg-acid transition-colors">
                Choose file
              </span>
              <div className="mt-10 flex justify-center gap-2 font-mono text-xs text-muted-foreground flex-wrap">
                {["PDF", "DOCX", "TXT"].map((type) => (
                  <span key={type} className="px-3 py-1 rounded-full border border-border bg-background">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </label>

          {error ? <p className="mt-4 text-destructive">{error}</p> : null}

          <div className="mt-8 rounded-3xl bg-surface border border-border p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-cyber mb-2">
                  // paste text
                </div>
                <h3 className="text-display text-2xl font-bold">Paste an article or notes</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Perfect for quick revision when you do not have a file. Pasted text becomes a normal
                  document, so you can summarize it, quiz yourself, make flashcards, or chat with it.
                </p>
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                {pastedText.trim().length} chars
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <input
                value={textTitle}
                onChange={(event) => setTextTitle(event.target.value)}
                className="input-field w-full"
                placeholder="Article title"
              />
              <textarea
                value={pastedText}
                onChange={(event) => setPastedText(event.target.value)}
                rows={9}
                className="input-field w-full resize-y leading-relaxed"
                placeholder="Paste article, lecture notes, textbook excerpt, or any study text here..."
              />
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters. Large text follows the same 50MB document limit.
                </p>
                <button
                  onClick={submitText}
                  disabled={textBusy || pastedText.trim().length < 20}
                  className="px-6 py-3 rounded-2xl bg-cyber text-background font-bold hover:bg-acid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {textBusy ? "Importing..." : "Import text"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
              // uploaded - {documents.length} files
            </div>
            <div className="space-y-3">
              {documents.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-magenta/20 text-magenta grid place-items-center font-mono text-xs font-bold">
                    DOC
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{document.filename}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {Math.round(document.file_size / 1024)} KB - {document.status}
                    </div>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-background overflow-hidden">
                    <div className="h-full bg-acid" style={{ width: "100%" }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface border border-border">
            <h4 className="text-display font-bold text-xl mb-4">Processing pipeline</h4>
            <ol className="space-y-3 text-sm">
              {["Extract text", "Split into chunks", "Build retrieval index", "Store metadata", "Ready for AI"].map(
                (step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="font-mono text-acid text-xs mt-0.5">0{index + 1}</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ),
              )}
            </ol>
          </div>

          <div className="p-6 rounded-3xl bg-magenta/10 border border-magenta/30">
            <div className="font-mono text-xs uppercase text-magenta mb-2">pro tip</div>
            <p className="text-sm">Cleaner source text produces sharper summaries and better questions.</p>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}
