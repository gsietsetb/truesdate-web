import { useState } from "react";
import { Heart, Mail, Lock, User, Calendar, Sparkles, Chrome } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AuthFormProps {
  onAuth: () => void;
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const { signInWithGoogle, user, isAnonymous, updateProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signInWithGoogle();
    // Will redirect to Google, so onAuth happens after redirect
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // For MVP: if anonymous user, just update profile and continue
    if (user && isAnonymous) {
      await updateProfile({
        name: formData.name || formData.email.split("@")[0],
        age: parseInt(formData.age) || undefined,
        gender: formData.gender || undefined,
      } as any);
      onAuth();
      return;
    }

    // Simple mock login for MVP (upgrade to Supabase email auth later)
    if (formData.name) {
      await updateProfile({
        name: formData.name,
        age: parseInt(formData.age) || undefined,
        gender: formData.gender || undefined,
      } as any);
    }

    onAuth();
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full animate-float-slow"
          style={{
            background:
              "radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full animate-float"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center glow-love"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #ec4899)",
              }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text-love">
              TruesDate
            </h1>
          </div>
          <p className="text-white/40 text-sm">
            {isAnonymous
              ? "Ya tienes tus resultados! Guarda tu perfil para siempre"
              : isLogin
                ? "Bienvenido de vuelta"
                : "Crea tu cuenta y encuentra tu match"}
          </p>
        </div>

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/[0.08] transition mb-4 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition">
            Continuar con Google
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-white/20">o con email</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Form card */}
        <div className="glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm text-white/40 block">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                      required={!isLogin}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm text-white/40 block">Edad</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <input
                        type="number"
                        placeholder="28"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                        min="18"
                        max="65"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm text-white/40 block">
                      Genero
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all appearance-none"
                    >
                      <option value="" className="bg-surface-800">
                        Selecciona
                      </option>
                      <option value="Hombre" className="bg-surface-800">
                        Hombre
                      </option>
                      <option value="Mujer" className="bg-surface-800">
                        Mujer
                      </option>
                      <option value="No binario" className="bg-surface-800">
                        No binario
                      </option>
                      <option value="Otro" className="bg-surface-800">
                        Otro
                      </option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-sm text-white/40 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-white/40 block">Contrasena</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-medium btn-gradient flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                "Cargando..."
              ) : isLogin ? (
                <>
                  Iniciar sesion
                  <Heart className="w-4 h-4" />
                </>
              ) : (
                <>
                  Crear cuenta
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-4">
            {isLogin ? "No tienes cuenta?" : "Ya tienes cuenta?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-medium gradient-text-love hover:opacity-80 transition-opacity"
            >
              {isLogin ? "Registrate" : "Inicia sesion"}
            </button>
          </p>
        </div>

        {/* Social proof */}
        <div className="mt-6 flex items-center justify-center gap-3 opacity-50">
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face",
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="w-7 h-7 rounded-full border-2 border-surface-900 object-cover"
              />
            ))}
          </div>
          <span className="text-xs text-white/30">
            +2.400 singles en Barcelona
          </span>
        </div>
      </div>
    </div>
  );
}
