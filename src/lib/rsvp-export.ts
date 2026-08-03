export type RsvpExportCell = string | number | boolean | null | undefined;

export type RsvpQuestionSummary = {
  questionId: string;
  label: string;
  responseCount: number;
  values: Array<{ label: string; count: number }>;
};

export type RsvpSpreadsheetSheet = {
  name: string;
  headers: string[];
  rows: RsvpExportCell[][];
};

function escapeXml(value: RsvpExportCell) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function worksheetXml({ name, headers, rows }: RsvpSpreadsheetSheet) {
  const rowXml = [headers, ...rows]
    .map(
      (row, rowIndex) =>
        `<Row>${row
          .map(
            (cell) =>
              `<Cell${rowIndex === 0 ? ' ss:StyleID="Header"' : ""}><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`,
          )
          .join("")}</Row>`,
    )
    .join("");
  return `<Worksheet ss:Name="${escapeXml(name).slice(0, 31)}"><Table>${rowXml}</Table></Worksheet>`;
}

export function createRsvpSpreadsheetXml(
  headers: string[],
  rows: RsvpExportCell[][],
  additionalSheets: RsvpSpreadsheetSheet[] = [],
) {
  const worksheets = [
    worksheetXml({ name: "LCV Yanıtları", headers, rows }),
    ...additionalSheets.map(worksheetXml),
  ].join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E6C38A" ss:Pattern="Solid"/></Style></Styles>
 ${worksheets}
</Workbook>`;
}

function answerLabels(answer: unknown) {
  if (answer == null || answer === "") return [];
  const values = Array.isArray(answer) ? answer : [answer];
  return values
    .map((value) => {
      if (typeof value === "boolean") return value ? "Evet" : "Hayır";
      if (typeof value === "string" || typeof value === "number") return String(value).trim();
      return "";
    })
    .filter(Boolean);
}

export function summarizeRsvpQuestions(
  questions: Array<{ id: string; label: string }>,
  answers: Array<{ question_id: string; answer: unknown }>,
): RsvpQuestionSummary[] {
  return questions.map((question) => {
    const matching = answers.filter((answer) => answer.question_id === question.id);
    const counts = new Map<string, number>();
    matching.forEach((answer) => {
      answerLabels(answer.answer).forEach((label) => counts.set(label, (counts.get(label) || 0) + 1));
    });
    return {
      questionId: question.id,
      label: question.label,
      responseCount: matching.filter((answer) => answerLabels(answer.answer).length > 0).length,
      values: Array.from(counts, ([label, count]) => ({ label, count })).sort(
        (a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"),
      ),
    };
  });
}

export function pdfSafeText(value: RsvpExportCell) {
  return String(value ?? "")
    .replaceAll("ğ", "g")
    .replaceAll("Ğ", "G")
    .replaceAll("ü", "u")
    .replaceAll("Ü", "U")
    .replaceAll("ş", "s")
    .replaceAll("Ş", "S")
    .replaceAll("ı", "i")
    .replaceAll("İ", "I")
    .replaceAll("ö", "o")
    .replaceAll("Ö", "O")
    .replaceAll("ç", "c")
    .replaceAll("Ç", "C");
}
