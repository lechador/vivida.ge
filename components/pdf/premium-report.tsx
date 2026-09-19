import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

import type { PremiumReportContentJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { C } from "@/lib/pdf/theme";
import { registerReportFonts } from "@/components/pdf/natal-report";

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "Noto",
    fontSize: 10.5,
    lineHeight: 1.65,
    paddingTop: 52,
    paddingBottom: 54,
    paddingHorizontal: 48,
  },
  cover: {
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "Noto",
    justifyContent: "center",
    paddingHorizontal: 62,
  },
  kicker: {
    color: C.cyan,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  coverTitle: {
    fontSize: 38,
    lineHeight: 1.12,
    fontWeight: "bold",
    maxWidth: 430,
  },
  subtitle: { color: C.violet, fontSize: 14, marginTop: 18, lineHeight: 1.5 },
  coverRule: { width: 86, height: 2, marginTop: 28, backgroundColor: C.pink },
  brand: {
    position: "absolute",
    bottom: 52,
    left: 62,
    color: C.textDim,
    fontSize: 9,
    letterSpacing: 2.5,
  },
  pageTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 14 },
  prose: { color: C.textMuted, fontSize: 10.5, lineHeight: 1.7 },
  section: { marginBottom: 22 },
  sectionNo: {
    color: C.violet,
    fontSize: 8.5,
    letterSpacing: 2,
    marginBottom: 5,
  },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 8 },
  highlight: {
    backgroundColor: C.panel,
    borderLeftWidth: 3,
    borderLeftColor: C.cyan,
    borderRadius: 7,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 11,
  },
  highlightText: { color: C.text, fontSize: 9.5 },
  dates: { marginTop: 4 },
  dateRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.borderSoft,
    paddingVertical: 8,
  },
  date: { width: 78, color: C.cyan, fontSize: 9, fontWeight: "bold" },
  dateBody: { flex: 1 },
  dateTitle: { fontSize: 10, fontWeight: "bold" },
  dateNote: { color: C.textMuted, fontSize: 9, marginTop: 2 },
  plan: {
    backgroundColor: C.panel,
    borderRadius: 10,
    padding: 16,
    marginTop: 5,
  },
  planRow: { flexDirection: "row", marginBottom: 9 },
  planNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.violet,
    color: C.onAccent,
    textAlign: "center",
    paddingTop: 3,
    fontWeight: "bold",
    marginRight: 9,
  },
  planText: { flex: 1, color: C.text, fontSize: 10.5 },
  closing: {
    color: C.textMuted,
    fontSize: 12,
    lineHeight: 1.7,
    textAlign: "center",
    marginTop: 42,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    color: C.textDim,
    fontSize: 8,
  },
});

function chunks<T>(items: readonly T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

function paginateBody(body: string, maxChars = 1_050): string[] {
  const paragraphs = body.split("\n\n");
  if (paragraphs.length === 1 || body.length <= maxChars) return [body];
  const pages: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (current && candidate.length > maxChars) {
      pages.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }
  if (current) pages.push(current);
  return pages;
}

function Footer({ locale }: { locale: UserLocale }) {
  return (
    <View style={styles.footer} fixed>
      <Text>VIVIDA</Text>
      <Text>
        {locale === "ka"
          ? "პერსონალური ასტროლოგიური რეპორტი"
          : "Personal astrology report"}
      </Text>
    </View>
  );
}

export function PremiumReport({
  content,
  locale,
}: {
  content: PremiumReportContentJson;
  locale: UserLocale;
}) {
  registerReportFonts();
  const localizedFont = { fontFamily: "Noto" };
  const contents = locale === "ka" ? "შენი რეპორტი" : "Your report";
  const datePages = chunks(content.keyDates ?? [], 10);
  return (
    <Document title={content.title} author="Vivida">
      <Page size="A4" style={[styles.cover, localizedFont]}>
        <Text style={styles.kicker}>VIVIDA · {contents}</Text>
        <Text style={styles.coverTitle}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
        <View style={styles.coverRule} />
        <Text style={styles.brand}>VIVIDA · {"PERSONAL ASTROLOGY"}</Text>
      </Page>

      <Page size="A4" style={[styles.page, localizedFont]}>
        <Text style={styles.pageTitle}>
          {locale === "ka" ? "მთავარი ხედვა" : "The big picture"}
        </Text>
        <Text style={styles.prose}>{content.overview}</Text>
        <Footer locale={locale} />
      </Page>

      {content.sections.flatMap((section, index) => {
        const bodyPages = paginateBody(section.body);
        return bodyPages.map((body, pageIndex) => (
          <Page
            size="A4"
            style={[styles.page, localizedFont]}
            key={`${section.title}-${index}-${pageIndex}`}
          >
            <View style={styles.section}>
              <Text style={styles.sectionNo}>
                {String(index + 1).padStart(2, "0")} ·{" "}
                {locale === "ka" ? "თავი" : "SECTION"}
              </Text>
              <Text style={styles.sectionTitle}>
                {section.title}
                {pageIndex > 0 ? ` · ${pageIndex + 1}` : ""}
              </Text>
              <Text style={styles.prose}>{body}</Text>
              {pageIndex === bodyPages.length - 1 &&
                section.highlights?.map((highlight) => (
                  <View style={styles.highlight} key={highlight} wrap={false}>
                    <Text style={styles.highlightText}>• {highlight}</Text>
                  </View>
                ))}
            </View>
            <Footer locale={locale} />
          </Page>
        ));
      })}

      {datePages.map((dates, pageIndex) => (
        <Page
          size="A4"
          style={[styles.page, localizedFont]}
          key={`dates-${pageIndex}`}
        >
          <Text style={styles.pageTitle}>
            {locale === "ka" ? "მნიშვნელოვანი თარიღები" : "Key dates"}
            {pageIndex > 0 ? ` · ${pageIndex + 1}` : ""}
          </Text>
          <View style={styles.dates}>
            {dates.map((item, index) => (
              <View
                style={styles.dateRow}
                key={`${item.date}-${index}`}
                wrap={false}
              >
                <Text style={styles.date}>{item.date}</Text>
                <View style={styles.dateBody}>
                  <Text style={styles.dateTitle}>{item.title}</Text>
                  <Text style={styles.dateNote}>{item.note}</Text>
                </View>
              </View>
            ))}
          </View>
          <Footer locale={locale} />
        </Page>
      ))}

      <Page size="A4" style={[styles.page, localizedFont]}>
        <Text style={styles.pageTitle}>
          {locale === "ka" ? "სამოქმედო გეგმა" : "Your action plan"}
        </Text>
        <View style={styles.plan}>
          {content.actionPlan.map((item, index) => (
            <View style={styles.planRow} key={item} wrap={false}>
              <Text style={styles.planNumber}>{index + 1}</Text>
              <Text style={styles.planText}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.closing}>{content.closing}</Text>
        <Footer locale={locale} />
      </Page>
    </Document>
  );
}
