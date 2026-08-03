export type RsvpExportCell = string | number | boolean | null | undefined;

function escapeXml(value: RsvpExportCell) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function createRsvpSpreadsheetXml(headers: string[], rows: RsvpExportCell[][]) {
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
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#E6C38A" ss:Pattern="Solid"/></Style></Styles>
 <Worksheet ss:Name="LCV Yanıtları"><Table>${rowXml}</Table></Worksheet>
</Workbook>`;
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

