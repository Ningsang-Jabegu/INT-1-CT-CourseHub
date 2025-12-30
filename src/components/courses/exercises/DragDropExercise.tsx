import { useMemo, useState } from "react";

interface DragItem {
  prompt: string;
  matches: string[]; // accepted answers
}

interface DragDropExerciseProps {
  title?: string;
  items: DragItem[];
}

export default function DragDropExercise({ title = "Drag and Drop", items }: DragDropExerciseProps) {
  const bank = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.matches.forEach((m) => set.add(m)));
    // shuffle
    const arr = Array.from(set);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [items]);

  const [answers, setAnswers] = useState<Record<number, string | null>>({});
  const [available, setAvailable] = useState<string[]>(bank);
  const [submitted, setSubmitted] = useState(false);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, value: string) => {
    e.dataTransfer.setData("text/plain", value);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    const value = e.dataTransfer.getData("text/plain");
    if (!value) return;
    setAnswers((prev) => ({ ...prev, [idx]: value }));
    setAvailable((prev) => prev.filter((v) => v !== value));
    e.preventDefault();
  };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const isCorrect = (idx: number) => {
    const val = answers[idx];
    if (!val) return false;
    return items[idx].matches.includes(val);
  };

  const score = useMemo(() => {
    return items.reduce((acc, _, i) => acc + (isCorrect(i) ? 1 : 0), 0);
  }, [items, answers]);

  const removeAnswer = (idx: number) => {
    const val = answers[idx];
    if (!val) return;
    setAnswers((prev) => ({ ...prev, [idx]: null }));
    setAvailable((prev) => [...prev, val]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-primary">{title}</h4>
        {submitted && (
          <span className="text-sm font-medium">
            Score: <span className="text-primary">{score}</span> / {items.length}
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Prompts and drop zones */}
        <div className="space-y-3">
          {items.map((item, idx) => {
            const val = answers[idx];
            const correct = submitted ? isCorrect(idx) : undefined;
            const borderClass =
              submitted && correct === true
                ? "border-green-500"
                : submitted && correct === false
                ? "border-red-500"
                : "border-border/70";

            return (
              <div key={idx} className={`rounded border ${borderClass} bg-card/60 p-3`}
                   onDragOver={allowDrop}
                   onDrop={(e) => onDrop(e, idx)}
              >
                <div className="font-medium text-foreground mb-2">{item.prompt}</div>
                <div className="min-h-[40px] rounded bg-background border border-dashed border-input flex items-center justify-between px-2 py-1">
                  <span className="text-sm text-muted-foreground">
                    {val ?? "Drop an option here"}
                  </span>
                  {val && (
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => removeAnswer(idx)}
                      disabled={submitted}
                    >
                      remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bank */}
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-2">Options</h5>
          <div className="flex flex-wrap gap-2">
            {available.length === 0 ? (
              <p className="text-xs text-muted-foreground">No options left.</p>
            ) : (
              available.map((opt) => (
                <div
                  key={opt}
                  draggable
                  onDragStart={(e) => onDragStart(e, opt)}
                  className="px-2 py-1 rounded-md border border-input bg-background text-xs cursor-grab active:cursor-grabbing"
                  title="Drag to a prompt"
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
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
              setAvailable(bank);
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
