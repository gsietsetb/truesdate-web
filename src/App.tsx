import { useState, useEffect, useRef } from "react";
import {
  Heart,
  Sparkles,
  ChevronRight,
  Check,
  Star,
  Lock,
  Zap,
  MapPin,
  Brain,
  Shield,
  ArrowRight,
  Wine,
  Music,
  Coffee,
  Crown,
  Users,
  Calendar,
  Clock,
  Play,
  Flame,
  Eye,
  MessageCircle,
} from "lucide-react";

import { AuthForm } from "./components/AuthForm";
import { QuestionnaireForm } from "./components/QuestionnaireForm";
import { Dashboard } from "./components/Dashboard";
import { AdminPanel } from "./components/AdminPanel";
import { FollowupForm } from "./components/FollowupForm";
import { useAuth } from "./contexts/AuthContext";
import { useAnswers, useComputeMatches, useFollowupQuestions } from "./hooks/useTruesDate";

type AppState = "landing" | "questionnaire" | "auth" | "dashboard" | "admin" | "followup";

// People for the neural network
const NETWORK_PEOPLE = [
  { id: 1, name: "Sara", age: 28, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face", gender: "f" },
  { id: 2, name: "Marc", age: 31, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face", gender: "m" },
  { id: 3, name: "Lucia", age: 26, photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face", gender: "f" },
  { id: 4, name: "David", age: 29, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face", gender: "m" },
  { id: 5, name: "Ana", age: 27, photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face", gender: "f" },
  { id: 6, name: "Carlos", age: 32, photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face", gender: "m" },
  { id: 7, name: "Paula", age: 25, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face", gender: "f" },
  { id: 8, name: "Jordi", age: 30, photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face", gender: "m" },
  { id: 9, name: "Maria", age: 29, photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face", gender: "f" },
  { id: 10, name: "Alex", age: 27, photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300&h=300&fit=crop&crop=face", gender: "m" },
  { id: 11, name: "Elena", age: 28, photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face", gender: "f" },
  { id: 12, name: "Pol", age: 33, photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=300&h=300&fit=crop&crop=face", gender: "m" },
];

// Node positions for SVG (viewBox 900x650)
const NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  1:  { x: 130, y: 110 },
  2:  { x: 700, y: 90 },
  3:  { x: 80,  y: 300 },
  4:  { x: 770, y: 280 },
  5:  { x: 170, y: 480 },
  6:  { x: 650, y: 440 },
  7:  { x: 360, y: 140 },
  8:  { x: 520, y: 310 },
  9:  { x: 280, y: 350 },
  10: { x: 600, y: 160 },
  11: { x: 130, y: 570 },
  12: { x: 720, y: 550 },
};

// Connections between nodes (id-based)
const CONNECTIONS = [
  { from: 1, to: 2,  strength: 94, primary: true },
  { from: 3, to: 4,  strength: 87, primary: true },
  { from: 5, to: 6,  strength: 88, primary: true },
  { from: 7, to: 10, strength: 93, primary: true },
  { from: 9, to: 8,  strength: 86, primary: true },
  { from: 11, to: 12, strength: 81, primary: true },
  { from: 1, to: 8,  strength: 72, primary: false },
  { from: 3, to: 6,  strength: 65, primary: false },
  { from: 5, to: 8,  strength: 58, primary: false },
  { from: 7, to: 2,  strength: 76, primary: false },
  { from: 9, to: 4,  strength: 69, primary: false },
  { from: 11, to: 2,  strength: 55, primary: false },
  { from: 7, to: 8,  strength: 61, primary: false },
  { from: 1, to: 10, strength: 48, primary: false },
  { from: 9, to: 6,  strength: 52, primary: false },
];

const WEEKLY_PLANS = [
  {
    day: "Martes",
    time: "20:30",
    title: "Cena & Conexion",
    venue: "El Born, Barcelona",
    icon: Wine,
    spots: 3,
    total: 8,
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop",
  },
  {
    day: "Jueves",
    time: "19:00",
    title: "Afterwork Musical",
    venue: "Raval Sessions",
    icon: Music,
    spots: 5,
    total: 12,
    img: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=600&h=400&fit=crop",
  },
  {
    day: "Viernes",
    time: "21:00",
    title: "Speed Dating",
    venue: "Eixample Lounge",
    icon: Flame,
    spots: 2,
    total: 10,
    img: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop",
  },
  {
    day: "Sabado",
    time: "11:00",
    title: "Brunch & Match",
    venue: "Cafe del Mar, Bcn",
    icon: Coffee,
    spots: 6,
    total: 14,
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
  },
];

// ========== Neural Network SVG Component ==========
function NeuralNetwork({ className }: { className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  const nodeR = 34;

  return (
    <svg
      viewBox="0 0 900 650"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Clip paths for each photo circle */}
        {NETWORK_PEOPLE.map((p) => (
          <clipPath key={`clip-${p.id}`} id={`clip-${p.id}`}>
            <circle
              cx={NODE_POSITIONS[p.id].x}
              cy={NODE_POSITIONS[p.id].y}
              r={nodeR}
            />
          </clipPath>
        ))}

        {/* Gradient for primary connections */}
        <linearGradient id="conn-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="glow-strong">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="node-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Secondary connections (dim) */}
      {CONNECTIONS.filter((c) => !c.primary).map((c, i) => {
        const from = NODE_POSITIONS[c.from];
        const to = NODE_POSITIONS[c.to];
        return (
          <line
            key={`sec-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="rgba(168, 85, 247, 0.12)"
            strokeWidth="1"
            className={loaded ? "animate-network-line" : ""}
            style={{
              opacity: loaded ? 0.5 : 0,
              transition: `opacity 1s ease ${0.5 + i * 0.15}s`,
              strokeDasharray: "6 6",
            }}
          />
        );
      })}

      {/* Primary connections (bright, animated) */}
      {CONNECTIONS.filter((c) => c.primary).map((c, i) => {
        const from = NODE_POSITIONS[c.from];
        const to = NODE_POSITIONS[c.to];
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const isHovered = hoveredNode === c.from || hoveredNode === c.to;

        return (
          <g key={`pri-${i}`}>
            {/* Glow line behind */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#conn-gradient)"
              strokeWidth={isHovered ? "5" : "3"}
              filter="url(#glow-strong)"
              style={{
                opacity: loaded ? (isHovered ? 0.6 : 0.25) : 0,
                transition: `all 0.8s ease ${i * 0.2}s`,
              }}
            />
            {/* Main line */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#conn-gradient)"
              strokeWidth={isHovered ? "2.5" : "1.5"}
              className="network-connection-strong"
              style={{
                opacity: loaded ? (isHovered ? 1 : 0.7) : 0,
                transition: `all 0.8s ease ${i * 0.2}s`,
              }}
            />
            {/* Compatibility label */}
            <g
              style={{
                opacity: loaded ? 1 : 0,
                transition: `opacity 1s ease ${0.8 + i * 0.2}s`,
              }}
            >
              <rect
                x={mx - 22}
                y={my - 11}
                width="44"
                height="22"
                rx="11"
                fill="rgba(10,10,15,0.85)"
                stroke="rgba(244, 63, 94, 0.4)"
                strokeWidth="1"
              />
              <text
                x={mx}
                y={my + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#f472b6"
                fontSize="11"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {c.strength}%
              </text>
            </g>
            {/* Heart icon on midpoint */}
            <g
              style={{
                opacity: loaded ? 0.7 : 0,
                transition: `opacity 1.2s ease ${1 + i * 0.2}s`,
              }}
            >
              <circle cx={mx} cy={my - 20} r="8" fill="rgba(244,63,94,0.15)" />
              <text
                x={mx}
                y={my - 17}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
              >
                ❤️
              </text>
            </g>
          </g>
        );
      })}

      {/* People nodes */}
      {NETWORK_PEOPLE.map((person, i) => {
        const pos = NODE_POSITIONS[person.id];
        const isHovered = hoveredNode === person.id;
        const isFemale = person.gender === "f";
        const ringColor = isFemale ? "#ec4899" : "#a855f7";
        const isBlurred = person.id === 11 || person.id === 12;

        return (
          <g
            key={person.id}
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.6s ease ${i * 0.1}s`,
              cursor: "pointer",
            }}
            onMouseEnter={() => setHoveredNode(person.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Animated pulse ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeR + 8}
              fill="none"
              stroke={ringColor}
              strokeWidth="1"
              opacity="0.3"
              className={isHovered ? "node-ring" : ""}
            />

            {/* Outer ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeR + 3}
              fill="none"
              stroke={ringColor}
              strokeWidth={isHovered ? "2.5" : "1.5"}
              opacity={isHovered ? "0.9" : "0.5"}
              filter={isHovered ? "url(#glow)" : undefined}
              style={{ transition: "all 0.3s ease" }}
            />

            {/* Dark bg circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={nodeR}
              fill="#0a0a0f"
              filter="url(#node-shadow)"
            />

            {/* Photo */}
            <image
              href={person.photo}
              x={pos.x - nodeR}
              y={pos.y - nodeR}
              width={nodeR * 2}
              height={nodeR * 2}
              clipPath={`url(#clip-${person.id})`}
              preserveAspectRatio="xMidYMid slice"
              style={{
                filter: isBlurred ? "blur(4px)" : "none",
              }}
            />

            {/* Lock overlay for blurred */}
            {isBlurred && (
              <g>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeR}
                  fill="rgba(10,10,15,0.4)"
                />
                <text
                  x={pos.x}
                  y={pos.y + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                >
                  🔒
                </text>
              </g>
            )}

            {/* Name label */}
            <rect
              x={pos.x - 28}
              y={pos.y + nodeR + 6}
              width="56"
              height="20"
              rx="10"
              fill="rgba(10,10,15,0.8)"
              stroke={ringColor}
              strokeWidth="0.5"
              opacity="0.9"
            />
            <text
              x={pos.x}
              y={pos.y + nodeR + 17}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="10"
              fontWeight="500"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {person.name}
              {!isBlurred ? `, ${person.age}` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ========== Main App ==========
export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [testMode, setTestMode] = useState<"single" | "couple">("single");
  const [localAnswers, setLocalAnswers] = useState<Record<string, any> | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({
    hero: false,
    stats: false,
    plans: false,
    howItWorks: false,
    test: false,
    preview: false,
    social: false,
    pricing: false,
    cta: false,
  });

  const { user, profile, loading: authLoading, signInAnonymous, signOut, isAdmin } = useAuth();
  const { answers: savedAnswers, saveAnswers } = useAnswers();
  const { runMatching } = useComputeMatches();
  const followupQuestions = useFollowupQuestions(localAnswers || savedAnswers?.answers || null);

  // Check URL hash for admin
  useEffect(() => {
    if (window.location.hash === "#admin" && isAdmin) {
      setAppState("admin");
    }
  }, [isAdmin]);

  // If user is logged in and has answers, go to dashboard
  useEffect(() => {
    if (!authLoading && user && savedAnswers && appState === "landing") {
      setAppState("dashboard");
    }
  }, [authLoading, user, savedAnswers, appState]);

  useEffect(() => {
    setIsVisible((prev) => ({ ...prev, hero: true }));

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute("data-section");
            if (section) {
              setIsVisible((prev) => ({ ...prev, [section]: true }));
            }
          }
        });
      },
      { threshold: 0.1 },
    );
    const sections = document.querySelectorAll("[data-section]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleQuestionnaireComplete = async (answers: Record<string, any>) => {
    setLocalAnswers(answers);

    // If not logged in, create anonymous user first
    if (!user) {
      await signInAnonymous();
    }

    // Save answers to Supabase
    await saveAnswers(answers);

    // Compute matches
    await runMatching(answers);

    if (testMode === "couple") {
      setAppState("landing");
    } else {
      // Go to auth so they can link their account (or straight to dashboard if already logged in with Google)
      if (user && !user.is_anonymous) {
        setAppState("dashboard");
      } else {
        setAppState("auth");
      }
    }
  };

  const handleAuthComplete = () => {
    setAppState("dashboard");
  };

  const handleLogout = async () => {
    await signOut();
    setLocalAnswers(null);
    setAppState("landing");
  };

  const handleStartTest = (mode: "single" | "couple") => {
    setTestMode(mode);
    setAppState("questionnaire");
  };

  // Admin panel
  if (appState === "admin" && isAdmin) {
    return <AdminPanel onBack={() => setAppState("dashboard")} />;
  }

  // Follow-up questions
  if (appState === "followup") {
    return (
      <FollowupForm
        questions={followupQuestions}
        onComplete={async (followupAnswers) => {
          const merged = { ...(localAnswers || savedAnswers?.answers || {}), ...followupAnswers };
          setLocalAnswers(merged);
          await saveAnswers(merged, true);
          await runMatching(merged);
          setAppState("dashboard");
        }}
        onSkip={() => setAppState("dashboard")}
      />
    );
  }

  if (appState === "questionnaire") {
    return (
      <QuestionnaireForm
        onComplete={handleQuestionnaireComplete}
        user={profile || { name: testMode === "couple" ? "Pareja" : "Usuario" }}
      />
    );
  }
  if (appState === "auth") {
    return <AuthForm onAuth={handleAuthComplete} />;
  }
  if (appState === "dashboard" && user) {
    return (
      <Dashboard
        onLogout={handleLogout}
        onStartFollowup={followupQuestions.length > 0 ? () => setAppState("followup") : undefined}
      />
    );
  }

  // ========== LANDING PAGE ==========
  return (
    <div className="min-h-screen bg-surface-900 text-white overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-love-500 animate-heartbeat" />
            <span className="text-xl font-bold gradient-text-love">TruesDate</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#planes" className="hover:text-white transition-colors">Planes</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#precio" className="hover:text-white transition-colors">Precio</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleStartTest("couple")}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all"
            >
              <Brain className="w-4 h-4" />
              Test de pareja
            </button>
            <button
              onClick={() => handleStartTest("single")}
              className="btn-love px-5 py-2 rounded-full text-sm font-medium text-white"
            >
              Empezar gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 min-h-screen flex items-center">
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full animate-float-slow"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] rounded-full animate-float-delay-2"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(244,63,94,0.06) 0%, transparent 60%)" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div
              className={`transition-all duration-1000 ${
                isVisible.hero
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8">
                <span className="w-2 h-2 rounded-full bg-love-500 animate-pulse" />
                <span className="text-xs text-white/60">
                  Barcelona &middot; Citas reales cada semana
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-white">Tu red de</span>
                <br />
                <span className="gradient-text-love">conexiones reales</span>
                <br />
                <span className="text-white/90">sin swipes.</span>
              </h1>

              <p className="mt-6 text-lg text-white/50 max-w-lg leading-relaxed">
                Ciencia + personalidad + planes reales. Nuestro algoritmo
                conecta personas compatibles y crea citas cada semana en
                Barcelona.
              </p>

              {/* Value props */}
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { icon: Brain, text: "Test de personalidad cientifico", color: "text-brand-400" },
                  { icon: Heart, text: "Matches basados en compatibilidad real", color: "text-love-400" },
                  { icon: Calendar, text: "Citas organizadas cada semana", color: "text-accent-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => handleStartTest("single")}
                  className="btn-gradient px-8 py-3.5 rounded-full text-base font-medium text-white flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Descubrir mi match
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStartTest("couple")}
                  className="px-8 py-3.5 rounded-full text-base font-medium text-white/80 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <Heart className="w-5 h-5 text-love-400" />
                  Test de pareja
                </button>
              </div>

              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {NETWORK_PEOPLE.slice(0, 5).map((p) => (
                    <img
                      key={p.id}
                      src={p.photo}
                      alt={p.name}
                      className="w-8 h-8 rounded-full border-2 border-surface-900 object-cover"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-white/90 font-medium">+2.400 personas</span>
                  <span className="text-white/40"> ya conectadas</span>
                </div>
              </div>
            </div>

            {/* Right - Neural Network */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible.hero
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <NeuralNetwork className="w-full h-auto max-w-[650px] mx-auto" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-white/40">Descubre mas</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section
        data-section="stats"
        className="relative py-8 border-y border-white/5"
      >
        <div
          className={`max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${
            isVisible.stats
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {[
            { value: "2.4K+", label: "Usuarios activos", icon: Users },
            { value: "87%", label: "Media de match", icon: Heart },
            { value: "340+", label: "Citas este mes", icon: Calendar },
            { value: "4.8", label: "Valoracion media", icon: Star },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-2"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <stat.icon className="w-5 h-5 text-brand-400 mb-1" />
              <span className="text-2xl font-bold gradient-text">{stat.value}</span>
              <span className="text-xs text-white/40">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PLANES ESTA SEMANA ===== */}
      <section id="planes" data-section="plans" className="relative py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              isVisible.plans
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
              <Calendar className="w-3.5 h-3.5 text-accent-400" />
              <span className="text-xs text-white/50">Proximos planes</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold">
              Planes <span className="gradient-text-love">esta semana</span>
            </h2>
            <p className="mt-3 text-white/40 max-w-lg mx-auto">
              No solo matcheamos — organizamos citas reales. Cada semana, nuevos planes para conoceros.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WEEKLY_PLANS.map((plan, i) => (
              <div
                key={i}
                className={`glass-card rounded-2xl overflow-hidden group transition-all duration-700 ${
                  isVisible.plans
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={plan.img}
                    alt={plan.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-900/90 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-900/70 backdrop-blur-sm border border-white/10">
                      <plan.icon className="w-3.5 h-3.5 text-accent-400" />
                      <span className="text-xs font-medium text-white/80">{plan.day}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-sm font-semibold text-white">{plan.title}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    <span>{plan.time}h</span>
                    <span className="text-white/20">|</span>
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{plan.venue}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {NETWORK_PEOPLE.slice(i * 2, i * 2 + 3).map((p) => (
                          <img
                            key={p.id}
                            src={p.photo}
                            alt=""
                            className="w-6 h-6 rounded-full border border-surface-900 object-cover"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-white/30">
                        +{plan.spots} plazas
                      </span>
                    </div>
                    <button className="px-3 py-1 rounded-full text-xs font-medium btn-love text-white">
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como-funciona" data-section="howItWorks" className="relative py-20 lg:py-28">
        {/* Bg orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 60%)" }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              isVisible.howItWorks
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Como <span className="gradient-text">funciona</span>
            </h2>
            <p className="mt-3 text-white/40 max-w-md mx-auto">
              Tres pasos para encontrar conexiones reales basadas en ciencia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Brain,
                title: "Test de personalidad",
                desc: "30 preguntas cientificas que mapean tus valores, estilo de vida y lo que buscas.",
                color: "text-brand-400",
                glow: "rgba(168,85,247,0.15)",
              },
              {
                step: "02",
                icon: Zap,
                title: "Nuestro algoritmo conecta",
                desc: "Analizamos 6 dimensiones de compatibilidad para encontrar tu match ideal.",
                color: "text-love-400",
                glow: "rgba(244,63,94,0.15)",
              },
              {
                step: "03",
                icon: Wine,
                title: "Cita real cada semana",
                desc: "Organizamos el plan, el lugar y la hora. Tu solo ven y conecta.",
                color: "text-accent-400",
                glow: "rgba(236,72,153,0.15)",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`glass-card rounded-2xl p-7 relative overflow-hidden transition-all duration-700 ${
                  isVisible.howItWorks
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${200 + i * 200}ms` }}
              >
                {/* Step number bg */}
                <div
                  className="absolute -top-4 -right-4 text-[80px] font-black leading-none select-none"
                  style={{ color: "rgba(255,255,255,0.03)" }}
                >
                  {item.step}
                </div>

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: item.glow }}
                >
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <section data-section="preview" className="relative py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              isVisible.preview
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Tu <span className="gradient-text-love">dashboard</span> de conexiones
            </h2>
            <p className="mt-3 text-white/40 max-w-md mx-auto">
              Asi se ve cuando entras. Tus matches, tu proxima cita, tu compatibilidad.
            </p>
          </div>

          <div
            className={`glass-card rounded-3xl p-1 glow-brand max-w-4xl mx-auto transition-all duration-1000 ${
              isVisible.preview
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="rounded-[22px] overflow-hidden bg-surface-800">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-love-500" />
                  <span className="font-semibold gradient-text-love">TruesDate</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span>Matches</span>
                  <span className="text-white/80">Citas</span>
                  <span>Perfil</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-6 py-4 border-b border-white/5 flex gap-8">
                {[
                  { label: "Matches", value: "12", icon: Heart, color: "text-love-400" },
                  { label: "Top compatibilidad", value: "94%", icon: Zap, color: "text-brand-400" },
                  { label: "Proxima cita", value: "Mar 20:30", icon: Calendar, color: "text-accent-400" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">{s.value}</div>
                      <div className="text-xs text-white/30">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Matches list */}
              <div className="p-6 grid md:grid-cols-2 gap-4">
                {/* Active match */}
                <div className="glass rounded-xl p-4 border border-love-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <img
                        src={NETWORK_PEOPLE[0].photo}
                        alt="Sara"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-surface-800" />
                    </div>
                    <div>
                      <div className="font-medium text-white">Sara, 28</div>
                      <div className="text-xs text-green-400">Online ahora</div>
                    </div>
                    <div className="ml-auto px-2.5 py-1 rounded-full bg-love-500/15 text-love-400 text-xs font-semibold">
                      94%
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <Calendar className="w-3 h-3" />
                    <span>Proxima cita: Martes 20:30 — El Born</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 py-2 rounded-lg btn-love text-xs font-medium text-white">
                      Confirmar cita
                    </button>
                    <button className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-white/50 hover:border-white/20 transition-colors">
                      Mensaje
                    </button>
                  </div>
                </div>

                {/* Premium locked matches */}
                <div className="space-y-3">
                  {[
                    { name: "Lucia, 26", compat: "91%", photo: NETWORK_PEOPLE[2].photo },
                    { name: "Ana, 27", compat: "88%", photo: NETWORK_PEOPLE[4].photo },
                  ].map((m, i) => (
                    <div key={i} className="glass rounded-xl p-3 flex items-center gap-3 opacity-60">
                      <img
                        src={m.photo}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover blur-[3px]"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white/50">{m.name}</div>
                        <div className="text-xs text-brand-400/50">{m.compat} compatible</div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs">
                        <Lock className="w-3 h-3" />
                        Premium
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 rounded-xl border border-brand-500/20 text-sm text-brand-400 hover:bg-brand-500/10 transition-all flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" />
                    Desbloquear todos los matches
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEST DE PAREJA ===== */}
      <section data-section="test" className="relative py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className={`grid md:grid-cols-2 gap-10 items-center transition-all duration-1000 ${
              isVisible.test
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Photo side */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden glass-card">
                <img
                  src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=700&h=500&fit=crop"
                  alt="Couple"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent" />
              </div>
              {/* Testimonial overlay */}
              <div className="absolute bottom-4 left-4 right-4 glass-strong rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/80 italic">
                  "Hicimos el test y descubrimos cosas que no sabiamos despues de 3 anos juntos."
                </p>
                <p className="text-xs text-white/40 mt-1">— Laura & Marc, 94%</p>
              </div>
            </div>

            {/* Content side */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
                <Heart className="w-3.5 h-3.5 text-love-400" />
                <span className="text-xs text-white/50">Gratis para parejas</span>
              </div>

              <h2 className="text-3xl font-bold mb-4">
                Test de <span className="gradient-text-love">compatibilidad</span>
              </h2>
              <p className="text-white/40 mb-6 leading-relaxed">
                Ya tienes pareja? Descubrid vuestra compatibilidad real con
                nuestro test cientifico. 30 preguntas, resultados al instante.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Mapa de compatibilidad en 6 dimensiones",
                  "Puntos fuertes y areas de crecimiento",
                  "Consejos personalizados para la relacion",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-love-500/15">
                      <Check className="w-3 h-3 text-love-400" />
                    </div>
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleStartTest("couple")}
                className="btn-gradient px-8 py-3.5 rounded-full text-base font-medium text-white flex items-center gap-2"
              >
                <Heart className="w-5 h-5" />
                Hacer el test en pareja
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section data-section="social" className="relative py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              isVisible.social
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Lo que dicen <span className="gradient-text">nuestros usuarios</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Primera vez que una app me organiza una cita real. Fui al plan del martes y conoci a alguien increible.",
                name: "Marta G.",
                match: "92%",
                photo: NETWORK_PEOPLE[0].photo,
              },
              {
                quote: "El test de compatibilidad es brutal. Mucho mas profundo que cualquier swipe. Ahora entiendo que busco.",
                name: "Pau R.",
                match: "88%",
                photo: NETWORK_PEOPLE[1].photo,
              },
              {
                quote: "Los planes semanales son geniales. Ambiente relajado, gente real, sin presion. Ya llevo 4 citas.",
                name: "Clara S.",
                match: "95%",
                photo: NETWORK_PEOPLE[6].photo,
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`glass-card rounded-2xl p-6 transition-all duration-700 ${
                  isVisible.social
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-white/80">{t.name}</div>
                    <div className="text-xs text-love-400">{t.match} match</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="precio" data-section="pricing" className="relative py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className={`text-center mb-14 transition-all duration-1000 ${
              isVisible.pricing
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Elige tu <span className="gradient-text">plan</span>
            </h2>
            <p className="mt-3 text-white/40 max-w-md mx-auto">
              Empieza gratis. Desbloquea todo cuando estes listo.
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 gap-6 max-w-3xl mx-auto transition-all duration-1000 ${
              isVisible.pricing
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Free */}
            <div className="glass-card rounded-2xl p-7">
              <h3 className="text-xl font-semibold text-white mb-1">Gratis</h3>
              <p className="text-sm text-white/30 mb-6">Descubre tu compatibilidad</p>
              <div className="text-4xl font-bold text-white mb-8">
                0€<span className="text-base font-normal text-white/30">/mes</span>
              </div>
              <div className="space-y-3 mb-8">
                {[
                  "Test de personalidad completo",
                  "3 matches al mes",
                  "1 plan semanal",
                  "Test de pareja ilimitado",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/50">
                    <Check className="w-4 h-4 text-brand-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleStartTest("single")}
                className="w-full py-3 rounded-full text-sm font-medium border border-white/15 text-white/70 hover:bg-white/5 hover:border-white/25 transition-all"
              >
                Empezar gratis
              </button>
            </div>

            {/* Premium */}
            <div className="relative glass-card rounded-2xl p-7 glow-love border-love-500/20">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full btn-love text-xs font-medium text-white">
                Mas popular
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-love-400" />
                <h3 className="text-xl font-semibold text-white">Premium</h3>
              </div>
              <p className="text-sm text-white/30 mb-6">Conexiones ilimitadas</p>
              <div className="text-4xl font-bold text-white mb-1">
                19€<span className="text-base font-normal text-white/30">/mes</span>
              </div>
              <p className="text-xs text-white/20 mb-8">o 149€/ano (ahorra 30%)</p>
              <div className="space-y-3 mb-8">
                {[
                  "Matches ilimitados cada semana",
                  "Todos los planes semanales",
                  "Ver quien te ha matcheado",
                  "Prioridad en eventos exclusivos",
                  "Radar de compatibilidad detallado",
                  "Soporte prioritario",
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="w-4 h-4 text-love-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleStartTest("single")}
                className="w-full py-3 rounded-full text-sm font-medium btn-gradient text-white"
              >
                Probar Premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section data-section="cta" className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)" }}
          />
        </div>

        <div
          className={`max-w-3xl mx-auto px-6 text-center relative z-10 transition-all duration-1000 ${
            isVisible.cta
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Heart className="w-10 h-10 text-love-500 mx-auto mb-6 animate-heartbeat" />
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
            Tu proxima <span className="gradient-text-love">conexion real</span>
            <br />
            empieza aqui
          </h2>
          <p className="mt-5 text-lg text-white/40 max-w-lg mx-auto">
            Sin swipes, sin ghosting, sin juegos. Solo personas reales, compatibilidad
            real y citas que pasan de verdad.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleStartTest("single")}
              className="btn-gradient px-10 py-4 rounded-full text-lg font-medium text-white flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Descubrir mi match
            </button>
            <button
              onClick={() => handleStartTest("couple")}
              className="px-10 py-4 rounded-full text-lg font-medium text-white/70 border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all"
            >
              Test de pareja
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/30">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Privacidad total
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              Resultados al instante
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Sin spam
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-love-500" />
              <span className="font-semibold gradient-text-love">TruesDate</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">Producto</a>
              <a href="#" className="hover:text-white/60 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terminos</a>
              <a href="#" className="hover:text-white/60 transition-colors">Contacto</a>
            </div>

            <span className="text-xs text-white/20">
              © 2026 TruesDate. Barcelona.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
