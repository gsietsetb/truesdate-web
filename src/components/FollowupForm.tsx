import { useState } from "react";
import {
  ChevronRight,
  Heart,
  ArrowLeft,
  Sparkles,
  Zap,
} from "lucide-react";
import type { FollowupQuestion } from "../lib/supabase";

interface FollowupFormProps {
  questions: FollowupQuestion[];
  onComplete: (answers: Record<string, any>) => void;
  onSkip: () => void;
}

export function FollowupForm({
  questions,
  onComplete,
  onSkip,
}: FollowupFormProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  if (questions.length === 0) {
    onSkip();
    return null;
  }

  const question = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isAnswered = answers[question?.id] !== undefined;

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [question.id]: value });
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(answers);
    }
  };

  const options = typeof question.options === "string"
    ? JSON.parse(question.options)
    : question.options;

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onSkip}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Saltar
            </button>

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-medium text-brand-400">
                Afinando tu match
              </span>
            </div>

            <span className="text-sm text-white/30">
              {currentIdx + 1}/{questions.length}
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  background:
                    "linear-gradient(90deg, #a855f7, #ec4899)",
                  width: `${progress}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">
                Preguntas personalizadas basadas en tus respuestas
              </span>
              <span className="text-xs text-brand-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Bonus accuracy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {question.question}
            </h2>
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            {question.question_type === "boolean" ? (
              <div className="grid grid-cols-2 gap-4">
                {options.map((opt: any) => {
                  const isSelected = answers[question.id] === opt.value;
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => handleAnswer(opt.value)}
                      className={`p-6 rounded-2xl transition-all duration-200 text-center flex flex-col items-center gap-3 ${
                        isSelected
                          ? "glass-strong border-brand-500/40 glow-brand"
                          : "glass hover:bg-white/[0.07]"
                      }`}
                      style={
                        isSelected
                          ? { borderColor: "rgba(168,85,247,0.4)" }
                          : {}
                      }
                    >
                      <span className="text-3xl">{opt.emoji || ""}</span>
                      <span
                        className={`font-medium text-sm ${
                          isSelected ? "text-white" : "text-white/70"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              options.map((opt: any) => {
                const isSelected = answers[question.id] === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleAnswer(opt.value)}
                    className={`w-full p-4 rounded-xl transition-all duration-200 text-left flex items-center gap-4 ${
                      isSelected
                        ? "glass-strong border-brand-500/40 glow-brand"
                        : "glass hover:bg-white/[0.07]"
                    }`}
                    style={
                      isSelected
                        ? { borderColor: "rgba(168,85,247,0.4)" }
                        : {}
                    }
                  >
                    <span className="text-xl">{opt.emoji || "•"}</span>
                    <span
                      className={`flex-1 font-medium ${
                        isSelected ? "text-white" : "text-white/70"
                      }`}
                    >
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={next}
              disabled={!isAnswered}
              className={`px-10 py-3.5 rounded-full text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                isAnswered
                  ? "btn-gradient text-white"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {currentIdx === questions.length - 1
                ? "Mejorar mis matches"
                : "Siguiente"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
