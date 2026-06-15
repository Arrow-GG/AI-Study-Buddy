import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";

const features = [
  {
    tag: "01",
    title: "Upload anything",
    desc: "PDFs, DOCX, TXT, and scanned notes. Drop it in and we parse it.",
    href: "/upload",
    dot: "bg-acid",
  },
  {
    tag: "02",
    title: "AI summaries",
    desc: "Compress long notes into one-liners, key concepts, and exam tips.",
    href: "/summary",
    dot: "bg-magenta",
  },
  {
    tag: "03",
    title: "Auto quizzes",
    desc: "MCQs, true/false, and fill-in-the-blanks generated from your material.",
    href: "/quiz",
    dot: "bg-cyber",
  },
  {
    tag: "04",
    title: "Smart flashcards",
    desc: "Flippable revision cards with mastered vs learning tracking.",
    href: "/flashcards",
    dot: "bg-electric",
  },
  {
    tag: "05",
    title: "Chat with notes",
    desc: "RAG-style Q&A grounded in your uploaded documents.",
    href: "/chat",
    dot: "bg-acid",
  },
  {
    tag: "06",
    title: "Exam mode",
    desc: "Probable questions, quick revisions, and high-yield concepts.",
    href: "/quiz",
    dot: "bg-magenta",
  },
];

const stack = [
  "FastAPI",
  "RAG",
  "PDF parsing",
  "DOCX",
  "Chunking",
  "Vector-ready",
  "Next.js",
  "Tailwind",
  "Quizzes",
  "Flashcards",
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-32 -right-32 w-[38rem] h-[38rem] bg-magenta/20 animate-blob blur-3xl" />
        <div
          className="absolute -bottom-32 -left-32 w-[38rem] h-[38rem] bg-electric/20 animate-blob blur-3xl"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acid mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-acid animate-pulse" />
            v0.1 - AI study assistant
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-display font-bold leading-none tracking-normal text-[clamp(3rem,11vw,10rem)]"
          >
            Study<span className="text-acid">.</span>
            <br />
            faster than
            <br />
            <span className="text-gradient italic">yesterday</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 max-w-xl text-lg text-muted-foreground"
          >
            Drop your notes. We turn PDFs into summaries, quizzes, flashcards,
            and a chatbot that knows your syllabus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-3 px-7 py-4 bg-acid text-background font-semibold rounded-2xl brutal-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              Upload your notes
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-3 px-7 py-4 border border-border bg-surface/60 backdrop-blur rounded-2xl font-semibold hover:bg-surface transition-colors"
            >
              Try the chat
            </Link>
          </motion.div>

          <div className="mt-24 grid md:grid-cols-3 gap-6">
            <Metric label="pages parsed" value="12,847" color="text-acid" />
            <Metric label="questions made" value="3.2k" color="text-magenta" />
            <Metric label="avg. recall" value="+38%" color="text-cyber" />
          </div>
        </div>
      </section>

      <section className="border-b border-border py-6 bg-surface/40 overflow-hidden">
        <div className="flex marquee whitespace-nowrap gap-12 font-mono text-sm text-muted-foreground">
          {[...stack, ...stack].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-12">
              <span className="text-acid">*</span> {item}
            </span>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-magenta mb-3">
              // features
            </div>
            <h2 className="text-display text-5xl md:text-6xl font-bold max-w-2xl">
              Everything your professor <span className="italic text-gradient">did not</span>{" "}
              teach.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm">
            Six tools, one workflow. From raw PDF to mastered concept in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.tag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={feature.href}
                className="group block relative p-7 rounded-3xl bg-surface border border-border hover:border-acid transition-all hover:-translate-y-1 h-full overflow-hidden"
              >
                <div className="relative">
                  <div className="flex justify-between items-start mb-12">
                    <span className="font-mono text-sm text-muted-foreground">
                      /{feature.tag}
                    </span>
                    <span className={`w-3 h-3 rounded-full ${feature.dot}`} />
                  </div>
                  <h3 className="text-display text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="mt-6 font-mono text-xs text-acid opacity-0 group-hover:opacity-100 transition-opacity">
                    open
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="font-mono text-xs uppercase tracking-widest text-cyber mb-3">
            // pipeline
          </div>
          <h2 className="text-display text-5xl md:text-6xl font-bold mb-16 max-w-3xl">
            How a PDF becomes <span className="text-acid">knowledge</span>.
          </h2>

          <div className="grid md:grid-cols-6 gap-3">
            {["PDF in", "Extract", "Chunk", "Index", "Retrieve", "Answer"].map(
              (step, index) => (
                <div key={step} className="relative p-5 bg-background border border-border rounded-2xl">
                  <div className="font-mono text-xs text-magenta mb-2">
                    0{index + 1}
                  </div>
                  <div className="text-display font-bold text-lg">{step}</div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="relative p-6 rounded-2xl bg-surface/80 border border-border backdrop-blur overflow-hidden">
      <div className="font-mono text-xs uppercase text-muted-foreground">{label}</div>
      <div className={`mt-2 text-display text-5xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
