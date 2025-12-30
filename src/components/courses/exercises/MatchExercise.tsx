import { useMemo, useState } from "react";

interface Pair {
  left: string;
  right: string;
}

interface MatchExerciseProps {
  title?: string;
  pairs: Pair[];
}

export default function MatchExercise({ title = "Match the Following", pairs }: MatchExerciseProps) {
  const rightOptions = useMemo(() => {
    const opts = pairs.map((p) => p.right);
    // shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [pairs]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (idx: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const isCorrect = (idx: number) => answers[idx] === pairs[idx].right;

  const score = useMemo(() => {
    return pairs.reduce((acc, _, i) => acc + (isCorrect(i) ? 1 : 0), 0);
  }, [pairs, answers]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-primary">{title}</h4>
        {submitted && (
          <span className="text-sm font-medium">
            Score: <span className="text-primary">{score}</span> / {pairs.length}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        {pairs.map((pair, idx) => {
          const correct = submitted ? isCorrect(idx) : undefined;
          const borderClass =
            submitted && correct === true
              ? "border-green-500"
              : submitted && correct === false
              ? "border-red-500"
              : "border-border/70";

          return (
            <div key={idx} className={`flex items-center gap-3 rounded border ${borderClass} p-3 bg-card/60`}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{pair.left}</div>
              </div>
              <div className="w-48">
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
                  value={answers[idx] ?? ""}
                  onChange={(e) => handleSelect(idx, e.target.value)}
                  disabled={submitted}
                >
                  <option value="">Select match…</option>
                  {rightOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm"
          onClick={() => setSubmitted(true)}
          disabled={submitted}
        >
          Submit
        </button>
        {submitted && (
          <button
            className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-sm"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
