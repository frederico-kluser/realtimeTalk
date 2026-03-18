/**
 * Converts an ExcelJS workbook into Univer IWorkbookData format,
 * preserving cell values, styles (colors, fonts, bold, italic),
 * borders, alignment, merged cells, column widths, row heights,
 * number formats, and multiple sheets/tabs.
 */

// ExcelJS types (used dynamically)
interface ExcelCell {
  type: number;
  value: unknown;
  formula?: string;
  result?: unknown;
  font?: {
    bold?: boolean;
    italic?: boolean;
    size?: number;
    name?: string;
    color?: { argb?: string; theme?: number };
    underline?: boolean | string;
    strike?: boolean;
  };
  fill?: {
    type?: string;
    fgColor?: { argb?: string; theme?: number };
    bgColor?: { argb?: string };
    pattern?: string;
  };
  alignment?: {
    horizontal?: string;
    vertical?: string;
    wrapText?: boolean;
    textRotation?: number;
  };
  border?: {
    top?: { style?: string; color?: { argb?: string } };
    bottom?: { style?: string; color?: { argb?: string } };
    left?: { style?: string; color?: { argb?: string } };
    right?: { style?: string; color?: { argb?: string } };
  };
  numFmt?: string;
}

interface ExcelRow {
  height?: number;
  eachCell: (opts: { includeEmpty: boolean }, cb: (cell: ExcelCell, colNumber: number) => void) => void;
}

interface ExcelColumn {
  width?: number;
}

interface ExcelWorksheet {
  name: string;
  rowCount: number;
  columnCount: number;
  defaultRowHeight?: number;
  columns?: ExcelColumn[];
  eachRow: (opts: { includeEmpty: boolean }, cb: (row: ExcelRow, rowNumber: number) => void) => void;
  model?: { merges?: string[] };
}

interface ExcelWorkbook {
  eachSheet: (cb: (worksheet: ExcelWorksheet, sheetId: number) => void) => void;
}

// ─── Univer data format types ────────────────────────────────────────

interface UniverCellStyle {
  bl?: number; // bold (1)
  it?: number; // italic (1)
  fs?: number; // font size
  ff?: string; // font family
  cl?: { rgb: string }; // font color
  ul?: { s: number }; // underline
  st?: { s: number }; // strikethrough
  bg?: { rgb: string }; // background
  ht?: number; // horizontal align: 1=left, 2=center, 3=right
  vt?: number; // vertical align: 1=top, 2=middle, 3=bottom
  tb?: number; // text wrap: 3=wrap
  tr?: { a: number; v: number }; // text rotation
  bd?: Record<string, { s: number; cl: { rgb: string } }>; // borders
}

interface UniverCellData {
  v?: string | number | boolean;
  f?: string;
  s?: UniverCellStyle;
}

interface UniverMerge {
  startRow: number;
  startColumn: number;
  endRow: number;
  endColumn: number;
}

interface UniverSheetData {
  id: string;
  name: string;
  rowCount: number;
  columnCount: number;
  cellData: Record<number, Record<number, UniverCellData>>;
  columnData?: Record<number, { w?: number }>;
  rowData?: Record<number, { h?: number }>;
  mergeData?: UniverMerge[];
}

export interface UniverWorkbookData {
  sheetOrder: string[];
  sheets: Record<string, UniverSheetData>;
}

export interface NumberFormatEntry {
  sheetId: string;
  row: number;
  col: number;
  format: string;
}

export interface ImportResult {
  workbookData: UniverWorkbookData;
  numberFormats: NumberFormatEntry[];
}

// ─── Conversion helpers ──────────────────────────────────────────────

function argbToHex(argb: string): string {
  // ARGB format: FFRRGGBB → #RRGGBB
  if (argb.length === 8) return `#${argb.substring(2)}`;
  if (argb.length === 6) return `#${argb}`;
  return argb.startsWith('#') ? argb : `#${argb}`;
}

function mapBorderStyle(style?: string): number {
  switch (style) {
    case 'thin': return 1;
    case 'medium': return 2;
    case 'thick': return 3;
    case 'dotted': return 4;
    case 'dashed': return 5;
    case 'double': return 6;
    default: return 1;
  }
}

function cellRefToCoords(ref: string): { row: number; col: number } | null {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  const letters = match[1]!.toUpperCase();
  const col = letters.split('').reduce((acc, c) => acc * 26 + (c.charCodeAt(0) - 64), 0) - 1;
  const row = parseInt(match[2]!, 10) - 1;
  return { row, col };
}

function isTransparent(hex: string): boolean {
  const upper = hex.toUpperCase();
  return upper === '#000000' || upper === '#FFFFFF00' || upper === '#00000000';
}

// ─── Main converter ──────────────────────────────────────────────────

