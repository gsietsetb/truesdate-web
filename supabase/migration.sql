-- ============================================
-- TruesDate Full Schema + Seed
-- Run this in the Supabase SQL Editor
-- ============================================

-- Profiles: extends auth.users
CREATE TABLE IF NOT EXISTS td_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INT CHECK (age >= 18 AND age <= 99),
  gender TEXT CHECK (gender IN ('Hombre', 'Mujer', 'No binario', 'Otro')),
  bio TEXT,
  photo_url TEXT,
  location TEXT DEFAULT 'Barcelona',
  whatsapp TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Answers
CREATE TABLE IF NOT EXISTS td_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES td_profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  version INT DEFAULT 1,
  is_followup BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, version)
);

-- Matches
CREATE TABLE IF NOT EXISTS td_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES td_profiles(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES td_profiles(id) ON DELETE CASCADE,
  compatibility FLOAT NOT NULL CHECK (compatibility >= 0 AND compatibility <= 100),
  reasons JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  next_date JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_a, user_b),
  CHECK (user_a < user_b)
);

-- Events
CREATE TABLE IF NOT EXISTS td_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  venue_address TEXT,
  image_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  spots_total INT NOT NULL DEFAULT 8,
  spots_taken INT DEFAULT 0,
  event_type TEXT DEFAULT 'social' CHECK (event_type IN ('social', 'speed_dating', 'brunch', 'afterwork', 'dinner', 'activity')),
  price_cents INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS td_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES td_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES td_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS td_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES td_profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Follow-up questions
CREATE TABLE IF NOT EXISTS td_followup_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_answer_id TEXT NOT NULL,
  trigger_value TEXT NOT NULL,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'scale' CHECK (question_type IN ('scale', 'multiple', 'boolean', 'text')),
  options JSONB DEFAULT '[]',
  priority INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_td_matches_user_a ON td_matches(user_a);
CREATE INDEX IF NOT EXISTS idx_td_matches_user_b ON td_matches(user_b);
CREATE INDEX IF NOT EXISTS idx_td_answers_user ON td_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_td_events_date ON td_events(event_date);
CREATE INDEX IF NOT EXISTS idx_td_event_rsvps_event ON td_event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_td_profiles_location ON td_profiles(location);

