const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const LABEL_LAYOUTS = {
  labels_12: {
    key: "labels_12",
    title: "2×6 · 12 Etiketten",
    columns: 2,
    rows: 6,
    labelWidthMm: 99,
    labelHeightMm: 46.17,
    marginTopMm: 5,
    marginLeftMm: 5,
    gapXmm: 2,
    gapYmm: 2,
    qrSizeMm: 24,
    innerPaddingMm: 3,
    nameFontPx: 20,
    metaFontPx: 11,
    codeFontPx: 9,
    showCode: true,
    showName: true,
    showCategory: true,
    showLocation: true,
  },

  labels_24: {
    key: "labels_24",
    title: "3×8 · 24 Etiketten",
    columns: 3,
    rows: 8,
    labelWidthMm: 65.33,
    labelHeightMm: 34.13,
    marginTopMm: 5,
    marginLeftMm: 5,
    gapXmm: 2,
    gapYmm: 2,
    qrSizeMm: 16,
    innerPaddingMm: 2.2,
    nameFontPx: 13,
    metaFontPx: 8,
    codeFontPx: 7,
    showCode: true,
    showName: true,
    showCategory: true,
    showLocation: true,
  },

  labels_40: {
    key: "labels_40",
    title: "4×10 · 40 Etiketten",
    columns: 4,
    rows: 10,
    labelWidthMm: 48.5,
    labelHeightMm: 26.9,
    marginTopMm: 5,
    marginLeftMm: 5,
    gapXmm: 2,
    gapYmm: 2,
    qrSizeMm: 11.5,
    innerPaddingMm: 1.5,
    nameFontPx: 9,
    metaFontPx: 6.5,
    codeFontPx: 6,
    showCode: true,
    showName: true,
    showCategory: false,
    showLocation: false,
  },
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function chunkItems(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

function buildSingleLabel(item, qrDataUri, layout) {
  const safeCode = escapeHtml(item.code || "");
  const safeName = escapeHtml(item.shortLabel || item.name || "");
  const safeCategory = escapeHtml(item.category || "");
  const safeLocation = escapeHtml(item.location || "");

  return `
    <div class="label">
      <div class="labelRow">
        <div class="qrWrap">
          ${
            qrDataUri
              ? `<img class="qrImage" src="${qrDataUri}" alt="QR Code" />`
              : `<div class="qrPlaceholder">QR</div>`
          }
        </div>

        <div class="textWrap">
          ${layout.showName ? `<div class="name">${safeName}</div>` : ""}
          ${layout.showCategory ? `<div class="meta">${safeCategory}</div>` : ""}
          ${
            layout.showLocation && safeLocation
              ? `<div class="meta">${safeLocation}</div>`
              : ""
          }
          ${layout.showCode ? `<div class="code">${safeCode}</div>` : ""}
        </div>
      </div>
    </div>
  `;
}

export function buildLabelsHtml(items = [], options = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const { qrMap = {}, layoutKey = "labels_24" } = options;
  const layout = LABEL_LAYOUTS[layoutKey] || LABEL_LAYOUTS.labels_24;

  const itemsPerPage = layout.columns * layout.rows;
  const pages = chunkItems(safeItems, itemsPerPage);

  return `
    <!DOCTYPE html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>Etikettenvorschau</title>
        <style>
          * {
            box-sizing: border-box;
          }

          @page {
            size: A4 portrait;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #e5e7eb;
            font-family: Arial, sans-serif;
            color: #111827;
          }

          body {
            padding: 12px;
          }

          .previewCanvas {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            width: 100%;
          }

          .pages {
            display: flex;
            flex-direction: column;
            gap: 28px;
            padding-bottom: 40px;
            width: 100%;
            align-items: center;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            background: #ffffff;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.10);
            position: relative;
            border-radius: 8px;
          }

          .pageHeader {
            padding-top: 5mm;
          }

          h1 {
            margin: 0 5mm 2mm 5mm;
            font-size: 18px;
            line-height: 1.2;
          }

          .info {
            margin: 0 5mm 4mm 5mm;
            color: #6b7280;
            font-size: 12px;
          }

          .sheet {
            width: 210mm;
            min-height: calc(297mm - 20mm);
            padding-left: ${layout.marginLeftMm}mm;
            padding-top: ${layout.marginTopMm}mm;
            display: grid;
            grid-template-columns: repeat(${layout.columns}, ${layout.labelWidthMm}mm);
            grid-auto-rows: ${layout.labelHeightMm}mm;
            column-gap: ${layout.gapXmm}mm;
            row-gap: ${layout.gapYmm}mm;
            align-content: start;
            justify-content: start;
            background: #fff;
          }

          .label {
            width: ${layout.labelWidthMm}mm;
            height: ${layout.labelHeightMm}mm;
            overflow: hidden;
            background: #ffffff;
            border: 1px dashed #d1d5db;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .labelRow {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: ${layout.innerPaddingMm}mm;
            width: 100%;
            height: 100%;
            padding: ${layout.innerPaddingMm}mm;
          }

          .qrWrap {
            width: ${layout.qrSizeMm}mm;
            height: ${layout.qrSizeMm}mm;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qrImage {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }

          .qrPlaceholder {
            width: 100%;
            height: 100%;
            border: 1px dashed #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            font-size: 10px;
            font-weight: 700;
            background: #f8fafc;
          }

          .textWrap {
            flex: 1;
            min-width: 0;
            text-align: left;
            overflow: hidden;
          }

          .name {
            font-size: ${layout.nameFontPx}px;
            font-weight: 800;
            line-height: 1.1;
            color: #111827;
            margin-bottom: 1mm;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .meta {
            font-size: ${layout.metaFontPx}px;
            line-height: 1.15;
            color: #4b5563;
            margin-bottom: 0.7mm;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .code {
            font-size: ${layout.codeFontPx}px;
            line-height: 1.1;
            font-weight: 700;
            color: #ff6b00;
            word-break: break-word;
            overflow-wrap: break-word;
          }

          .emptyState {
            margin: 10mm 5mm 0 5mm;
            padding: 24px;
            border: 1px dashed #d1d5db;
            border-radius: 12px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            background: #ffffff;
          }

          @media print {
            html,
            body {
              background: #ffffff;
              padding: 0;
            }

            .previewCanvas {
              display: block;
            }

            .pages {
              gap: 0;
            }

            .page {
              width: 210mm;
              min-height: 297mm;
              box-shadow: none;
              page-break-after: always;
              border-radius: 0;
            }

            .page:last-child {
              page-break-after: auto;
            }

            .pageHeader {
              display: none;
            }

            .label {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="previewCanvas">
          ${
            safeItems.length === 0
              ? `<div class="emptyState">Keine Artikel für den Etikettendruck vorhanden.</div>`
              : `
                <div class="pages">
                  ${pages
                    .map(
                      (pageItems, pageIndex) => `
                        <div class="page">
                          <div class="pageHeader">
                            <h1>Etikettenvorschau</h1>
                            <div class="info">
                              Layout: ${escapeHtml(layout.title)} · Seite ${pageIndex + 1} von ${pages.length} · Anzahl Artikel: ${safeItems.length}
                            </div>
                          </div>

                          <div class="sheet">
                            ${pageItems
                              .map((item) =>
                                buildSingleLabel(item, qrMap[item.code] || "", layout)
                              )
                              .join("")}
                          </div>
                        </div>
                      `
                    )
                    .join("")}
                </div>
              `
          }
        </div>
      </body>
    </html>
  `;
}