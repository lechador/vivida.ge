import type { NatalChartJson } from "@/db/schema";

type RelationshipRecord = {
  userId: string;
  linkedUserId: string | null;
  name: string;
  chart: NatalChartJson;
};

/** Keep the purchaser as the primary chart, regardless of invite direction. */
export function resolveRelationshipReportView<T extends { data: NatalChartJson }>(input: {
  reportUserId: string;
  purchaserChart: T;
  relationship: RelationshipRecord;
  ownerChart?: T | null;
  ownerName?: string | null;
}): { chart: T; partner: { name: string; chart: NatalChartJson } } {
  if (input.relationship.userId === input.reportUserId) {
    return {
      chart: input.purchaserChart,
      partner: { name: input.relationship.name, chart: input.relationship.chart },
    };
  }
  if (input.relationship.linkedUserId === input.reportUserId) {
    if (!input.ownerChart) throw new Error("relationship owner has no chart");
    return {
      chart: input.purchaserChart,
      partner: {
        name: input.ownerName?.split(" ")[0] || "Vivida",
        chart: input.ownerChart.data,
      },
    };
  }
  throw new Error("report owner is not a relationship participant");
}
