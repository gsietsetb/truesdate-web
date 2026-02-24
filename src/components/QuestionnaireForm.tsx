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

// ============================================================
// TRUESDATE QUESTIONS v2 — 16 questions for real matching
// Dimensions: relationship goal · children · lifestyle · art
//             sexuality · communication · love language
//             attachment style · values · health · diet
//             living plans · relationship rhythm · ambition
//             spirituality · dealbreaker
// ============================================================
const questions = [
  // --- BLOCK 1: WHAT YOU WANT ---
  {
    id: "relationship_goal",
    category: "pareja",
    question: "Que buscas en este momento?",
    type: "scale",
    options: [
      { value: 1, label: "Algo casual sin etiquetas", emoji: "😎" },
      { value: 2, label: "Conocer gente nueva", emoji: "🤝" },
      { value: 3, label: "Citas con calma", emoji: "💃" },
      { value: 4, label: "Relacion seria y comprometida", emoji: "💕" },
      { value: 5, label: "Mi persona para toda la vida", emoji: "💍" },
    ],
  },
  {
    id: "children_desire",
    category: "familia",
    question: "Quieres tener hijos en el futuro?",
    type: "scale",
    options: [
      { value: 1, label: "Definitivamente no", emoji: "🚫" },
      { value: 2, label: "No lo creo", emoji: "🤷" },
      { value: 3, label: "Aun no lo se", emoji: "🤔" },
      { value: 4, label: "Si, algun dia", emoji: "👶" },
      { value: 5, label: "Es lo que mas quiero", emoji: "👨‍👩‍👧‍👦" },
    ],
  },

  // --- BLOCK 2: LOVE LANGUAGE ---
  {
    id: "love_language",
    category: "amor",
    question: "Como te sientes mas querido/a?",
    type: "multiple",
    options: [
      { value: "words", label: "Palabras de afirmacion", emoji: "💬" },
      { value: "time", label: "Tiempo de calidad", emoji: "⏰" },
      { value: "acts", label: "Actos de servicio", emoji: "🛠️" },
      { value: "touch", label: "Contacto fisico", emoji: "🤗" },
      { value: "gifts", label: "Regalos y detalles", emoji: "🎁" },
    ],
  },

  // --- BLOCK 3: ATTACHMENT STYLE ---
  {
    id: "attachment_style",
    category: "vinculo",
    question: "Como eres en las relaciones?",
    type: "multiple",
    options: [
      { value: "secure", label: "Seguro/a: confio y soy constante", emoji: "🌳" },
      { value: "anxious", label: "Necesito mucha reassurance", emoji: "📱" },
      { value: "avoidant", label: "Valoro mucho mi espacio propio", emoji: "🦅" },
      { value: "balanced", label: "Equilibrado, depende de la persona", emoji: "⚖️" },
    ],
  },

  // --- BLOCK 4: COMMUNICATION ---
  {
    id: "communication_style",
    category: "comunicacion",
    question: "Como gestionas los conflictos?",
    type: "multiple",
    options: [
      { value: "direct", label: "Lo hablo de frente y enseguida", emoji: "🗣️" },
      { value: "time", label: "Me tomo un tiempo y luego hablo", emoji: "⏳" },
      { value: "writing", label: "Prefiero escribirlo primero", emoji: "✍️" },
      { value: "humor", label: "Con humor lo suavizo", emoji: "😄" },
      { value: "avoid", label: "Tiendo a evitar el conflicto", emoji: "🏃" },
    ],
  },

  // --- BLOCK 5: SEXUALITY ---
  {
    id: "sexual_desire",
    category: "intimidad",
    question: "Que importancia tiene la intimidad fisica en tu relacion ideal?",
    type: "scale",
    options: [
      { value: 1, label: "No es un factor clave", emoji: "🤝" },
      { value: 2, label: "Poco importante", emoji: "💙" },
      { value: 3, label: "Importante pero no lo primero", emoji: "❤️" },
      { value: 4, label: "Muy importante", emoji: "💗" },
      { value: 5, label: "Es fundamental para mi", emoji: "🔥" },
    ],
  },

  // --- BLOCK 6: LIFESTYLE ---
  {
    id: "party_lifestyle",
    category: "social",
    question: "Cual es tu vida social?",
    type: "scale",
    options: [
      { value: 1, label: "Me quedo en casa casi siempre", emoji: "🏠" },
      { value: 2, label: "Salgo muy poco", emoji: "📚" },
      { value: 3, label: "Salgo de vez en cuando", emoji: "🍷" },
      { value: 4, label: "Casi todos los fines de semana", emoji: "🎉" },
      { value: 5, label: "Soy un party animal", emoji: "🪩" },
    ],
  },
  {
    id: "ideal_saturday",
    category: "ocio",
    question: "Tu sabado perfecto seria...",
    type: "multiple",
    options: [
      { value: "nature", label: "Senderismo o playa", emoji: "🏔️" },
      { value: "culture", label: "Museo, teatro o concierto", emoji: "🎭" },
      { value: "sports", label: "Deporte o gym", emoji: "🏃" },
      { value: "home", label: "Netflix, sofa y descanso", emoji: "🛋️" },
      { value: "friends", label: "Comida larga con amigos", emoji: "🍕" },
      { value: "explore", label: "Explorar algo nuevo", emoji: "🗺️" },
    ],
  },

  // --- BLOCK 7: HEALTH & ACTIVITY ---
  {
    id: "health_lifestyle",
    category: "salud",
    question: "Cual es tu relacion con el deporte y la salud?",
    type: "scale",
    options: [
      { value: 1, label: "No hago ejercicio", emoji: "🛋️" },
      { value: 2, label: "Camino y poco mas", emoji: "🚶" },
      { value: 3, label: "Ejercicio ocasional", emoji: "🚴" },
      { value: 4, label: "Gym o deporte regular", emoji: "💪" },
      { value: 5, label: "El deporte es central en mi vida", emoji: "🏆" },
    ],
  },

  // --- BLOCK 8: DIET ---
  {
    id: "diet",
    category: "alimentacion",
    question: "Como comes habitualmente?",
    type: "multiple",
    options: [
      { value: "omnivore", label: "Como de todo sin filtros", emoji: "🥩" },
      { value: "flexitarian", label: "Flexitariano, poca carne", emoji: "🥗" },
      { value: "vegetarian", label: "Vegetariano/a", emoji: "🥦" },
      { value: "vegan", label: "Vegano/a", emoji: "🌱" },
      { value: "special", label: "Dieta especial (alergias etc)", emoji: "⚠️" },
    ],
  },

  // --- BLOCK 9: CULTURE & ART ---
  {
    id: "artistic_side",
    category: "cultura",
    question: "Cuanto espacio ocupa la cultura en tu vida?",
    type: "scale",
    options: [
      { value: 1, label: "No me llama mucho", emoji: "📺" },
      { value: 2, label: "De vez en cuando", emoji: "🎬" },
      { value: 3, label: "Me gusta bastante", emoji: "🎨" },
      { value: 4, label: "Es importante para mi", emoji: "🎭" },
      { value: 5, label: "Es una pasion", emoji: "🖼️" },
    ],
  },

  // --- BLOCK 10: AMBITION & CAREER ---
  {
    id: "ambition_level",
    category: "ambicion",
    question: "Que lugar ocupa tu carrera o proyecto propio en tu vida?",
    type: "scale",
    options: [
      { value: 1, label: "Es solo un medio para vivir", emoji: "🏖️" },
      { value: 2, label: "Me gusta pero no me obsesiona", emoji: "😌" },
      { value: 3, label: "Equilibrio trabajo-vida", emoji: "⚖️" },
      { value: 4, label: "Soy muy ambicioso/a", emoji: "🚀" },
      { value: 5, label: "Mi proyecto es mi vida", emoji: "🔥" },
    ],
  },

  // --- BLOCK 11: SPIRITUALITY / VALUES ---
  {
    id: "spirituality",
    category: "valores",
    question: "Cual es tu relacion con la espiritualidad o la religion?",
    type: "multiple",
    options: [
      { value: "atheist", label: "Ateo/a convencido/a", emoji: "🔬" },
      { value: "agnostic", label: "Agnostico, no lo se", emoji: "🤷" },
      { value: "spiritual", label: "Espiritual pero no religioso/a", emoji: "✨" },
      { value: "religious_relaxed", label: "Creyente no practicante", emoji: "🙏" },
      { value: "religious_active", label: "Practicante activo/a", emoji: "⛪" },
    ],
  },

  // --- BLOCK 12: WHERE TO LIVE ---
  {
    id: "living_plans",
    category: "futuro",
    question: "Donde te ves viviendo en 5 anos?",
    type: "multiple",
    options: [
      { value: "city", label: "Ciudad, siempre ciudad", emoji: "🏙️" },
      { value: "abroad", label: "Fuera de Espana", emoji: "✈️" },
      { value: "nature", label: "Cerca de la naturaleza", emoji: "🌲" },
      { value: "flexible", label: "Flexible, donde surja", emoji: "🗺️" },
      { value: "hometown", label: "Cerca de mi familia", emoji: "🏡" },
    ],
  },

  // --- BLOCK 13: RELATIONSHIP RHYTHM ---
  {
    id: "relationship_rhythm",
    category: "convivencia",
    question: "Como te imaginas el dia a dia en pareja?",
    type: "multiple",
    options: [
      { value: "together_always", label: "Juntos la mayor parte del tiempo", emoji: "🤝" },
      { value: "together_evenings", label: "Tardes/noches juntos, dias libres", emoji: "🌙" },
      { value: "own_space", label: "Cada uno con su espacio", emoji: "🦅" },
      { value: "living_together", label: "Quiero convivir pronto", emoji: "🏠" },
      { value: "slow", label: "Me lo tomo con calma", emoji: "🐢" },
    ],
  },

  // --- BLOCK 14: DEALBREAKER ---
  {
    id: "dealbreaker",
    category: "limites",
    question: "Que es un dealbreaker absoluto para ti?",
    type: "multiple",
    options: [
      { value: "smoking", label: "Que fume", emoji: "🚬" },
      { value: "no_kids", label: "No querer hijos (si yo quiero)", emoji: "👶" },
      { value: "wants_kids", label: "Querer hijos (si yo no quiero)", emoji: "🚫" },
      { value: "long_distance", label: "Larga distancia", emoji: "✈️" },
      { value: "none", label: "No tengo dealbreakers fijos", emoji: "🤷" },
    ],
  },
];

const PROGRESS_MESSAGES = [
  "Empezamos a conocerte...",
  "Tus planes de futuro...",
  "Tu lenguaje del amor...",
  "Como te vinculas...",
  "Tu estilo de comunicacion...",
  "La quimica importa...",
  "Tu vida social...",
  "Tu ocio ideal...",
  "Tu relacion con el deporte...",
  "Habitos y alimentacion...",
  "Tu lado cultural...",
  "Tus ambiciones...",
  "Tus valores profundos...",
  "Donde quieres vivir...",
  "Tu ritmo en pareja...",
  "Ultimo paso - tus limites!",
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
