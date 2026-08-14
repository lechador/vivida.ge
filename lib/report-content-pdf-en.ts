import type { NatalChartJson } from "@/db/schema";
import type {
  NatalNarrative,
  NatalReportContent,
} from "@/lib/report-content";
import type { ChartSalience } from "@/lib/report-salience";
import { buildEnglishChartInterpretation } from "@/lib/report-content-en";
import { bodyMeta } from "@/lib/zodiac";

const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "fire",
  მიწა: "earth",
  ჰაერი: "air",
  წყალი: "water",
};

const MODALITY_EN: Record<string, string> = {
  კარდინალური: "cardinal",
  ფიქსირებული: "fixed",
  მუტაბელური: "mutable",
};

function bodyName(key: string): string {
  return bodyMeta(key)?.labelEn ?? key[0].toUpperCase() + key.slice(1);
}

/**
 * Complete English PDF content derived from the exact natal chart. The
 * Georgian report keeps its premium AI/library path; English generation is
 * deterministic so it never reuses Georgian cached prose and cannot fail on
 * a translation-model outage after the user has paid.
 */
export function buildEnglishNatalReportContent(
  chart: NatalChartJson,
  salience: ChartSalience,
  firstName: string | null,
): NatalReportContent {
  const interpretation = buildEnglishChartInterpretation(chart);
  const salutation = firstName ? `${firstName}, your` : "Your";
  const dominantElement = ELEMENT_EN[salience.elements.dominant] ?? "dominant";
  const weakestElement = ELEMENT_EN[salience.elements.weakest] ?? "less emphasized";
  const dominantModality = MODALITY_EN[salience.modality.dominant] ?? "dominant";
  const weakestModality = MODALITY_EN[salience.modality.weakest] ?? "less emphasized";

  const harmonious = salience.tightestAspects.filter(
    (aspect) => aspect.family === "harmonic",
  );
  const tense = salience.tightestAspects.filter(
    (aspect) => aspect.family === "tense",
  );
  const strongestAspect = salience.tightestAspects[0];

  const standout = [...(interpretation.highlights ?? [])].slice(0, 6);
  if (standout.length < 4) {
    standout.push({
      title: `${dominantModality[0].toUpperCase() + dominantModality.slice(1)} momentum`,
      body: `The ${dominantModality} modality carries the most weight in this chart. It describes the rhythm you are most likely to trust when responding to change, while the less emphasized ${weakestModality} mode may need more deliberate practice.`,
    });
  }

  const narrative: NatalNarrative = {
    standout,
    signature:
      interpretation.summary ??
      `${salutation} chart is a system of interacting needs rather than a single sign. Its strongest placements describe how identity, emotion, action, relationship, and responsibility work together.`,
    balance: `Your strongest weighted element is ${dominantElement} (${Math.round(salience.elements.percentages[salience.elements.dominant])}%), while ${weakestElement} is less emphasized (${Math.round(salience.elements.percentages[salience.elements.weakest])}%). The dominant modality is ${dominantModality}; ${weakestModality} carries less weight. A dominant element is a familiar resource, not a requirement to stay in one mode. The quieter element and modality often describe capacities that become stronger through conscious experience, supportive relationships, and repeated practice.`,
    strengths:
      harmonious.length > 0
        ? `Your closest supportive aspects include ${harmonious
            .slice(0, 3)
            .map((aspect) => `${bodyName(aspect.a)} ${aspect.kind} ${bodyName(aspect.b)}`)
            .join(", ")}. These links suggest abilities that can cooperate with relatively little internal resistance. Their ease becomes most valuable when you give it a purpose, build a skill around it, and avoid assuming that natural talent needs no attention.`
        : `This chart's strengths are built less through obvious ease and more through persistence, self-knowledge, and the ability to work creatively with complexity. Repeated effort can turn demanding patterns into unusually dependable skills.`,
    growth:
      tense.length > 0
        ? `The strongest growth patterns include ${tense
            .slice(0, 3)
            .map((aspect) => `${bodyName(aspect.a)} ${aspect.kind} ${bodyName(aspect.b)}`)
            .join(", ")}. These aspects do not predict failure; they show needs that may compete for attention until you develop a more flexible response. Growth comes from naming both sides, slowing automatic reactions, and designing practical ways for the two functions to coexist.`
        : `Few of the tightest aspects are strongly tense. Growth may therefore depend on using your easier patterns intentionally, asking for honest feedback, and choosing challenges before circumstances choose them for you.`,
    closing: `${salutation} natal chart describes a starting pattern, not a fixed verdict. ${
      strongestAspect
        ? `Its tightest highlighted connection—${bodyName(strongestAspect.a)} ${strongestAspect.kind} ${bodyName(strongestAspect.b)}—is one important thread, but it gains meaning only inside the whole chart.`
        : "Each placement gains meaning through its relationship with the whole chart."
    } Use the report as a language for reflection: keep what helps you recognize a real pattern, question what does not fit, and let lived experience remain the final authority.`,
  };

  return {
    narrative,
    planets: {
      ...(interpretation.planets ?? {}),
      sun: interpretation.bigThree?.sun ?? "",
      moon: interpretation.bigThree?.moon ?? "",
      ascendant: interpretation.bigThree?.ascendant ?? "",
    },
    houses: interpretation.houses ?? null,
    aspects: interpretation.aspects ?? null,
  };
}