-- RLS
ALTER TABLE td_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE td_followup_questions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "profiles_select" ON td_profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON td_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON td_profiles FOR UPDATE USING (auth.uid() = id);
-- IMPORTANT: answers need to be readable by other authenticated users for the matching algorithm
-- We only expose the answers JSONB, not any PII
CREATE POLICY "answers_select_own" ON td_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "answers_select_for_matching" ON td_answers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "answers_insert_own" ON td_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "answers_update_own" ON td_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "matches_select_own" ON td_matches FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "matches_select_admin" ON td_matches FOR SELECT USING (EXISTS (SELECT 1 FROM td_profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "matches_insert_own" ON td_matches FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "matches_upsert" ON td_matches FOR UPDATE USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "events_select" ON td_events FOR SELECT USING (true);
CREATE POLICY "rsvps_select_own" ON td_event_rsvps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rsvps_insert_own" ON td_event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subs_select_own" ON td_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "followup_select" ON td_followup_questions FOR SELECT USING (true);

-- ============================================
-- PATCH: Apply to existing Supabase projects
-- Run this if the project was already set up
-- ============================================
-- DROP POLICY IF EXISTS "answers_select_own" ON td_answers;
-- CREATE POLICY "answers_select_for_matching" ON td_answers FOR SELECT USING (auth.uid() IS NOT NULL);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_td_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO td_profiles (id, name, photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, td_profiles.name),
    photo_url = COALESCE(EXCLUDED.photo_url, td_profiles.photo_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_td_auth_user_created ON auth.users;
CREATE TRIGGER on_td_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_td_new_user();

-- ============================================
-- SEED DATA
-- ============================================

-- Events
INSERT INTO td_events (title, description, venue, venue_address, image_url, event_date, spots_total, spots_taken, event_type, price_cents, is_premium) VALUES
('Cena & Conexion', 'Cena intima para 8 personas en El Born. Menu degustacion + vinos naturales.', 'El Born Kitchen', 'Carrer del Rec, 24, Barcelona', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&h=400&fit=crop', now() + interval '2 days' + time '20:30', 8, 5, 'dinner', 2900, false),
('Afterwork Musical', 'Afterwork con DJ en vivo y cocteles.', 'Raval Sessions', 'Carrer de Joaquin Costa, 44, Barcelona', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop', now() + interval '4 days' + time '19:00', 12, 7, 'afterwork', 1500, false),
('Speed Dating Premium', 'Speed dating exclusivo para miembros premium.', 'Eixample Lounge', 'Carrer de Balmes, 187, Barcelona', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop', now() + interval '5 days' + time '21:00', 20, 18, 'speed_dating', 1900, true),
('Brunch & Match', 'Brunch dominguero con vistas al mar.', 'Cafe del Mar Barcelona', 'Passeig Maritim, 34, Barcelona', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', now() + interval '6 days' + time '11:00', 10, 4, 'brunch', 2200, false),
('Ruta de Vinos Gotic', 'Tour por 4 bodegas del Barrio Gotico con sommelier.', 'Barrio Gotico', 'Placa del Pi, 1, Barcelona', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop', now() + interval '8 days' + time '18:00', 12, 3, 'activity', 3500, false),
('Yoga & Coffee Date', 'Sesion de yoga en la playa + cafe y croissants.', 'Playa Barceloneta', 'Passeig Maritim, Barcelona', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop', now() + interval '9 days' + time '09:00', 16, 6, 'activity', 1200, false);

-- Follow-up questions
INSERT INTO td_followup_questions (trigger_answer_id, trigger_value, question, question_type, options, priority) VALUES
('relationship_goal', '5', 'Que es lo mas importante para ti en una pareja a largo plazo?', 'multiple', '[{"value":"trust","label":"Confianza ciega","emoji":"🤝"},{"value":"passion","label":"Pasion constante","emoji":"🔥"},{"value":"growth","label":"Crecimiento juntos","emoji":"🌱"},{"value":"humor","label":"Reirnos cada dia","emoji":"😂"},{"value":"peace","label":"Paz y estabilidad","emoji":"☮️"}]', 10),
('relationship_goal', '5', 'Crees en el amor a primera vista?', 'boolean', '[{"value":true,"label":"Si, lo he sentido","emoji":"✨"},{"value":false,"label":"No, el amor se construye","emoji":"🏗️"}]', 9),
('children_desire', '4', 'Cuantos hijos te gustaria tener?', 'scale', '[{"value":1,"label":"Uno","emoji":"👶"},{"value":2,"label":"Dos","emoji":"👶👶"},{"value":3,"label":"Tres o mas","emoji":"👨‍👩‍👧‍👦"},{"value":0,"label":"Depende de la pareja","emoji":"🤔"}]', 8),
('children_desire', '5', 'A que edad te gustaria empezar a tener hijos?', 'multiple', '[{"value":"asap","label":"Lo antes posible","emoji":"⏰"},{"value":"2-3years","label":"En 2-3 anos","emoji":"📅"},{"value":"5years","label":"En 5+ anos","emoji":"⏳"},{"value":"flexible","label":"Sin prisa, cuando llegue","emoji":"🌊"}]', 8),
('party_lifestyle', '4', 'Cual es tu plan de fiesta ideal?', 'multiple', '[{"value":"club","label":"Club hasta las 6am","emoji":"🪩"},{"value":"bar","label":"Bares con amigos","emoji":"🍻"},{"value":"dinner","label":"Cena que acaba en fiesta","emoji":"🍷"},{"value":"house","label":"Fiesta en casa","emoji":"🏠"},{"value":"festival","label":"Festivales","emoji":"🎪"}]', 7),
('party_lifestyle', '5', 'Con que frecuencia sales de noche?', 'scale', '[{"value":1,"label":"1 vez al mes","emoji":"🌙"},{"value":2,"label":"2 veces al mes","emoji":"🌙🌙"},{"value":3,"label":"Cada finde","emoji":"🎉"},{"value":4,"label":"2-3 veces por semana","emoji":"🪩"},{"value":5,"label":"Casi cada dia","emoji":"🔥"}]', 6),
('artistic_side', '5', 'Que tipo de arte te apasiona mas?', 'multiple', '[{"value":"visual","label":"Artes visuales","emoji":"🎨"},{"value":"music","label":"Musica","emoji":"🎵"},{"value":"literature","label":"Literatura y poesia","emoji":"📚"},{"value":"theater","label":"Teatro y performance","emoji":"🎭"},{"value":"cinema","label":"Cine de autor","emoji":"🎬"},{"value":"dance","label":"Danza","emoji":"💃"}]', 7),
('sexual_desire', '4', 'Que valoras mas en la intimidad?', 'multiple', '[{"value":"connection","label":"Conexion emocional","emoji":"💞"},{"value":"spontaneity","label":"Espontaneidad","emoji":"⚡"},{"value":"communication","label":"Comunicacion abierta","emoji":"🗣️"},{"value":"exploration","label":"Explorar juntos","emoji":"🧭"},{"value":"tenderness","label":"Ternura y carino","emoji":"🤗"}]', 6),
('childhood_trauma', 'divorce', 'Como ha influido eso en tu vision de las relaciones?', 'multiple', '[{"value":"cautious","label":"Me hace ser mas cauteloso/a","emoji":"🛡️"},{"value":"stronger","label":"Me ha hecho mas fuerte","emoji":"💪"},{"value":"avoidant","label":"A veces evito comprometerme","emoji":"🏃"},{"value":"empathetic","label":"Soy mas empatico/a","emoji":"❤️"},{"value":"independent","label":"Valoro mucho la independencia","emoji":"🦅"}]', 5),
('relationship_fear', 'abandonment', 'Que te ayuda a sentirte seguro/a en una relacion?', 'multiple', '[{"value":"communication","label":"Comunicacion constante","emoji":"💬"},{"value":"actions","label":"Acciones mas que palabras","emoji":"🎯"},{"value":"time","label":"Tiempo de calidad juntos","emoji":"⏰"},{"value":"reassurance","label":"Palabras de afirmacion","emoji":"🗣️"},{"value":"independence","label":"Tener mi espacio tambien","emoji":"🌿"}]', 5);
