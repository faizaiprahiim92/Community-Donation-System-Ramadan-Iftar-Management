import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  fileName: string;
  userName?: string;
  totals?: Record<string, string>;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildFileName(base: string, ext: string): string {
  const date = formatDate(new Date());
  return `${base}_${date}.${ext}`;
}

export function exportPDF(options: ExportOptions): void {
  const { title, subtitle, columns, rows, fileName, userName, totals } = options;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Community Donation System", pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ramadan Iftar Management", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 7;

  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, pageWidth / 2, y, { align: "center" });
    y += 8;
  }

  // Metadata
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const now = new Date();
  doc.text(`Generated: ${formatDateTime(now)}`, margin, y);
  if (userName) {
    doc.text(`User: ${userName}`, pageWidth - margin, y, { align: "right" });
  }
  y += 4;
  doc.text(`Total Records: ${rows.length}`, margin, y);
  y += 6;

  // Separator line
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Table
  const head = [columns.map((c) => c.header)];
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      return val !== null && val !== undefined ? String(val) : "-";
    })
  );

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      overflow: "linebreak",
      font: "helvetica",
    },
    headStyles: {
      fillColor: [34, 120, 68],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 250, 245],
    },
    columnStyles: columns.reduce(
      (acc, col, i) => {
        if (col.width) {
          acc[i] = { cellWidth: col.width };
        }
        return acc;
      },
      {} as Record<number, { cellWidth: number }>
    ),
    didDrawPage: (data) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
      doc.text(
        "Community Donation System - Ramadan Iftar Management",
        margin,
        doc.internal.pageSize.getHeight() - 8
      );
    },
  });

  // Totals
  if (totals && Object.keys(totals).length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    if (finalY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
    }
    const totalsY = Math.min(finalY, doc.internal.pageSize.getHeight() - 30);
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(margin, totalsY, pageWidth - margin, totalsY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    let ty = totalsY + 6;
    for (const [key, value] of Object.entries(totals)) {
      doc.text(`${key}:`, margin, ty);
      doc.text(value, pageWidth - margin, ty, { align: "right" });
      ty += 5;
    }
  }

  doc.save(buildFileName(fileName, "pdf"));
}

export function exportExcel(options: ExportOptions): void {
  const { title, columns, rows, fileName, totals } = options;

  const wsData: unknown[][] = [];

  // Header metadata
  wsData.push(["Community Donation System"]);
  wsData.push(["Ramadan Iftar Management"]);
  wsData.push([title]);
  wsData.push([`Generated: ${formatDateTime(new Date())}`]);
  wsData.push([`Total Records: ${rows.length}`]);
  wsData.push([]);

  // Column headers
  wsData.push(columns.map((c) => c.header));

  // Data rows
  for (const row of rows) {
    wsData.push(
      columns.map((c) => {
        const val = row[c.key];
        return val !== null && val !== undefined ? val : "-";
      })
    );
  }

  // Totals
  if (totals && Object.keys(totals).length > 0) {
    wsData.push([]);
    for (const [key, value] of Object.entries(totals)) {
      wsData.push([key, value]);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-size columns
  const colWidths = columns.map((col) => {
    const maxLen = Math.max(
      col.header.length,
      ...rows.map((row) => {
        const val = row[col.key];
        return val !== null && val !== undefined ? String(val).length : 0;
      })
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
  });
  ws["!cols"] = colWidths;

  // Merge title rows
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: columns.length - 1 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: columns.length - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: columns.length - 1 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  XLSX.writeFile(wb, buildFileName(fileName, "xlsx"));
}

export function printReport(options: ExportOptions): void {
  const { title, subtitle, columns, rows, userName, totals } = options;

  const dateStr = formatDateTime(new Date());

  let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title} - Print</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20mm; color: #1a1a1a; font-size: 11px; }
  .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #227844; padding-bottom: 12px; }
  .header h1 { font-size: 16px; color: #227844; margin-bottom: 2px; }
  .header h2 { font-size: 13px; color: #555; font-weight: normal; }
  .header h3 { font-size: 15px; color: #1a1a1a; margin-top: 8px; }
  .meta { display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th { background: #227844; color: white; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: 600; }
  td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
  tr:nth-child(even) { background: #f9fafb; }
  .totals { margin-top: 16px; border-top: 2px solid #227844; padding-top: 8px; }
  .totals .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
  .totals .row .label { font-weight: 600; }
  .footer { margin-top: 20px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 8px; }
  @media print {
    body { padding: 15mm; }
    @page { margin: 10mm; size: A4 portrait; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>Community Donation System</h1>
  <h2>Ramadan Iftar Management</h2>
  <h3>${title}</h3>
  ${subtitle ? `<p style="font-size:11px;color:#666;margin-top:4px;">${subtitle}</p>` : ""}
</div>
<div class="meta">
  <span>Generated: ${dateStr}</span>
  ${userName ? `<span>User: ${userName}</span>` : ""}
  <span>Total Records: ${rows.length}</span>
</div>
<table>
<thead><tr>`;

  for (const col of columns) {
    html += `<th>${col.header}</th>`;
  }
  html += `</tr></thead><tbody>`;

  if (rows.length === 0) {
    html += `<tr><td colspan="${columns.length}" style="text-align:center;padding:20px;color:#999;">No data available</td></tr>`;
  } else {
    for (const row of rows) {
      html += `<tr>`;
      for (const col of columns) {
        const val = row[col.key];
        html += `<td>${val !== null && val !== undefined ? val : "-"}</td>`;
      }
      html += `</tr>`;
    }
  }

  html += `</tbody></table>`;

  if (totals && Object.keys(totals).length > 0) {
    html += `<div class="totals">`;
    for (const [key, value] of Object.entries(totals)) {
      html += `<div class="row"><span class="label">${key}:</span><span>${value}</span></div>`;
    }
    html += `</div>`;
  }

  html += `<div class="footer">Community Donation System - Ramadan Iftar Management</div>`;
  html += `</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}
