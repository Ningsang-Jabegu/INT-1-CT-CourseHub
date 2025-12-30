import { useMemo, useState } from "react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizExerciseProps {
  title?: string;
  questions: Question[];
}

export default function QuizExercise({ title = "Quiz", questions }: QuizExerciseProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = (idx: number) => answers[idx] === questions[idx].correctAnswer;

  const score = useMemo(() => {
    return questions.reduce((acc, _, i) => acc + (isCorrect(i) ? 1 : 0), 0);
  }, [questions, answers]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-primary">{title}</h4>
        {submitted && (
          <span className="text-sm font-medium">
            Score: <span className="text-primary">{score}</span> / {questions.length}
          </span>
        )}
      </div>

      <div className="space-y-4 text-sm">
        {questions.map((q, idx) => {
          const correct = submitted ? isCorrect(idx) : undefined;
          const borderClass =
            submitted && correct === true
              ? "border-green-500"
              : submitted && correct === false
              ? "border-red-500"
              : "border-border/70";

          return (
            <div key={idx} className={`rounded border ${borderClass} p-3 bg-card/60`}>
              <div className="font-medium text-foreground mb-2">{q.question}</div>
              <ul className="space-y-1">
                {q.options.map((opt, oidx) => {
                  const selected = answers[idx] === opt;
                  const showCorrect = submitted && opt === q.correctAnswer;
                  const showWrong = submitted && selected && opt !== q.correctAnswer;
                  return (
                    <li key={oidx}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${idx}`}
                          className="accent-primary"
                          checked={selected}
                          onChange={() => setAnswers((prev) => ({ ...prev, [idx]: opt }))}
                          disabled={submitted}
                        />
                        <span
                          className={
                            showCorrect
                              ? "text-green-600 dark:text-green-400"
                              : showWrong
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                          }
                        >
                          {opt}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
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
