import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader, PageShell } from "@/components/PageShell";
import { apiClient } from "@/services/api";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
  type: string;
  difficulty: string;
}

export default function QuizPage() {
  const [documentId, setDocumentId] = useState("1");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answered, setAnswered] = useState<Record<number, number>>({});

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const quiz = await apiClient.generateQuiz(Number(documentId), 10);
      setQuestions(quiz.questions || []);
      setIndex(0);
      setPicked(null);
      setScore(0);
      setAnswered({});
    } catch {
      setError("Failed to generate quiz. Make sure you have uploaded a document first.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQuiz();
  }, [documentId]);

  const question = questions[index];
  const isLast = questions.length > 0 && index === questions.length - 1;

  const next = () => {
    if (picked !== null && question) {
      const selectedOption = question.options[picked];
      if (selectedOption === question.correct_answer) {
        setScore((s) => s + 1);
      }
      setAnswered((a) => ({ ...a, [question.id]: picked }));
    }
    setPicked(null);
    setIndex((i) => (i + 1) % questions.length);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="03 / quiz"
        title={
          <>
            Test what <span className="text-gradient italic">stuck</span>.
          </>
        }
        subtitle="Auto-generated MCQs, true/false, and fill-in-the-blanks from your uploads."
      />

      <section className="max-w-4xl mx-auto px-6 py-16">
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
            onClick={generateQuiz}
            disabled={loading}
            className="px-4 py-2 bg-acid text-background font-semibold rounded-lg hover:bg-foreground disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg">{error}</div>}

        {questions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {loading ? "Generating quiz..." : "Upload a document and generate a quiz to start"}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 font-mono text-sm">
              <span className="text-muted-foreground">
                question {index + 1} / {questions.length}
              </span>
              <span className="text-acid">score: {score}</span>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden mb-12">
              <motion.div
                className="h-full bg-acid"
                animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 rounded-3xl bg-surface border border-border"
              >
                <div className="font-mono text-xs uppercase text-magenta mb-4">// {question?.type || "mcq"}</div>
                <h2 className="text-display text-3xl md:text-4xl font-bold leading-tight">
                  {question?.question}
                </h2>

                <div className="mt-10 grid sm:grid-cols-2 gap-4">
                  {question?.options?.map((option, optionIndex) => {
                    const isPicked = picked === optionIndex;
                    const isCorrect = picked !== null && option === question.correct_answer;
                    const isWrong = isPicked && option !== question.correct_answer;
                    return (
                      <button
                        key={option}
                        onClick={() => picked === null && setPicked(optionIndex)}
                        className={`text-left p-5 rounded-2xl border-2 transition-all font-medium ${
                          isCorrect
                            ? "border-acid bg-acid/10 text-acid"
                            : isWrong
                              ? "border-destructive bg-destructive/10"
                              : isPicked
                                ? "border-foreground bg-surface-2"
                                : "border-border bg-background hover:border-foreground"
                        }`}
                      >
                        <span className="font-mono text-xs text-muted-foreground mr-3">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>

                {picked !== null ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex items-center justify-between gap-4"
                  >
                    <p className={picked !== -1 && question?.options[picked] === question?.correct_answer ? "text-acid font-mono text-sm" : "text-destructive font-mono text-sm"}>
                      {question?.options[picked] === question?.correct_answer ? "correct" : `answer: ${question?.correct_answer}`}
                    </p>
                    <button
                      onClick={next}
                      className="px-6 py-3 bg-acid text-background font-semibold rounded-xl hover:bg-foreground transition-colors"
                    >
                      {isLast ? "Restart" : "Next"}
                    </button>
                  </motion.div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </section>
    </PageShell>
  );
}
