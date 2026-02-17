import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  type TDMatch,
  type TDEvent,
  type TDAnswers,
  type Profile,
  type FollowupQuestion,
} from "../lib/supabase";
import { computeMatch } from "../lib/matching";
import { useAuth } from "../contexts/AuthContext";

// ===== ANSWERS =====
export function useAnswers() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<TDAnswers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("td_answers")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_followup", false)
      .order("version", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setAnswers(data);
        setLoading(false);
      });
  }, [user]);

  const saveAnswers = useCallback(
    async (data: Record<string, any>, isFollowup = false) => {
      if (!user) return null;
      const version = answers ? answers.version + (isFollowup ? 0 : 1) : 1;
      const { data: saved, error } = await supabase
        .from("td_answers")
        .upsert(
          {
            user_id: user.id,
            answers: data,
            version: isFollowup ? answers?.version ?? 1 : version,
            is_followup: isFollowup,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,version" }
        )
        .select()
        .single();
      if (!error && saved) setAnswers(saved);
      return saved;
    },
    [user, answers]
  );

  return { answers, loading, saveAnswers };
}

// ===== MATCHES =====
export function useMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<TDMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get all matches where user is involved
    const { data: rawMatches } = await supabase
      .from("td_matches")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("compatibility", { ascending: false });

    if (!rawMatches?.length) {
      setMatches([]);
      setLoading(false);
      return;
    }

    // Get partner profiles
    const partnerIds = rawMatches.map((m) =>
      m.user_a === user.id ? m.user_b : m.user_a
    );
    const { data: profiles } = await supabase
      .from("td_profiles")
      .select("*")
      .in("id", partnerIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    const enriched: TDMatch[] = rawMatches.map((m) => ({
      ...m,
      partner: profileMap.get(m.user_a === user.id ? m.user_b : m.user_a),
    }));

    setMatches(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return { matches, loading, refetch: fetchMatches };
}

// ===== EVENTS =====
export function useEvents() {
  const [events, setEvents] = useState<TDEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("td_events")
      .select("*")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  const rsvp = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from("td_event_rsvps").insert({
      event_id: eventId,
      user_id: user.id,
    });

    if (!error) {
      await supabase.rpc("increment_spots", { event_id_param: eventId }).catch(() => {
        // RPC might not exist yet, update manually
        supabase
          .from("td_events")
          .update({ spots_taken: events.find((e) => e.id === eventId)!.spots_taken + 1 })
          .eq("id", eventId);
      });
    }

    return { error: error?.message };
  };

  return { events, loading, rsvp };
}

// ===== FOLLOW-UP QUESTIONS =====
export function useFollowupQuestions(answers: Record<string, any> | null) {
  const [questions, setQuestions] = useState<FollowupQuestion[]>([]);

  useEffect(() => {
    if (!answers) return;

    supabase
      .from("td_followup_questions")
      .select("*")
      .order("priority", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        // Filter questions triggered by the user's answers
        const relevant = data.filter((q) => {
          const userAnswer = answers[q.trigger_answer_id];
          if (userAnswer === undefined) return false;
          return String(userAnswer) === q.trigger_value;
        });
        setQuestions(relevant);
      });
  }, [answers]);

  return questions;
}

// ===== ADMIN: ALL MATCHES + PROFILES =====
export function useAdminMatches() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<{
    matches: TDMatch[];
    profiles: Profile[];
  }>({ matches: [], profiles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    Promise.all([
      supabase.from("td_matches").select("*").order("compatibility", { ascending: false }),
      supabase.from("td_profiles").select("*").not("name", "is", null),
    ]).then(([matchesRes, profilesRes]) => {
      setData({
        matches: matchesRes.data ?? [],
        profiles: profilesRes.data ?? [],
      });
      setLoading(false);
    });
  }, [isAdmin]);

  return { ...data, loading };
}

// ===== MATCH COMPUTATION (runs after questionnaire) =====
export function useComputeMatches() {
  const { user } = useAuth();

  const runMatching = useCallback(
    async (myAnswers: Record<string, any>) => {
      if (!user) return [];

      // Get all other users' answers
      const { data: allAnswers } = await supabase
        .from("td_answers")
        .select("*, td_profiles!inner(id, name, age, gender, photo_url, bio, location, is_premium)")
        .neq("user_id", user.id)
        .eq("is_followup", false);

      if (!allAnswers?.length) return [];

      const results = allAnswers
        .map((other) => {
          const result = computeMatch(myAnswers, other.answers);
          return {
            userId: other.user_id,
            ...result,
          };
        })
        .filter((r) => r.compatibility >= 50)
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, 10);

      // Save matches to DB
      for (const match of results) {
        const [a, b] = [user.id, match.userId].sort();
        await supabase.from("td_matches").upsert(
          {
            user_a: a,
            user_b: b,
            compatibility: match.compatibility,
            reasons: match.reasons,
            status: "pending",
          },
          { onConflict: "user_a,user_b" }
        );
      }

      return results;
    },
    [user]
  );

  return { runMatching };
}
