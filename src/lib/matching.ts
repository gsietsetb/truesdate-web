/**
 * TruesDate Matching Algorithm
 * Computes compatibility between two users based on their questionnaire answers.
 * Returns a score 0-100 and reasons.
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

const DIMENSION_WEIGHTS: Record<string, { weight: number; label: string; icon: string }> = {
  relationship_goal: { weight: 25, label: "Objetivos de relacion", icon: "heart" },
  children_desire: { weight: 15, label: "Vision sobre hijos", icon: "baby" },
  party_lifestyle: { weight: 10, label: "Estilo de vida social", icon: "party" },
  artistic_side: { weight: 10, label: "Afinidad cultural", icon: "palette" },
  sexual_desire: { weight: 15, label: "Quimica e intimidad", icon: "flame" },
  ideal_saturday: { weight: 10, label: "Compatibilidad de ocio", icon: "calendar" },
  communication_style: { weight: 15, label: "Estilo de comunicacion", icon: "message" },
};

function scaleSimilarity(a: number, b: number, max: number = 5): number {
  return 1 - Math.abs(a - b) / max;
}

function exactMatch(a: any, b: any): number {
  return a === b ? 1 : 0.3;
}

export function computeMatch(answersA: Answers, answersB: Answers): MatchResult {
  let totalScore = 0;
  let totalWeight = 0;
  const reasons: MatchReason[] = [];

  for (const [key, dim] of Object.entries(DIMENSION_WEIGHTS)) {
    const a = answersA[key];
    const b = answersB[key];
    if (a === undefined || b === undefined) continue;

    let similarity: number;
    if (typeof a === "number" && typeof b === "number") {
      similarity = scaleSimilarity(a, b);
    } else {
      similarity = exactMatch(a, b);
    }

    const weighted = similarity * dim.weight;
    totalScore += weighted;
    totalWeight += dim.weight;

    if (similarity >= 0.7) {
      let desc = "";
      if (key === "relationship_goal") {
        desc = a >= 4 && b >= 4 ? "Ambos buscais algo serio y duradero" : "Objetivos de relacion similares";
      } else if (key === "children_desire") {
        desc = Math.abs(a - b) <= 1 ? "Vision similar sobre familia" : "Compatibles en planes de futuro";
      } else if (key === "sexual_desire") {
        desc = "Nivel de deseo e importancia similar";
      } else if (key === "communication_style") {
        desc = a === b ? "Mismo estilo de resolver conflictos" : "Estilos de comunicacion complementarios";
      } else if (key === "party_lifestyle") {
        desc = "Ritmo social compatible";
      } else if (key === "artistic_side") {
        desc = "Sensibilidad cultural compartida";
      } else if (key === "ideal_saturday") {
        desc = a === b ? "Compartis el mismo plan ideal" : "Planes de ocio compatibles";
      }

      reasons.push({ label: dim.label, description: desc, icon: dim.icon });
    }
  }

  // Cat allergy dealbreaker bonus
  if (answersA.cat_allergy === false && answersB.cat_allergy === false) {
    totalScore += 2;
    totalWeight += 2;
  }
  if (answersA.cat_allergy !== answersB.cat_allergy) {
    reasons.push({
      label: "Alerta gatos",
      description: "Uno de vosotros es alergico a los gatos",
      icon: "alert",
    });
  }

  const raw = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
  const compatibility = Math.round(Math.min(Math.max(raw, 20), 98));

  return { compatibility, reasons: reasons.slice(0, 5) };
}
