import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { apiClient } from "@/services/api";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  status: "mastered" | "learning" | "difficult";
}

interface FlashcardDeck {
  id: number;
  title: string;
  cards: Flashcard[];
  total_cards: number;
}

type Status = "mastered" | "learning" | "difficult";

export default function FlashcardsPage() {
  const [documentId, setDocumentId] = useState("1");
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardStatuses, setCardStatuses] = useState<Record<number, Status>>({});

  const generateFlashcards = async () => {
    setLoading(true);
    setError(null);
    try {
      const newDeck = await apiClient.generateFlashcards(Number(documentId), 20);
      setDeck(newDeck);
      setIndex(0);
      setFlipped(false);
      setCardStatuses({});
    } catch {
      setError("Failed to generate flashcards. Make sure you have uploaded a document first.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateFlashcards();
  }, [documentId]);

  const mark = async (value: Status) => {
    if (deck?.cards[index]) {
      setCardStatuses((current) => ({ ...current, [index]: value }));
      try {
        await apiClient.updateCardStatus(deck.cards[index].id, value);
      } catch {
        // Silently fail on card update
      }
    }
    setFlipped(false);
    setIndex((i) => (i + 1) % (deck?.cards.length || 1));
  };

  const counts = {
    mastered: Object.values(cardStatuses).filter((v) => v === "mastered").length,
    learning: Object.values(cardStatuses).filter((v) => v === "learning").length,
    difficult: Object.values(cardStatuses).filter((v) => v === "difficult").length,
  };

  const card = deck?.cards[index];

  return (
    <PageShell>
      <PageHeader
        eyebrow="04 / flashcards"
        title={
          <>
            Flip. Recall. <span className="text-gradient italic">Repeat.</span>
          </>
        }
        subtitle="Spaced-repetition style cards generated from your notes."
      />

      <section className="max-w-5xl mx-auto px-6 py-16">
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
            onClick={generateFlashcards}
            disabled={loading}
            className="px-4 py-2 bg-acid text-background font-semibold rounded-lg hover:bg-foreground disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">{error}</div>}

        {!deck ? (
          <div className="text-center py-12 text-muted-foreground">
            {loading ? "Generating flashcards..." : "Upload a document and generate flashcards to start"}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-12">
              <Stat label="mastered" value={counts.mastered} color="text-acid" />
              <Stat label="learning" value={counts.learning} color="text-cyber" />
              <Stat label="difficult" value={counts.difficult} color="text-magenta" />
            </div>

            <div style={{ perspective: "1000px" }}>
              <motion.div
                onClick={() => setFlipped((value) => !value)}
                className="relative h-[26rem] cursor-pointer"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  className="absolute inset-0 rounded-3xl bg-surface border border-border p-10 flex flex-col justify-between"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex justify-between">
                    <span className="font-mono text-xs px-3 py-1 rounded-full bg-acid/20 text-acid">
                      {deck.title}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {index + 1} / {deck.cards.length}
                    </span>
                  </div>
                  <h2 className="text-display text-4xl md:text-6xl font-bold leading-tight">
                    {card?.front}
                  </h2>
                  <div className="font-mono text-xs text-muted-foreground">tap to reveal</div>
                </div>

                <div
                  className="absolute inset-0 rounded-3xl bg-acid text-background p-10 flex flex-col justify-between brutal-shadow-magenta"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="font-mono text-xs">// answer</div>
                  <p className="text-display text-2xl md:text-3xl font-bold leading-snug">
                    {card?.back}
                  </p>
                  <div className="font-mono text-xs opacity-70">tap to flip back</div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <button
                onClick={() => mark("difficult")}
                className="p-4 rounded-2xl border-2 border-magenta/30 hover:bg-magenta/10 font-semibold"
              >
                Difficult
              </button>
              <button
                onClick={() => mark("learning")}
                className="p-4 rounded-2xl border-2 border-cyber/30 hover:bg-cyber/10 font-semibold"
              >
                Learning
              </button>
              <button
                onClick={() => mark("mastered")}
                className="p-4 rounded-2xl border-2 border-acid bg-acid/10 hover:bg-acid hover:text-background font-semibold transition-colors"
              >
                Mastered
              </button>
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-5 rounded-2xl bg-surface border border-border">
      <div className="font-mono text-xs uppercase text-muted-foreground">{label}</div>
      <div className={`text-display text-4xl font-bold ${color} mt-1`}>{value}</div>
    </div>
  );
}
