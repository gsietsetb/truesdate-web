import { useState } from "react";
import {
  Heart,
  Clock,
  MapPin,
  Star,
  LogOut,
  Calendar,
  Users,
  Crown,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Check,
  Eye,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useMatches, useEvents } from "../hooks/useTruesDate";
import type { TDMatch, TDEvent } from "../lib/supabase";

// Fallback photos for demo
const DEMO_PHOTOS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
];

const REASON_ICONS: Record<string, string> = {
  heart: "💕",
  baby: "👶",
  party: "🎉",
  palette: "🎨",
  flame: "🔥",
  calendar: "📅",
  message: "💬",
  alert: "⚠️",
};

interface DashboardProps {
  onLogout: () => void;
  onStartFollowup?: () => void;
}

export function Dashboard({ onLogout, onStartFollowup }: DashboardProps) {
  const { profile, isAdmin, user } = useAuth();
  const { matches, loading: matchesLoading } = useMatches();
  const { events, loading: eventsLoading } = useEvents();
  const [selectedMatch, setSelectedMatch] = useState<TDMatch | null>(null);

  const displayName = profile?.name || user?.email?.split("@")[0] || "Usuario";
  const topMatch = matches[0];
  const isPremium = profile?.is_premium ?? false;

  // Next event
  const nextEvent = events[0];
  const daysUntilEvent = nextEvent
    ? Math.max(
        0,
        Math.ceil(
          (new Date(nextEvent.event_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const active = selectedMatch ?? topMatch;

  return (
    <div className="min-h-screen bg-surface-900 text-white">
      {/* ===== NAV ===== */}
      <nav
        className="sticky top-0 z-50 glass-strong px-6 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-love-500" />
            <span className="font-bold gradient-text-love">TruesDate</span>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <a
                href="#admin"
                className="text-xs text-brand-400 border border-brand-500/30 px-3 py-1 rounded-full hover:bg-brand-500/10 transition"
              >
                Admin
              </a>
            )}
            <span className="text-sm text-white/40">
              Hola, {displayName}
            </span>
            {isPremium && (
              <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Premium
              </span>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ===== STATS ROW ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5 text-brand-400" />}
            value={String(matches.length)}
            label="Matches encontrados"
          />
          <StatCard
            icon={<Heart className="w-5 h-5 text-love-500" />}
            value={topMatch ? `${topMatch.compatibility}%` : "--"}
            label="Top compatibilidad"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-accent-400" />}
            value={daysUntilEvent !== null ? String(daysUntilEvent) : "--"}
            label="Dias para tu cita"
          />
          <StatCard
            icon={<Calendar className="w-5 h-5 text-green-400" />}
            value={String(events.length)}
            label="Eventos disponibles"
          />
        </div>

        {/* ===== MAIN GRID ===== */}
        <div className="grid md:grid-cols-[320px_1fr] gap-8">
          {/* ===== LEFT: MATCH LIST ===== */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Tus Matches</h2>

            {matchesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="glass rounded-xl p-4 animate-pulse h-20"
                  />
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="glass-card rounded-xl p-6 text-center">
                <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-3" />
                <p className="text-white/50 text-sm">
                  Aun no tienes matches. Completa el test para empezar!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map((match, i) => {
                  const partner = match.partner;
                  const isActive = active?.id === match.id;
                  const isLocked = !isPremium && i >= 1;

                  return (
                    <button
                      key={match.id}
                      onClick={() => !isLocked && setSelectedMatch(match)}
                      className={`w-full text-left rounded-xl p-3 transition-all flex items-center gap-3 ${
                        isActive
                          ? "glass-strong border border-love-500/30 glow-love"
                          : isLocked
                            ? "glass opacity-60"
                            : "glass hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={
                            partner?.photo_url || DEMO_PHOTOS[i % DEMO_PHOTOS.length]
                          }
                          alt={partner?.name || "Match"}
                          className="w-12 h-12 rounded-full object-cover"
                          style={{
                            filter: isLocked ? "blur(4px)" : "none",
                          }}
                        />
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {isLocked
                              ? "????"
                              : `${partner?.name || "Anonimo"}, ${partner?.age || "?"}`}
                          </span>
                          {isLocked && (
                            <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Crown className="w-2.5 h-2.5" /> Premium
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/30 truncate">
                          {partner?.bio || partner?.location || "Barcelona"}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          match.compatibility >= 80
                            ? "text-love-400"
                            : match.compatibility >= 60
                              ? "text-accent-400"
                              : "text-brand-400"
                        }`}
                      >
                        {match.compatibility}%
                      </span>
                    </button>
                  );
                })}

                {!isPremium && matches.length > 1 && (
                  <button className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/5 transition flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4" />
                    Desbloquear todos los matches
                  </button>
                )}
              </div>
            )}

            {/* Follow-up CTA */}
            {onStartFollowup && (
              <button
                onClick={onStartFollowup}
                className="w-full mt-4 glass rounded-xl p-4 text-left hover:bg-white/[0.06] transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Afinar mas?</p>
                    <p className="text-xs text-white/30">
                      Preguntas personalizadas para mejorar tus matches
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition" />
                </div>
              </button>
            )}
          </div>

          {/* ===== RIGHT: MATCH DETAIL ===== */}
          <div className="space-y-6">
            {active?.partner ? (
              <>
                {/* Partner card */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-start gap-5">
                    <img
                      src={
                        active.partner.photo_url ||
                        DEMO_PHOTOS[0]
                      }
                      alt={active.partner.name || ""}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {active.partner.name},{" "}
                        {active.partner.age}
                      </h3>
                      <p className="text-sm text-white/40 mt-1">
                        {active.partner.bio ||
                          `${active.partner.location || "Barcelona"}`}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            active.compatibility >= 80
                              ? "bg-love-500/20 text-love-400"
                              : "bg-brand-500/20 text-brand-400"
                          }`}
                        >
                          {active.compatibility}% Match
                        </span>
                        <button className="px-3 py-1 rounded-full text-sm border border-white/10 text-white/50 hover:bg-white/5 transition flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Ver Radar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next date */}
                {active.next_date && (
                  <div className="glass-card rounded-2xl p-5">
                    <h4 className="font-medium mb-3">Tu proxima cita</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3 text-white/60">
                        <Calendar className="w-4 h-4 text-brand-400" />
                        {active.next_date.date}
                      </div>
                      <div className="flex items-center gap-3 text-white/60">
                        <MapPin className="w-4 h-4 text-love-400" />
                        {active.next_date.venue} —{" "}
                        {active.next_date.venue_address}
                      </div>
                      <div className="flex items-center gap-3 text-white/60">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {active.next_date.plan_type}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 py-2.5 rounded-xl text-sm font-medium btn-gradient text-white flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Confirmar cita
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:bg-white/5 transition flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Mensaje
                      </button>
                    </div>
                  </div>
                )}

                {/* Compatibility reasons */}
                {active.reasons && active.reasons.length > 0 && (
                  <div className="glass-card rounded-2xl p-5">
                    <h4 className="font-medium mb-4">
                      Por que sois compatibles?
                    </h4>
                    <div className="space-y-3">
                      {active.reasons.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03]"
                        >
                          <span className="text-lg">
                            {REASON_ICONS[r.icon] || "💫"}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{r.label}</p>
                            <p className="text-xs text-white/40">
                              {r.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="glass-card rounded-2xl p-8 text-center">
                <Heart className="w-12 h-12 text-love-500/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Selecciona un match
                </h3>
                <p className="text-sm text-white/30">
                  Haz click en un match de la izquierda para ver los detalles de
                  compatibilidad.
                </p>
              </div>
            )}

            {/* ===== EVENTS SECTION ===== */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Proximos eventos
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {eventsLoading
                  ? [1, 2].map((i) => (
                      <div
                        key={i}
                        className="glass rounded-xl h-48 animate-pulse"
                      />
                    ))
                  : events.slice(0, 4).map((event) => (
                      <EventCard key={event.id} event={event} isPremium={isPremium} />
                    ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            {!isPremium && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(244,63,94,0.15))",
                  border: "1px solid rgba(168,85,247,0.2)",
                }}
              >
                <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-semibold mb-1">
                  Desbloquea Premium
                </h4>
                <p className="text-sm text-white/40 mb-4">
                  Matches ilimitados, todos los eventos, ver quien te matcheo
                </p>
                <button className="btn-gradient px-8 py-2.5 rounded-full text-sm font-medium text-white">
                  19€/mes — Probar Premium
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-white/30">{label}</div>
    </div>
  );
}

function EventCard({ event, isPremium }: { event: TDEvent; isPremium: boolean }) {
  const date = new Date(event.event_date);
  const dayName = date.toLocaleDateString("es", { weekday: "long" });
  const time = date.toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const spotsLeft = event.spots_total - event.spots_taken;
  const isLocked = event.is_premium && !isPremium;

  return (
    <div
      className={`glass-card rounded-xl overflow-hidden transition group ${
        isLocked ? "opacity-70" : "hover:bg-white/[0.06]"
      }`}
    >
      <div className="relative h-28 overflow-hidden">
        <img
          src={event.image_url || ""}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full glass text-[11px]">
          <Calendar className="w-3 h-3" />
          {dayName}
        </div>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="flex items-center gap-1 text-xs text-yellow-400 bg-black/60 px-3 py-1 rounded-full">
              <Crown className="w-3 h-3" /> Premium
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h5 className="font-medium text-sm">{event.title}</h5>
        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
          <Clock className="w-3 h-3" />
          {time}
          <span className="text-white/10">|</span>
          <MapPin className="w-3 h-3" />
          {event.venue}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span
            className={`text-xs ${spotsLeft <= 3 ? "text-love-400" : "text-white/30"}`}
          >
            +{spotsLeft} plazas
          </span>
          {event.price_cents > 0 && (
            <span className="text-xs text-white/40">
              {(event.price_cents / 100).toFixed(0)}€
            </span>
          )}
          <button
            className="text-xs px-3 py-1 rounded-full btn-gradient text-white"
            disabled={isLocked}
          >
            Reservar
          </button>
        </div>
      </div>
    </div>
  );
}
