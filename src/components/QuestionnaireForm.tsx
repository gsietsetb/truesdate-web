import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Brain,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface QuestionnaireFormProps {
  onComplete: (answers: any) => void;
  user: any;
}

const questions = [
  {
    id: "relationship_goal",
    category: "pareja",
    question: "Que buscas en una relacion?",
    type: "scale",
    options: [
      { value: 1, label: "Algo casual", emoji: "😎" },
      { value: 2, label: "Conocer gente", emoji: "🤝" },
      { value: 3, label: "Citas regulares", emoji: "💃" },
      { value: 4, label: "Relacion seria", emoji: "💕" },
      { value: 5, label: "Alma gemela", emoji: "💍" },
    ],
  },
  {
    id: "children_desire",
    category: "hijos",
    question: "Que opinas sobre tener hijos?",
    type: "scale",
    options: [
      { value: 1, label: "Para nada", emoji: "🚫" },
      { value: 2, label: "No creo", emoji: "🤷" },
      { value: 3, label: "Tal vez", emoji: "🤔" },
      { value: 4, label: "Si, algun dia", emoji: "👶" },
      { value: 5, label: "Es mi prioridad", emoji: "👨‍👩‍👧‍👦" },
    ],
  },
  {
    id: "party_lifestyle",
    category: "fiesta",
    question: "Cuanto te gusta salir de fiesta?",
    type: "scale",
    options: [
      { value: 1, label: "Odio las fiestas", emoji: "🏠" },
      { value: 2, label: "Muy rara vez", emoji: "📚" },
      { value: 3, label: "De vez en cuando", emoji: "🍷" },
      { value: 4, label: "Los fines de semana", emoji: "🎉" },
      { value: 5, label: "Soy un party animal", emoji: "🪩" },
    ],
  },
  {
    id: "artistic_side",
    category: "arte",
    question: "Como de importante es el arte y la cultura en tu vida?",
    type: "scale",
    options: [
      { value: 1, label: "No me interesa", emoji: "📺" },
      { value: 2, label: "Poco", emoji: "🎬" },
      { value: 3, label: "Me gusta", emoji: "🎨" },
      { value: 4, label: "Es importante", emoji: "🎭" },
      { value: 5, label: "Es mi pasion", emoji: "🖼️" },
    ],
  },
  {
    id: "sexual_desire",
    category: "pasion",
    question: "Que importancia tiene la intimidad fisica para ti?",
    type: "scale",
    options: [
      { value: 1, label: "No es importante", emoji: "🤝" },
      { value: 2, label: "Poco importante", emoji: "💙" },
      { value: 3, label: "Normal", emoji: "❤️" },
      { value: 4, label: "Muy importante", emoji: "💗" },
      { value: 5, label: "Fundamental", emoji: "🔥" },
    ],
  },
  {
    id: "childhood_trauma",
    category: "psicologia",
    question: "Que experiencia de tu infancia te ha marcado mas?",
    type: "multiple",
    options: [
      { value: "divorce", label: "Divorcio de padres", emoji: "💔" },
      { value: "death", label: "Muerte de ser querido", emoji: "🕊️" },
      { value: "bullying", label: "Bullying escolar", emoji: "😞" },
      { value: "moving", label: "Mudanzas frecuentes", emoji: "📦" },
      { value: "financial", label: "Problemas economicos", emoji: "💸" },
      { value: "none", label: "Infancia feliz", emoji: "☀️" },
    ],
  },
  {
    id: "relationship_fear",
    category: "psicologia",
    question: "Cual es tu mayor miedo en una relacion?",
    type: "multiple",
    options: [
      { value: "abandonment", label: "Que me abandonen", emoji: "😢" },
      { value: "commitment", label: "Comprometerme demasiado", emoji: "⛓️" },
      { value: "betrayal", label: "Infidelidad", emoji: "💔" },
      { value: "incompatibility", label: "No ser compatible", emoji: "🧩" },
      { value: "losing_identity", label: "Perder mi identidad", emoji: "🪞" },
      { value: "no_fear", label: "No tengo miedos", emoji: "💪" },
    ],
  },
  {
    id: "cat_allergy",
    category: "practico",
    question: "Eres alergico a los gatos?",
    type: "boolean",
    options: [
      { value: true, label: "Si, soy alergico", emoji: "🤧" },
      { value: false, label: "No, me encantan", emoji: "🐱" },
    ],
  },
  {
    id: "ideal_saturday",
    category: "lifestyle",
    question: "Cual es tu sabado ideal?",
    type: "multiple",
    options: [
      { value: "reading", label: "Leer en casa tranquilo", emoji: "📖" },
      { value: "party", label: "Fiesta hasta tarde", emoji: "🎉" },
      { value: "nature", label: "Excursion en la naturaleza", emoji: "🏔️" },
      { value: "culture", label: "Museo y exposiciones", emoji: "🏛️" },
      { value: "sports", label: "Deporte y actividad fisica", emoji: "🏃" },
      { value: "friends", label: "Cena con amigos", emoji: "🍕" },
    ],
  },
  {
    id: "communication_style",
    category: "comunicacion",
    question: "Como prefieres resolver los conflictos?",
    type: "multiple",
    options: [
      { value: "direct", label: "Hablando directamente", emoji: "🗣️" },
      { value: "time", label: "Dandome tiempo primero", emoji: "⏳" },
      { value: "avoid", label: "Evitando el conflicto", emoji: "🏃‍♂️" },
      { value: "mediator", label: "Con ayuda externa", emoji: "🤝" },
      { value: "humor", label: "Con humor", emoji: "😄" },
      { value: "writing", label: "Por escrito primero", emoji: "✍️" },
    ],
  },
];

