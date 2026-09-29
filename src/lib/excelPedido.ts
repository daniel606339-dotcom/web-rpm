/**
 * Excel del pedido para importar en el ERP.
 * Se arma con la misma estructura interna que el export de Porta (ver plantillaExcelPorta.ts),
 * porque el importador del ERP no lee bien otros .xlsx aunque se vean iguales en Excel:
 * - hoja con el nombre del pedido
 * - fila 1: "Código de Artículo" | "Cantidad" | "Precio"
 * - todas las celdas texto (estilo 1 = formato @), en sharedStrings
 */
import { zipSync, strToU8 } from "fflate";
import { APP, CORE, ESTATICOS, HOJA_FIN, HOJA_FORMATO, HOJA_INICIO, WORKBOOK } from "./plantillaExcelPorta";

export interface ItemExcel {
  cod_articulo: string;
  cantidad: number | string;
  precio: number | string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const COLS = ["A", "B", "C"];

function fechaLocal(d = new Date()) {
  // Formato W3CDTF con zona de Paraguay (-03:00), como Porta
  const py = new Date(d.getTime() - 3 * 3600 * 1000);
  return py.toISOString().slice(0, 19) + "-03:00";
}

export function excelPedido(numero: string, items: ItemExcel[]): Uint8Array {
  const hoja = numero.replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Pedido";
  const filas: string[][] = [
    ["Código de Artículo", "Cantidad", "Precio"],
    ...items.map((i) => [String(i.cod_articulo), String(Math.round(Number(i.cantidad))), String(Math.round(Number(i.precio)))]),
  ];

  // Textos compartidos (sin repetir, igual que Porta)
  const indice = new Map<string, number>();
  const textos: string[] = [];
  for (const f of filas)
    for (const v of f) {
      if (!indice.has(v)) {
        indice.set(v, textos.length);
        textos.push(v);
      }
    }
  const shared =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" uniqueCount="${textos.length}">` +
    textos.map((t) => `<si><t>${esc(t)}</t></si>`).join("") +
    `</sst>`;

  const n = filas.length;
  const sheetData =
    "<sheetData>" +
    filas
      .map(
        (f, r) =>
          `<row r="${r + 1}" spans="1:3">` +
          f.map((v, c) => `<c r="${COLS[c]}${r + 1}" s="1" t="s"><v>${indice.get(v)}</v></c>`).join("") +
          `</row>`,
      )
      .join("") +
    "</sheetData>";
  const sheet =
    HOJA_INICIO +
    `<dimension ref="A1:C${n}"/><sheetViews><sheetView tabSelected="1" workbookViewId="0" showGridLines="true" showRowColHeaders="1"><selection activeCell="C1" sqref="C1:C${n}"/></sheetView></sheetViews>` +
    HOJA_FORMATO +
    sheetData +
    HOJA_FIN;

  const archivos: Record<string, Uint8Array> = {};
  // Mismo orden de entradas que el archivo de Porta
  const orden = [
    "[Content_Types].xml",
    "_rels/.rels",
    "xl/_rels/workbook.xml.rels",
    "docProps/app.xml",
    "docProps/core.xml",
    "xl/theme/theme1.xml",
    "xl/sharedStrings.xml",
    "xl/styles.xml",
    "xl/workbook.xml",
    "xl/worksheets/sheet1.xml",
    "xl/worksheets/_rels/sheet1.xml.rels",
  ];
  const contenido: Record<string, string> = {
    ...ESTATICOS,
    "docProps/app.xml": APP.replace("{{HOJA}}", esc(hoja)),
    "docProps/core.xml": CORE.replace(/{{FECHA}}/g, fechaLocal()).replace("{{HOJA}}", esc(hoja)),
    "xl/sharedStrings.xml": shared,
    "xl/workbook.xml": WORKBOOK.replace("{{HOJA}}", esc(hoja)),
    "xl/worksheets/sheet1.xml": sheet,
  };
  for (const k of orden) archivos[k] = strToU8(contenido[k]);
  return zipSync(archivos, { level: 6 });
}
