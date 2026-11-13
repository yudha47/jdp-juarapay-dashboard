// src/utils/exportToExcel.ts

export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const exportToExcel = <T>({
  rows,
  columns,
  fileName,
}: {
  rows: T[];
  columns: ExportColumn<T>[];
  fileName: string;
}) => {
  const tableHeader = columns
    .map((col) => `<th>${escapeHtml(col.header)}</th>`)
    .join("");

  const tableRows = rows
    .map((row) => {
      const cells = columns
        .map((col) => `<td>${escapeHtml(col.value(row))}</td>`)
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          table {
            border-collapse: collapse;
          }
          th {
            font-weight: bold;
            background: #f1f5f9;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            mso-number-format:"\\@";
          }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${tableHeader}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `${fileName}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};