const PROGRESS_MESSAGES = [
  "Empezamos a conocerte...",
  "Mapeando tus valores...",
  "Descubriendo tu estilo...",
  "Analizando tu vibe...",
  "Entendiendo tu mundo...",
  "Casi en la mitad del camino...",
  "Profundizando...",
  "Detalles que importan...",
  "Tu perfil toma forma...",
  "Ultimo paso antes de tu match!",
];

const MATCH_PHOTOS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
];

export function QuestionnaireForm({
  onComplete,
  user,
}: QuestionnaireFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [animatingNext, setAnimatingNext] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const matchProximity = Math.min(
    20 + (currentQuestion / questions.length) * 74,
    94
  );
  const question = questions[currentQuestion];

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const nextQuestion = () => {
    if (animatingNext) return;
    setAnimatingNext(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setIsComplete(true);
        setTimeout(() => onComplete(answers), 3000);
      }
      setAnimatingNext(false);
    }, 300);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = answers[question?.id] !== undefined;

  // ===== COMPLETION SCREEN =====
  if (isComplete) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full animate-float-slow"
            style={{
              background:
                "radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full animate-float-delay-2"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-md">
          {/* Pulsing heart with photos orbit */}
          <div className="relative w-40 h-40 mx-auto mb-8">
            {/* Orbiting photos */}
            {MATCH_PHOTOS.map((photo, i) => (
              <div
                key={i}
                className="absolute w-10 h-10 rounded-full overflow-hidden border-2 border-love-500/40"
                style={{
                  top: `${50 + 45 * Math.sin((i * 2 * Math.PI) / 5 + Date.now() / 2000)}%`,
                  left: `${50 + 45 * Math.cos((i * 2 * Math.PI) / 5 + Date.now() / 2000)}%`,
                  transform: "translate(-50%, -50%)",
                  animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
                }}
              >
                <img
                  src={photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Center heart */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center animate-heartbeat glow-love"
                style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
              >
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">
            Test completado!
          </h2>
          <p className="text-white/50 mb-8">
            {user.name === "Pareja"
              ? "Calculando vuestra compatibilidad..."
              : "Nuestro algoritmo esta buscando tu match perfecto..."}
          </p>

          {/* Processing bar */}
          <div className="glass rounded-2xl p-6 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/40">Analizando...</span>
              <span className="text-sm font-semibold gradient-text-love">94%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  background: "linear-gradient(90deg, #f43f5e, #ec4899, #a855f7)",
                  width: "94%",
                  transition: "width 2s ease",
                }}
              />
            </div>
            <p className="text-xs text-white/30 mt-3">
              Comparando con +2.400 perfiles activos en Barcelona
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== QUESTIONNAIRE =====
  return (
    <div className="min-h-screen bg-surface-900 flex flex-col relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Back + counter */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-20"
            >
              <ArrowLeft className="w-4 h-4" />
              Atras
            </button>

            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-love-500 animate-heartbeat" />
              <span className="text-sm font-medium gradient-text-love">
                TruesDate
              </span>
            </div>

            <span className="text-sm text-white/30">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>

          {/* Progress bar - "acercandote a tu media naranja" */}
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  background:
                    "linear-gradient(90deg, #a855f7, #ec4899, #f43f5e)",
                  width: `${progress}%`,
                }}
              />
            </div>

            {/* Match proximity indicator */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">
                {PROGRESS_MESSAGES[currentQuestion]}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/30">Proximidad:</span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color:
                      matchProximity > 70
                        ? "#f43f5e"
                        : matchProximity > 50
                          ? "#ec4899"
                          : "#a855f7",
                  }}
                >
                  {matchProximity.toFixed(0)}%
                </span>
                <Heart
                  className="w-3 h-3"
                  style={{
                    color:
                      matchProximity > 70
                        ? "#f43f5e"
                        : matchProximity > 50
                          ? "#ec4899"
                          : "#a855f7",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6 relative z-10">
        <div
          className={`w-full max-w-2xl transition-all duration-300 ${
            animatingNext
              ? "opacity-0 translate-x-10"
              : "opacity-100 translate-x-0"
          }`}
        >
          {/* Question */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
              <span className="text-xs text-white/40">
                {question.category.charAt(0).toUpperCase() +
                  question.category.slice(1)}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {question.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 max-w-lg mx-auto">
            {question.type === "scale" &&
              question.options.map((option: any) => {
                const isSelected = answers[question.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`w-full p-4 rounded-xl transition-all duration-200 text-left flex items-center gap-4 group ${
                      isSelected
                        ? "glass-strong border-love-500/40 glow-love"
                        : "glass hover:bg-white/[0.07]"
                    }`}
                    style={
                      isSelected
                        ? { borderColor: "rgba(244,63,94,0.4)" }
                        : {}
                    }
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${isSelected ? "text-white" : "text-white/70"}`}
                      >
                        {option.label}
                      </p>
                      {/* Scale dots */}
                      <div className="flex gap-1.5 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              i < option.value
                                ? isSelected
                                  ? "bg-love-400"
                                  : "bg-brand-500/50"
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {isSelected && (
                      <Heart className="w-5 h-5 text-love-400 shrink-0" />
                    )}
                  </button>
                );
              })}

            {question.type === "multiple" &&
              question.options.map((option: any) => {
                const isSelected = answers[question.id] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
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
                    <span className="text-xl">
                      {(option as any).emoji || "•"}
                    </span>
                    <span
                      className={`flex-1 font-medium ${isSelected ? "text-white" : "text-white/70"}`}
                    >
                      {option.label}
                    </span>
                    {isSelected && (
                      <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
                    )}
                  </button>
                );
              })}

            {question.type === "boolean" && (
              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option: any) => {
                  const isSelected = answers[question.id] === option.value;
                  return (
                    <button
                      key={option.value.toString()}
                      onClick={() => handleAnswer(question.id, option.value)}
                      className={`p-6 rounded-2xl transition-all duration-200 text-center flex flex-col items-center gap-3 ${
                        isSelected
                          ? "glass-strong border-accent-500/40 glow-accent"
                          : "glass hover:bg-white/[0.07]"
                      }`}
                      style={
                        isSelected
                          ? { borderColor: "rgba(236,72,153,0.4)" }
                          : {}
                      }
                    >
                      <span className="text-3xl">
                        {(option as any).emoji || ""}
                      </span>
                      <span
                        className={`font-medium text-sm ${isSelected ? "text-white" : "text-white/70"}`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Next button */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={nextQuestion}
              disabled={!isAnswered}
              className={`px-10 py-3.5 rounded-full text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                isAnswered
                  ? "btn-gradient text-white"
                  : "bg-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              {currentQuestion === questions.length - 1
                ? "Ver mis matches"
                : "Siguiente"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Floating match faces at bottom */}
          <div className="mt-8 flex justify-center items-center gap-3 opacity-30">
            <div className="flex -space-x-2">
              {MATCH_PHOTOS.slice(0, 3).map((photo, i) => (
                <img
                  key={i}
                  src={photo}
                  alt=""
                  className="w-7 h-7 rounded-full border border-surface-900 object-cover"
                  style={{ filter: `blur(${2 - i}px)` }}
                />
              ))}
            </div>
            <span className="text-xs text-white/30">
              Tu match se acerca...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
