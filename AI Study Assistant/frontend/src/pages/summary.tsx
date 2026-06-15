import { useEffect, useState } from "react";
import { PageHeader, PageShell } from "@/components/PageShell";
import { apiClient } from "@/services/api";

interface Summary {
  one_liner: string;
  key_concepts: string[];
  important_formulas: string[];
  exam_tips: string[];
  quick_revision: string;
}

export default function SummaryPage() {
  const [documentId, setDocumentId] = useState("1");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.summarizeDocument(Number(documentId));
      setSummary(data);
    } catch {
      setError("Failed to generate summary. Make sure you have uploaded a document first.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSummary();
  }, [documentId]);
  return (
    <PageShell>
      <PageHeader
        eyebrow="02 / summary"
        title={
          <>
            40 pages, <span className="text-acid">one minute.</span>
          </>
        }
        subtitle="AI distills your notes into the parts most likely to matter during revision."
      />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6 flex gap-4 items-end flex-wrap">
          <label className="flex items-center gap-2 text-sm font-mono">
            Document ID:
            <input
              type="number"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="w-20 px-2 py-1 rounded-lg bg-surface border border-border"
            />
          </label>
          <button
            onClick={generateSummary}
            disabled={loading}
            className="px-4 py-2 bg-acid text-background font-semibold rounded-lg hover:bg-foreground disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">{error}</div>}

        {!summary ? (
          <div className="text-center py-12 text-muted-foreground">
            {loading ? "Generating summary..." : "Upload a document to get started"}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-10 font-mono text-xs">
              {["AI Summary", "Document analysis", "Exam focused", "Auto-generated"].map((item) => (
                <span key={item} className="px-3 py-1.5 rounded-full bg-surface border border-border">
                  {item}
                </span>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-8 rounded-3xl bg-surface border border-border">
                <div className="font-mono text-xs uppercase text-acid mb-2">// tl;dr</div>
                <p className="text-display text-3xl font-bold leading-snug">
                  <span className="text-gradient">{summary.one_liner}</span>
                </p>

                <div className="mt-10 border-t border-border pt-8">
                  <h3 className="text-xl font-display font-bold mb-4">Quick revision</h3>
                  <div className="prose prose-invert text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {summary.quick_revision}
                  </div>
                </div>

                {summary.important_formulas.length > 0 && (
                  <div className="mt-10 border-t border-border pt-8">
                    <h3 className="text-xl font-display font-bold mb-4">Important formulas</h3>
                    <div className="grid sm:grid-cols-2 gap-3 font-mono text-sm">
                      {summary.important_formulas.map((formula) => (
                        <div key={formula} className="p-4 bg-background rounded-xl border border-border text-acid">
                          {formula}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-magenta/10 border border-magenta/30">
                  <div className="font-mono text-xs uppercase text-magenta mb-4">// key concepts</div>
                  <div className="flex flex-wrap gap-2">
                    {summary.key_concepts.map((concept) => (
                      <span key={concept} className="px-3 py-1.5 rounded-full bg-background border border-magenta/30 text-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-surface border border-border">
                  <div className="font-mono text-xs uppercase text-cyber mb-4">// exam tips</div>
                  <ul className="space-y-3">
                    {summary.exam_tips.map((tip) => (
                      <li key={tip} className="flex gap-3 items-start">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-acid" />
                        <span className="text-sm leading-snug">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}
