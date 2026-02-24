/**
 * TruesDate Matching Algorithm v2
 *
 * Computes compatibility between two users based on questionnaire answers.
 * Returns a score 0–100 and top reasons.
 *
 * Dimension weights (must sum to 100):
 *   relationship_goal   25  — what you want (dealbreaker if very different)
 *   children_desire     15  — family plans (dealbreaker)
 *   love_language       12  — how you give/receive love
 *   communication_style 10  — conflict resolution
 *   sexual_desire        8  — physical intimacy importance
 *   attachment_style     8  — secure / anxious / avoidant
 *   party_lifestyle      5  — social energy
 *   health_lifestyle     4  — activity level
 *   ambition_level       4  — career centrality
 *   artistic_side        3  — cultural affinity
 *   ideal_saturday       3  — leisure fit
 *   spirituality         3  — values / worldview
 *   --------------------
 *   Subtotal            100
 *
 * Soft bonuses (capped at +5 total):
 *   diet compatibility   +2
 *   living_plans         +2
 *   relationship_rhythm  +2
 *
 * Dealbreakers (reduce final score):
 *   dealbreaker match   -10 per shared dealbreaker triggered
 */

type Answers = Record<string, any>;

interface MatchReason {
  label: string;
  description: string;
  icon: string;
}