export function convertExcelJSToUniver(workbook: ExcelWorkbook): ImportResult {
  const sheetOrder: string[] = [];
  const sheets: Record<string, UniverSheetData> = {};
  const numberFormats: NumberFormatEntry[] = [];

  workbook.eachSheet((worksheet: ExcelWorksheet, sheetId: number) => {
    const sheetKey = `sheet${sheetId}`;
    sheetOrder.push(sheetKey);

    const cellData: Record<number, Record<number, UniverCellData>> = {};
    const columnData: Record<number, { w?: number }> = {};
    const rowData: Record<number, { h?: number }> = {};
    const mergeData: UniverMerge[] = [];

    let maxRow = 0;
    let maxCol = 0;

    worksheet.eachRow({ includeEmpty: false }, (row: ExcelRow, rowNumber: number) => {
      const rowIdx = rowNumber - 1;
      if (rowIdx > maxRow) maxRow = rowIdx;
      cellData[rowIdx] = {};

      if (row.height && row.height !== worksheet.defaultRowHeight) {
        rowData[rowIdx] = { h: row.height };
      }

      row.eachCell({ includeEmpty: false }, (cell: ExcelCell, colNumber: number) => {
        const colIdx = colNumber - 1;
        if (colIdx > maxCol) maxCol = colIdx;

        const cellObj: UniverCellData = {};

        // ── Value ──
        // ExcelJS ValueType: 0=Null, 1=Merge, 2=Number, 3=String, 4=Date,
        // 5=Hyperlink, 6=Formula, 7=SharedString, 8=RichText, 9=Boolean, 10=Error
        if (cell.type === 6 && cell.formula) {
          cellObj.f = cell.formula.startsWith('=') ? cell.formula : `=${cell.formula}`;
          if (cell.result !== undefined && cell.result !== null) {
            cellObj.v = cell.result as string | number;
          }
        } else if (cell.type === 4 && cell.value instanceof Date) {
          cellObj.v = cell.value.toLocaleDateString();
        } else if (cell.value !== null && cell.value !== undefined) {
          // Handle hyperlink objects
          if (typeof cell.value === 'object' && 'text' in (cell.value as Record<string, unknown>)) {
            cellObj.v = (cell.value as { text: string }).text;
          } else {
            cellObj.v = cell.value as string | number | boolean;
          }
        }

        // ── Style ──
        const style: UniverCellStyle = {};

        // Font
        if (cell.font) {
          if (cell.font.bold) style.bl = 1;
          if (cell.font.italic) style.it = 1;
          if (cell.font.size) style.fs = cell.font.size;
          if (cell.font.name) style.ff = cell.font.name;
          if (cell.font.color?.argb) {
            const hex = argbToHex(cell.font.color.argb);
            if (!isTransparent(hex)) style.cl = { rgb: hex };
          }
          if (cell.font.underline) style.ul = { s: 1 };
          if (cell.font.strike) style.st = { s: 1 };
        }

        // Fill / Background
        if (cell.fill && cell.fill.type === 'pattern') {
          const fgColor = cell.fill.fgColor?.argb;
          if (fgColor) {
            const hex = argbToHex(fgColor);
            if (!isTransparent(hex)) style.bg = { rgb: hex };
          }
        }

        // Alignment
        if (cell.alignment) {
          const a = cell.alignment;
          if (a.horizontal === 'left') style.ht = 1;
          else if (a.horizontal === 'center') style.ht = 2;
          else if (a.horizontal === 'right') style.ht = 3;

          if (a.vertical === 'top') style.vt = 1;
          else if (a.vertical === 'middle') style.vt = 2;
          else if (a.vertical === 'bottom') style.vt = 3;

          if (a.wrapText) style.tb = 3;
          if (a.textRotation) style.tr = { a: a.textRotation, v: 0 };
        }

        // Borders
        if (cell.border) {
          const bd: Record<string, { s: number; cl: { rgb: string } }> = {};
          const mapBorder = (b?: { style?: string; color?: { argb?: string } }) => {
            if (!b || !b.style) return null;
            const color = b.color?.argb ? argbToHex(b.color.argb) : '#000000';
            return { s: mapBorderStyle(b.style), cl: { rgb: color } };
          };
          const top = mapBorder(cell.border.top);
          const bottom = mapBorder(cell.border.bottom);
          const left = mapBorder(cell.border.left);
          const right = mapBorder(cell.border.right);
          if (top) bd.t = top;
          if (bottom) bd.b = bottom;
          if (left) bd.l = left;
          if (right) bd.r = right;
          if (Object.keys(bd).length > 0) style.bd = bd;
        }

        if (Object.keys(style).length > 0) {
          cellObj.s = style;
        }

        // Number format (applied separately via Facade API)
        if (cell.numFmt) {
          numberFormats.push({ sheetId: sheetKey, row: rowIdx, col: colIdx, format: cell.numFmt });
        }

        if (cellObj.v !== undefined || cellObj.f || cellObj.s) {
          cellData[rowIdx]![colIdx] = cellObj;
        }
      });
    });

    // Column widths (ExcelJS width is in characters ≈ 7.5px each)
    if (worksheet.columns) {
      worksheet.columns.forEach((col: ExcelColumn, index: number) => {
        if (col && col.width) {
          columnData[index] = { w: Math.round(col.width * 7.5) };
        }
      });
    }

    // Merged cells
    const merges = worksheet.model?.merges;
    if (Array.isArray(merges)) {
      for (const merge of merges) {
        const parts = (merge as string).split(':');
        if (parts.length === 2) {
          const start = cellRefToCoords(parts[0]!);
          const end = cellRefToCoords(parts[1]!);
          if (start && end) {
            mergeData.push({
              startRow: start.row,
              startColumn: start.col,
              endRow: end.row,
              endColumn: end.col,
            });
          }
        }
      }
    }

    sheets[sheetKey] = {
      id: sheetKey,
      name: worksheet.name || `Sheet ${sheetId}`,
      rowCount: Math.max(maxRow + 100, 200),
      columnCount: Math.max(maxCol + 10, 26),
      cellData,
      ...(Object.keys(columnData).length > 0 && { columnData }),
      ...(Object.keys(rowData).length > 0 && { rowData }),
      ...(mergeData.length > 0 && { mergeData }),
    };
  });

  return { workbookData: { sheetOrder, sheets }, numberFormats };
}
