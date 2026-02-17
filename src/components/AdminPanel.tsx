import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Users,
  Crown,
  Eye,
  Shield,
  Zap,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useAdminMatches } from "../hooks/useTruesDate";
import type { Profile, TDMatch } from "../lib/supabase";

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const { matches, profiles, loading } = useAdminMatches();
  const [selectedMatch, setSelectedMatch] = useState<TDMatch | null>(null);
  const [view, setView] = useState<"map" | "list">("map");

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Stats
  const totalUsers = profiles.length;
  const premiumUsers = profiles.filter((p) => p.is_premium).length;
  const avgCompatibility =
    matches.length > 0
      ? Math.round(
          matches.reduce((sum, m) => sum + m.compatibility, 0) / matches.length
        )
      : 0;
  const highMatches = matches.filter((m) => m.compatibility >= 80).length;

  return (
    <div className="min-h-screen bg-surface-900 text-white">
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 glass-strong px-6 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              <span className="font-bold text-brand-400">Admin Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                view === "map"
                  ? "bg-brand-500/20 text-brand-400"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              Mapa
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                view === "list"
                  ? "bg-brand-500/20 text-brand-400"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Lista
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AdminStat
            icon={<Users className="w-5 h-5 text-brand-400" />}
            value={totalUsers}
            label="Total usuarios"
          />
          <AdminStat
            icon={<Crown className="w-5 h-5 text-yellow-400" />}
            value={premiumUsers}
            label="Premium"
          />
          <AdminStat
            icon={<Heart className="w-5 h-5 text-love-500" />}
            value={matches.length}
            label="Total matches"
          />
          <AdminStat
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            value={`${avgCompatibility}%`}
            label="Media compatibilidad"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/30">Cargando datos...</p>
          </div>
        ) : view === "map" ? (
          /* ===== MATCH MAP ===== */
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">
              Mapa de Conexiones
            </h3>

            {/* SVG Neural network map of all matches */}
            <div className="relative rounded-xl overflow-hidden bg-surface-800/50 p-4">
              <svg
                viewBox="0 0 1000 600"
                className="w-full"
                style={{ minHeight: 400 }}
              >
                <defs>
                  <linearGradient
                    id="admin-conn"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Connection lines */}
                {matches.map((m, i) => {
                  const aIdx = profiles.findIndex((p) => p.id === m.user_a);
                  const bIdx = profiles.findIndex((p) => p.id === m.user_b);
                  if (aIdx < 0 || bIdx < 0) return null;
                  const ax = getNodeX(aIdx, profiles.length);
                  const ay = getNodeY(aIdx, profiles.length);
                  const bx = getNodeX(bIdx, profiles.length);
                  const by = getNodeY(bIdx, profiles.length);

                  return (
                    <g key={m.id}>
                      <line
                        x1={ax}
                        y1={ay}
                        x2={bx}
                        y2={by}
                        stroke={
                          m.compatibility >= 80
                            ? "#f43f5e"
                            : m.compatibility >= 60
                              ? "#ec4899"
                              : "rgba(168,85,247,0.3)"
                        }
                        strokeWidth={m.compatibility >= 80 ? 2 : 1}
                        strokeOpacity={Math.max(0.2, m.compatibility / 100)}
                        onClick={() => setSelectedMatch(m)}
                        style={{ cursor: "pointer" }}
                      />
                      {m.compatibility >= 75 && (
                        <text
                          x={(ax + bx) / 2}
                          y={(ay + by) / 2 - 6}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#f43f5e"
                          opacity="0.8"
                        >
                          {m.compatibility}%
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* User nodes */}
                {profiles.map((p, i) => {
                  const x = getNodeX(i, profiles.length);
                  const y = getNodeY(i, profiles.length);
                  const isFemale = p.gender === "Mujer";
                  const color = isFemale ? "#ec4899" : "#a855f7";

                  return (
                    <g key={p.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r={22}
                        fill={color}
                        fillOpacity="0.15"
                        stroke={color}
                        strokeWidth="2"
                        strokeOpacity="0.4"
                      />
                      {p.photo_url ? (
                        <>
                          <clipPath id={`ac-${p.id}`}>
                            <circle cx={x} cy={y} r={18} />
                          </clipPath>
                          <image
                            href={p.photo_url}
                            x={x - 18}
                            y={y - 18}
                            width="36"
                            height="36"
                            clipPath={`url(#ac-${p.id})`}
                            preserveAspectRatio="xMidYMid slice"
                          />
                        </>
                      ) : (
                        <circle cx={x} cy={y} r={18} fill={color} fillOpacity="0.3" />
                      )}
                      <text
                        x={x}
                        y={y + 32}
                        textAnchor="middle"
                        fontSize="10"
                        fill="rgba(255,255,255,0.5)"
                      >
                        {p.name || "Anon"}
                        {p.is_premium ? " ★" : ""}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected match detail */}
            {selectedMatch && (
              <div className="mt-4 glass rounded-xl p-4 flex items-center gap-4">
                <ProfileBadge
                  profile={profileMap.get(selectedMatch.user_a)}
                />
                <div className="text-center">
                  <Heart className="w-5 h-5 text-love-500 mx-auto" />
                  <span className="text-sm font-bold text-love-400">
                    {selectedMatch.compatibility}%
                  </span>
                </div>
                <ProfileBadge
                  profile={profileMap.get(selectedMatch.user_b)}
                />
                <div className="flex-1 ml-4">
                  <p className="text-xs text-white/30">
                    Status: {selectedMatch.status}
                  </p>
                  {selectedMatch.reasons?.map((r: any, i: number) => (
                    <p key={i} className="text-xs text-white/50">
                      {r.label}: {r.description}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== LIST VIEW ===== */
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4">
              Todos los matches ({matches.length})
            </h3>
            {matches.map((m) => {
              const a = profileMap.get(m.user_a);
              const b = profileMap.get(m.user_b);
              return (
                <div
                  key={m.id}
                  className="glass rounded-xl p-4 flex items-center gap-4"
                >
                  <ProfileBadge profile={a} />
                  <div className="text-center">
                    <Heart className="w-4 h-4 text-love-500 mx-auto" />
                    <span
                      className={`text-sm font-bold ${
                        m.compatibility >= 80
                          ? "text-love-400"
                          : "text-brand-400"
                      }`}
                    >
                      {m.compatibility}%
                    </span>
                  </div>
                  <ProfileBadge profile={b} />
                  <div className="flex-1 text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === "accepted"
                          ? "bg-green-500/20 text-green-400"
                          : m.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/5 text-white/30"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {matches.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30">No hay matches aun</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-xl font-bold">{String(value)}</div>
      <div className="text-xs text-white/30">{label}</div>
    </div>
  );
}

function ProfileBadge({ profile }: { profile?: Profile }) {
  if (!profile) return <div className="w-10 h-10 rounded-full bg-white/5" />;
  return (
    <div className="flex items-center gap-2">
      {profile.photo_url ? (
        <img
          src={profile.photo_url}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400">
          {(profile.name || "?")[0]}
        </div>
      )}
      <div>
        <p className="text-sm font-medium">{profile.name || "Anonimo"}</p>
        <p className="text-xs text-white/30">
          {profile.age ? `${profile.age} a.` : ""}{" "}
          {profile.is_premium ? "★ Premium" : "Free"}
        </p>
      </div>
    </div>
  );
}

// Position nodes in a circle layout
function getNodeX(index: number, total: number): number {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return 500 + 350 * Math.cos(angle);
}

function getNodeY(index: number, total: number): number {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return 300 + 220 * Math.sin(angle);
}