interface MatchResult {
  compatibility: number;
  reasons: MatchReason[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function scaleSimilarity(a: number, b: number, max = 5): number {
  return Math.max(0, 1 - Math.abs(a - b) / max);
}

function exactMatch(a: any, b: any): number {
  return a === b ? 1 : 0.25;
}

// Love language: same is great, complementary pairs are ok
const LOVE_LANG_COMPAT: Record<string, Record<string, number>> = {
  words: { words: 1, time: 0.8, acts: 0.65, touch: 0.55, gifts: 0.55 },
  time:  { words: 0.8, time: 1, acts: 0.75, touch: 0.65, gifts: 0.5 },
  acts:  { words: 0.65, time: 0.75, acts: 1, touch: 0.7, gifts: 0.6 },
  touch: { words: 0.55, time: 0.65, acts: 0.7, touch: 1, gifts: 0.5 },
  gifts: { words: 0.55, time: 0.5, acts: 0.6, touch: 0.5, gifts: 1 },
};

// Attachment: secure pairs well with everyone; anxious+avoidant is poor
const ATTACH_COMPAT: Record<string, Record<string, number>> = {
  secure:   { secure: 1, anxious: 0.75, avoidant: 0.75, balanced: 0.9 },
  anxious:  { secure: 0.75, anxious: 0.55, avoidant: 0.3, balanced: 0.65 },
  avoidant: { secure: 0.75, anxious: 0.3, avoidant: 0.65, balanced: 0.7 },
  balanced: { secure: 0.9, anxious: 0.65, avoidant: 0.7, balanced: 0.85 },
};

// Spirituality: similar worldviews pair better
const SPIRIT_COMPAT: Record<string, Record<string, number>> = {
  atheist:          { atheist: 1, agnostic: 0.85, spiritual: 0.55, religious_relaxed: 0.4, religious_active: 0.2 },
  agnostic:         { atheist: 0.85, agnostic: 1, spiritual: 0.75, religious_relaxed: 0.55, religious_active: 0.3 },
  spiritual:        { atheist: 0.55, agnostic: 0.75, spiritual: 1, religious_relaxed: 0.75, religious_active: 0.5 },
  religious_relaxed:{ atheist: 0.4, agnostic: 0.55, spiritual: 0.75, religious_relaxed: 1, religious_active: 0.75 },
  religious_active: { atheist: 0.2, agnostic: 0.3, spiritual: 0.5, religious_relaxed: 0.75, religious_active: 1 },
};

// Diet: vegan/vegetarian pair better together
const DIET_COMPAT: Record<string, Record<string, number>> = {
  omnivore:    { omnivore: 1, flexitarian: 0.85, vegetarian: 0.6, vegan: 0.4, special: 0.7 },
  flexitarian: { omnivore: 0.85, flexitarian: 1, vegetarian: 0.8, vegan: 0.55, special: 0.75 },
  vegetarian:  { omnivore: 0.6, flexitarian: 0.8, vegetarian: 1, vegan: 0.85, special: 0.75 },
  vegan:       { omnivore: 0.4, flexitarian: 0.55, vegetarian: 0.85, vegan: 1, special: 0.65 },
  special:     { omnivore: 0.7, flexitarian: 0.75, vegetarian: 0.75, vegan: 0.65, special: 0.9 },
};

// Communication: direct+direct is best; avoidant pairs poorly with direct
const COMM_COMPAT: Record<string, Record<string, number>> = {
  direct:  { direct: 1, time: 0.7, writing: 0.75, humor: 0.8, avoid: 0.45 },
  time:    { direct: 0.7, time: 1, writing: 0.8, humor: 0.7, avoid: 0.6 },
  writing: { direct: 0.75, time: 0.8, writing: 1, humor: 0.65, avoid: 0.55 },
  humor:   { direct: 0.8, time: 0.7, writing: 0.65, humor: 1, avoid: 0.5 },
  avoid:   { direct: 0.45, time: 0.6, writing: 0.55, humor: 0.5, avoid: 0.65 },
};

function tableCompat(
  a: string | undefined,
  b: string | undefined,
  table: Record<string, Record<string, number>>,
  defaultVal = 0.5
): number {
  if (!a || !b) return defaultVal;
  return table[a]?.[b] ?? defaultVal;
}

// ── Main dimensions ──────────────────────────────────────────────────────────

interface Dimension {
  weight: number;
  label: string;
  icon: string;
  compute: (a: Answers, b: Answers) => number;
  describe: (sim: number, a: Answers, b: Answers) => string;
}

const DIMENSIONS: Dimension[] = [
  {
    weight: 25,
    label: "Objetivos de pareja",
    icon: "heart",
    compute: (a, b) => {
      const va = a.relationship_goal, vb = b.relationship_goal;
      if (va === undefined || vb === undefined) return 0.5;
      // Close values are great; very different (casual vs serious) reduce hard
      const raw = scaleSimilarity(va, vb, 4);
      // If one wants casual (1) and other wants serious (4-5), penalize hard
      const diff = Math.abs(va - vb);
      if (diff >= 3) return 0.1;
      return raw;
    },
    describe: (sim, a, b) => {
      if (sim >= 0.9) return a.relationship_goal >= 4
        ? "Los dos buscais algo serio y comprometido"
        : "Buscais lo mismo en este momento";
      if (sim >= 0.7) return "Objetivos de relacion muy compatibles";
      return "Teneis perspectivas complementarias";
    },
  },
  {
    weight: 15,
    label: "Vision sobre familia",
    icon: "baby",
    compute: (a, b) => {
      const va = a.children_desire, vb = b.children_desire;
      if (va === undefined || vb === undefined) return 0.5;
      const diff = Math.abs(va - vb);
      // Dealbreaker: one clearly wants (4-5), other clearly doesn't (1-2)
      if ((va <= 2 && vb >= 4) || (vb <= 2 && va >= 4)) return 0.05;
      return scaleSimilarity(va, vb, 4);
    },
    describe: (sim, a, b) => {
      if (sim >= 0.85) return "Misma vision sobre tener hijos";
      if (sim >= 0.65) return "Planes de familia compatibles";
      return "Teneis perspectivas diferentes sobre la familia";
    },
  },
  {
    weight: 12,
    label: "Lenguaje del amor",
    icon: "gift",
    compute: (a, b) => tableCompat(a.love_language, b.love_language, LOVE_LANG_COMPAT),
    describe: (sim, a, b) => {
      if (sim >= 0.9) return "Compartis el mismo lenguaje del amor";
      if (sim >= 0.7) return "Vuestros lenguajes del amor se complementan bien";
      return "Aprenderieis a hablar el idioma del otro";
    },
  },
  {
    weight: 10,
    label: "Comunicacion",
    icon: "message",
    compute: (a, b) => tableCompat(a.communication_style, b.communication_style, COMM_COMPAT),
    describe: (sim, a, b) => {
      if (sim >= 0.9) return "Los dos hablan las cosas de frente, sin rodeos";
      if (sim >= 0.7) return "Estilos de comunicacion muy compatibles";
      return "Estilos comunicativos complementarios";
    },
  },
  {
    weight: 8,
    label: "Intimidad y quimica",
    icon: "flame",
    compute: (a, b) => {
      const va = a.sexual_desire, vb = b.sexual_desire;
      if (va === undefined || vb === undefined) return 0.5;
      return scaleSimilarity(va, vb, 4);
    },
    describe: (sim) =>
      sim >= 0.85
        ? "Nivel de importancia de la intimidad muy alineado"
        : "Quimica e intimidad compatibles",
  },
  {
    weight: 8,
    label: "Estilo de vinculo",
    icon: "link",
    compute: (a, b) => tableCompat(a.attachment_style, b.attachment_style, ATTACH_COMPAT),
    describe: (sim, a, b) => {
      const both = a.attachment_style === "secure" && b.attachment_style === "secure";
      if (both) return "Los dos teneis un apego seguro — base solida";
      if (sim >= 0.75) return "Estilos de vinculo compatibles";
      return "Vuestros estilos de vinculo se complementan";
    },
  },
  {
    weight: 5,
    label: "Vida social",
    icon: "party",
    compute: (a, b) => {
      const va = a.party_lifestyle, vb = b.party_lifestyle;
      if (va === undefined || vb === undefined) return 0.5;
      return scaleSimilarity(va, vb, 4);
    },
    describe: (sim) =>
      sim >= 0.85 ? "Mismo ritmo social" : "Ritmo social compatible",
  },
  {
    weight: 4,
    label: "Salud y deporte",
    icon: "fitness",
    compute: (a, b) => {
      const va = a.health_lifestyle, vb = b.health_lifestyle;
      if (va === undefined || vb === undefined) return 0.5;
      return scaleSimilarity(va, vb, 4);
    },
    describe: (sim) =>
      sim >= 0.85 ? "Mismo nivel de actividad fisica" : "Estilos de vida saludable compatibles",
  },
  {
    weight: 4,
    label: "Ambicion",
    icon: "rocket",
    compute: (a, b) => {
      const va = a.ambition_level, vb = b.ambition_level;
      if (va === undefined || vb === undefined) return 0.5;
      return scaleSimilarity(va, vb, 4);
    },
    describe: (sim) =>
      sim >= 0.85
        ? "Misma energia y ambicion vital"
        : "Niveles de ambicion compatibles",
  },
  {
    weight: 3,
    label: "Afinidad cultural",
    icon: "palette",
    compute: (a, b) => {
      const va = a.artistic_side, vb = b.artistic_side;
      if (va === undefined || vb === undefined) return 0.5;
      return scaleSimilarity(va, vb, 4);
    },
    describe: (sim) =>
      sim >= 0.85 ? "Sensibilidad cultural muy compartida" : "Afinidad cultural compatible",
  },
  {
    weight: 3,
    label: "Ocio ideal",
    icon: "calendar",
    compute: (a, b) => exactMatch(a.ideal_saturday, b.ideal_saturday),
    describe: (sim, a, b) =>
      sim >= 0.9
        ? `Mismo plan ideal: ${a.ideal_saturday}`
        : "Planes de ocio compatibles",
  },
  {
    weight: 3,
    label: "Valores y vision del mundo",
    icon: "star",
    compute: (a, b) => tableCompat(a.spirituality, b.spirituality, SPIRIT_COMPAT),
    describe: (sim) =>
      sim >= 0.85 ? "Misma vision del mundo y valores" : "Valores y creencias compatibles",
  },
];

// ── Soft bonuses ────────────────────────────────────────────────────────────

function softBonuses(a: Answers, b: Answers): number {
  let bonus = 0;
  // Diet compatibility
  const dietSim = tableCompat(a.diet, b.diet, DIET_COMPAT, 0.5);
  if (dietSim >= 0.8) bonus += 2;
  else if (dietSim >= 0.6) bonus += 1;

  // Living plans match
  if (a.living_plans && b.living_plans && a.living_plans === b.living_plans) bonus += 2;

  // Relationship rhythm compatible
  if (a.relationship_rhythm && b.relationship_rhythm) {
    const bothSlow = a.relationship_rhythm === "slow" && b.relationship_rhythm === "slow";
    const bothTogether = ["together_always", "together_evenings", "living_together"].includes(a.relationship_rhythm)
      && ["together_always", "together_evenings", "living_together"].includes(b.relationship_rhythm);
    const bothSpace = a.relationship_rhythm === "own_space" && b.relationship_rhythm === "own_space";
    if (bothSlow || bothTogether || bothSpace) bonus += 2;
  }
  return Math.min(bonus, 5);
}

// ── Dealbreaker penalty ──────────────────────────────────────────────────────

function dealbreakersHit(a: Answers, b: Answers): number {
  let penalty = 0;

  // "dealbreaker" field: smoking, no_kids, wants_kids, long_distance
  const da = a.dealbreaker;
  const db = b.dealbreaker;

  // If A says smoking is dealbreaker and B smokes (we don't track smoking directly, skip)
  // Children mismatch is already handled by dimension weight
  // Long distance is not captured yet

  // Cat allergy
  if (a.cat_allergy === true && b.cat_allergy === false) penalty += 3;
  if (b.cat_allergy === true && a.cat_allergy === false) penalty += 3;

  return Math.min(penalty, 15);
}

// ── Main export ──────────────────────────────────────────────────────────────

export function computeMatch(answersA: Answers, answersB: Answers): MatchResult {
  let totalScore = 0;
  let totalWeight = 0;
  const reasons: MatchReason[] = [];

  for (const dim of DIMENSIONS) {
    const sim = dim.compute(answersA, answersB);
    totalScore += sim * dim.weight;
    totalWeight += dim.weight;

    if (sim >= 0.65 && reasons.length < 5) {
      reasons.push({
        label: dim.label,
        description: dim.describe(sim, answersA, answersB),
        icon: dim.icon,
      });
    }
  }

  const baseScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
  const bonus = softBonuses(answersA, answersB);
  const penalty = dealbreakersHit(answersA, answersB);

  const raw = baseScore + bonus - penalty;
  const compatibility = Math.round(Math.min(Math.max(raw, 12), 98));

  return { compatibility, reasons: reasons.slice(0, 5) };
}
