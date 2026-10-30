import { describe, expect, it } from "vitest";

import {
  DirectiveFilter,
  encodeMarker,
  parseDirective,
  splitMarkers,
  stripMarkers,
  stripMarkersForModel,
  synastryKey,
  type SynastryProposal,
} from "@/lib/ask-synastry-pure";
import { computeChartSalience } from "@/lib/report-salience";
import { buildChartChatSystem } from "@/lib/chart-chat";
import { computeNatalLocally } from "@/lib/astrology-local";

const DIRECTIVE = "[[SYNASTRY_PROPOSE|გიორგი|1988-09-24|11:00|თბილისი]]";

function runFilter(chunks: string[]) {
  const f = new DirectiveFilter();
  let visible = "";
  for (const c of chunks) visible += f.push(c);
  const tail = f.end();
  return { visible: visible + tail.text, directive: tail.directive };
}

describe("DirectiveFilter", () => {
  it("passes plain text through untouched", () => {
    const r = runFilter(["გამარჯობა, ", "როგორ ხარ?"]);
    expect(r.visible).toBe("გამარჯობა, როგორ ხარ?");
    expect(r.directive).toBeNull();
  });

  it("hides the directive even when split at every possible boundary", () => {
    const full = `ვაპირებ შექმნას.\n${DIRECTIVE}`;
    for (let i = 1; i < full.length; i++) {
      const r = runFilter([full.slice(0, i), full.slice(i)]);
      expect(r.visible).toBe("ვაპირებ შექმნას.\n");
      expect(r.directive && parseDirective(r.directive)).toEqual({
        name: "გიორგი",
        date: "1988-09-24",
        time: "11:00",
        city: "თბილისი",
      });
    }
  });

  it("does not swallow a lone bracket that is not a directive", () => {
    const r = runFilter(["ეს [[არის", " ჩვეულებრივი ტექსტი]]"]);
    expect(r.visible).toBe("ეს [[არის ჩვეულებრივი ტექსტი]]");
    expect(r.directive).toBeNull();
  });

  it("works one character at a time", () => {
    const full = `ok ${DIRECTIVE}`;
    const r = runFilter(full.split(""));
    expect(r.visible).toBe("ok ");
    expect(r.directive).toBe(DIRECTIVE);
  });
});

describe("parseDirective", () => {
  it("treats unknown time as null", () => {
    expect(
      parseDirective("[[SYNASTRY_PROPOSE|Ana|2001-02-03|unknown|Batumi]]")
        ?.time,
    ).toBeNull();
  });

  it("rejects malformed directives", () => {
    expect(
      parseDirective("[[SYNASTRY_PROPOSE|Ana|03/02/2001|11:00|Batumi]]"),
    ).toBeNull();
    expect(parseDirective("[[SYNASTRY_PROPOSE|Ana|2001-02-03]]")).toBeNull();
  });
});

describe("markers", () => {
  const proposal: SynastryProposal = {
    key: synastryKey("გიორგი", "1988-09-24", "11:00"),
    name: "გიორგი",
    date: "1988-09-24",
    time: "11:00",
    cityName: "თბილისი",
    latitude: 41.7,
    longitude: 44.8,
    timezone: "Asia/Tbilisi",
    status: "pay",
    cost: 10,
    balance: 12,
  };

  it("round-trips a proposal, even when the name contains the closing glyph", () => {
    const tricky = { ...proposal, name: "A⟧B" };
    const content = `ტექსტი${encodeMarker("synastry-proposal", tricky)}`;
    const segs = splitMarkers(content);
    expect(segs[0]).toEqual({ type: "text", text: "ტექსტი" });
    expect(segs[1]).toMatchObject({ type: "proposal", data: { name: "A⟧B" } });
  });

  it("never renders a half-streamed marker as raw text", () => {
    const full = `ტექსტი${encodeMarker("synastry-proposal", proposal)}`;
    const partial = full.slice(0, full.length - 15);
    const segs = splitMarkers(partial);
    expect(segs.every((s) => s.type === "text")).toBe(true);
    expect(segs.map((s) => (s.type === "text" ? s.text : "")).join("")).toBe(
      "ტექსტი",
    );
  });

  it("strips cards for the model and for library previews", () => {
    const content = `გამარჯობა${encodeMarker("synastry-proposal", proposal)}`;
    expect(stripMarkers(content)).toBe("გამარჯობა");
    expect(stripMarkersForModel(content)).not.toContain("⟦");
    expect(stripMarkersForModel(content)).toContain("confirmation card");
  });
});

describe("chat system prompt: Vivida guide", () => {
  const chart = computeNatalLocally({
    date: "1997-11-05",
    time: "13:15",
    latitude: 41.69143,
    longitude: 44.83412,
    timezone: "Asia/Tbilisi",
  });
  const salience = computeChartSalience(chart);

  it("teaches how to see another person's chart (free calculator) and the cost", () => {
    const ka = buildChartChatSystem("მარიამ", chart, salience, "ka");
    expect(ka).toContain("/nataluri-ruka");
    expect(ka).toContain("/synastry/new");
    expect(ka).toContain("[[SYNASTRY_PROPOSE|");
    const en = buildChartChatSystem("Mariam", chart, salience, "en");
    expect(en).toContain("/nataluri-ruka");
    expect(en).toContain("[[SYNASTRY_PROPOSE|");
  });

  it("states affordability from the account state", () => {
    const poor = buildChartChatSystem("მარიამ", chart, salience, "ka", "", {
      account: { premium: false, balance: 1 },
    });
    expect(poor).toContain("არ არის საკმარისი");
    expect(poor).toContain("/credits");
    expect(poor).toContain("/subscription");

    const pro = buildChartChatSystem("Mariam", chart, salience, "en", "", {
      account: { premium: true, balance: 0 },
    });
    expect(pro).toContain("has PRO");
  });
});
