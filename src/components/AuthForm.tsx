import { useState } from "react";
import { Heart, Mail, Lock, User, Calendar, Sparkles, ChevronLeft, Loader2, Phone, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

const API_URL = "https://divenamic-api.divenamic.workers.dev";

interface AuthFormProps {
  onAuth: () => void;
}

function WhatsAppOtpFlow({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<"phone" | "otp" | "error">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const formatted = phone.startsWith("+") ? phone : `+34${phone}`;

  const handleSend = async () => {
    if (!phone || phone.length < 9) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "BRIDGE_OFFLINE" || data.code === "BRIDGE_UNREACHABLE") {
          setError("WhatsApp no disponible ahora. Usa Google para entrar.");
          setStep("error");
        } else if (res.status === 429) {
          setError("Demasiados intentos. Espera 10 min.");
        } else {
          setError(data.error || "Error enviando codigo");
        }
        setSending(false);
        return;
      }
      setStep("otp");
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
    }
    setSending(false);
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 4) return;
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted, code: otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
          setError(`Codigo incorrecto. ${data.attemptsLeft} intentos.`);
        } else {
          setError(data.error || "Error verificando");
        }
        setVerifying(false);
        return;
      }

      if (data.hashedToken && data.email) {
        const { error: signInError } = await supabase.auth.verifyOtp({
          email: data.email,
          token_hash: data.hashedToken,
          type: "magiclink",
        });
        if (signInError) {
          setError("Verificado pero error al iniciar sesion. Usa Google.");
          setVerifying(false);
          return;
        }
        onSuccess();
      } else {
        setError("Respuesta incompleta del servidor.");
      }
    } catch {
      setError("Error de conexion.");
    }
    setVerifying(false);
  };

  if (step === "error") {
    return (
      <div className="space-y-3 text-center">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-300">{error}</p>
        </div>
        <button
          onClick={() => { setStep("phone"); setError(null); }}
          className="text-xs text-white/30 hover:text-white/60 transition"
        >
          Reintentar con WhatsApp
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setStep("phone"); setOtp(""); setError(null); }}
          className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition"
        >
          <ChevronLeft className="w-3 h-3" /> Cambiar numero
        </button>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 mb-3">
            <Shield className="w-3.5 h-3.5 text-[#25D366]" />
            <span className="text-xs text-[#25D366] font-medium">Codigo enviado por WhatsApp</span>
          </div>
          <p className="text-xs text-white/40">
            Enviado a <span className="font-medium text-white/70">{formatted}</span>
          </p>
        </div>
        {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="• • • • • •"
          className="w-full py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-white/15 focus:outline-none focus:border-[#25D366]/40 focus:bg-white/[0.06] transition-all"
          maxLength={6}
          autoFocus
          type="tel"
        />
        <button
          onClick={handleVerify}
          disabled={verifying || otp.length < 4}
          className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          style={{ background: "#25D366" }}
        >
          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
          Verificar codigo
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className="text-xs text-white/30 hover:text-white/60 transition mx-auto block"
        >
          {sending ? "Reenviando..." : "Reenviar codigo"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-white/40 text-center">Te enviaremos un codigo por WhatsApp</p>
      {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
      <div className="flex gap-2">
        <div className="flex items-center gap-1.5 px-3 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-white/60 shrink-0">
          <span>🇪🇸</span> +34
        </div>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
          placeholder="612 345 678"
          className="w-full px-4 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-base placeholder-white/20 focus:outline-none focus:border-[#25D366]/40 focus:bg-white/[0.06] transition-all"
          type="tel"
          autoFocus
        />
      </div>
      <button
        onClick={handleSend}
        disabled={sending || phone.length < 9}
        className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        style={{ background: "#25D366" }}
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
        Enviar codigo por WhatsApp
      </button>
    </div>
  );
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const { signInWithGoogle, user, isAnonymous, updateProfile } = useAuth();
  const [authMethod, setAuthMethod] = useState<"choose" | "whatsapp" | "email">("choose");
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (user && isAnonymous) {
      await updateProfile({
        name: formData.name || formData.email.split("@")[0],
        age: parseInt(formData.age) || undefined,
        gender: formData.gender || undefined,
      } as any);
      onAuth();
      return;
    }

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
          style={{ background: "radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full animate-float"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center glow-love"
              style={{ background: "linear-gradient(135deg, #f43f5e, #ec4899)" }}
            >
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text-love">TruesDate</h1>
          </div>
          <p className="text-white/40 text-sm">
            {isAnonymous
              ? "Ya tienes tus resultados! Guarda tu perfil"
              : "Entra y descubre tus matches"}
          </p>
        </div>

        {/* WhatsApp login - PRIMARY */}
        <button
          onClick={() => setAuthMethod("whatsapp")}
          className={`w-full rounded-xl p-4 flex items-center justify-center gap-3 transition mb-3 group ${
            authMethod === "whatsapp"
              ? "bg-[#25D366]/15 border-2 border-[#25D366]/40"
              : "glass-card hover:bg-white/[0.08]"
          }`}
        >
          <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition">
            Continuar con WhatsApp
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366] font-medium">Rapido</span>
        </button>

        {/* WhatsApp OTP flow */}
        {authMethod === "whatsapp" && (
          <div className="glass-card rounded-2xl p-6 mb-3">
            <WhatsAppOtpFlow onSuccess={onAuth} />
          </div>
        )}

        {/* Google login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/[0.08] transition mb-3 group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition">
            Continuar con Google
          </span>
        </button>

        {/* Email option */}
        <button
          onClick={() => setAuthMethod(authMethod === "email" ? "choose" : "email")}
          className="w-full glass-card rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-white/[0.08] transition mb-3 group"
        >
          <Mail className="w-4 h-4 text-white/40" />
          <span className="text-xs font-medium text-white/40 group-hover:text-white/60 transition">
            Continuar con email
          </span>
        </button>

        {/* Email form */}
        {authMethod === "email" && (
          <div className="glass-card rounded-2xl p-6 mb-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm text-white/40 block">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                      <input
                        type="text"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        <input type="number" placeholder="28" value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                          min="18" max="65"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-white/40 block">Genero</label>
                      <select value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all appearance-none"
                      >
                        <option value="" className="bg-surface-800">Selecciona</option>
                        <option value="Hombre" className="bg-surface-800">Hombre</option>
                        <option value="Mujer" className="bg-surface-800">Mujer</option>
                        <option value="No binario" className="bg-surface-800">No binario</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <label className="text-sm text-white/40 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input type="email" placeholder="tu@email.com" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-white/40 block">Contrasena</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input type="password" placeholder="••••••••" value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all"
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-white font-medium btn-gradient flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? "Cargando..." : isLogin ? (<>Iniciar sesion <Heart className="w-4 h-4" /></>) : (<>Crear cuenta <Sparkles className="w-4 h-4" /></>)}
              </button>
            </form>
            <p className="text-center text-sm text-white/40 mt-4">
              {isLogin ? "No tienes cuenta?" : "Ya tienes cuenta?"}
              <button onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-medium gradient-text-love hover:opacity-80 transition-opacity"
              >
                {isLogin ? "Registrate" : "Inicia sesion"}
              </button>
            </p>
          </div>
        )}

        {/* Social proof */}
        <div className="mt-6 flex items-center justify-center gap-3 opacity-50">
          <div className="flex -space-x-2">
            {[
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
              "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face",
            ].map((src, i) => (
              <img key={i} src={src} alt="" className="w-7 h-7 rounded-full border-2 border-surface-900 object-cover" />
            ))}
          </div>
          <span className="text-xs text-white/30">+2.400 singles en Barcelona</span>
        </div>
      </div>
    </div>
  );
}
