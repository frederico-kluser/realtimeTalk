import { useCallback, useEffect, useRef, useState } from 'react';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import '@univerjs/preset-sheets-core/lib/index.css';
import type { UniverWorkbookData, NumberFormatEntry } from '@/utils/xlsxImporter';

type UniverAPI = ReturnType<typeof createUniver>['univerAPI'];

export interface SpreadsheetHandle {
  api: UniverAPI | null;
  isReady: boolean;
  getCellValue: (row: number, col: number) => unknown;
  setCellValue: (row: number, col: number, value: string | number) => void;
  setRangeValues: (startRow: number, startCol: number, values: (string | number)[][]) => void;
  getCellsInRange: (startRow: number, startCol: number, endRow: number, endCol: number) => unknown[][];
  getSheetSummary: () => string;
  insertRows: (index: number, count: number) => void;
  deleteRows: (index: number, count: number) => void;
  insertColumns: (index: number, count: number) => void;
  deleteColumns: (index: number, count: number) => void;
  setCellFormula: (row: number, col: number, formula: string) => void;
  formatCells: (startRow: number, startCol: number, endRow: number, endCol: number, style: Record<string, unknown>) => void;
  setColumnWidth: (col: number, width: number) => void;
  setNumberFormat: (startRow: number, startCol: number, endRow: number, endCol: number, format: string) => void;
  getActiveSheetData: () => { rows: number; cols: number; name: string };
  clearRange: (startRow: number, startCol: number, endRow: number, endCol: number) => void;
  importWorkbook: (data: UniverWorkbookData, numberFormats?: NumberFormatEntry[]) => void;
}

const DEFAULT_ROW_COUNT = 1000;
const DEFAULT_COL_COUNT = 26;

export function useSpreadsheet(containerRef: React.RefObject<HTMLDivElement | null>): SpreadsheetHandle {
  const apiRef = useRef<UniverAPI | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
    });

    univerAPI.createWorkbook({
      sheetOrder: ['sheet1'],
      sheets: {
        sheet1: {
          id: 'sheet1',
          name: 'Financial Data',
          rowCount: DEFAULT_ROW_COUNT,
          columnCount: DEFAULT_COL_COUNT,
        },
      },
    });

    apiRef.current = univerAPI;
    setIsReady(true);

    return () => {
      univerAPI.dispose();
      apiRef.current = null;
      setIsReady(false);
    };
  }, [containerRef]);

  const getCellValue = useCallback((row: number, col: number): unknown => {
    const api = apiRef.current;
    if (!api) return null;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return null;
    return sheet.getRange(row, col, 1, 1)?.getValue() ?? null;
  }, []);

  const setCellValue = useCallback((row: number, col: number, value: string | number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    sheet.getRange(row, col, 1, 1)?.setValue(value);
  }, []);

  const setRangeValues = useCallback((startRow: number, startCol: number, values: (string | number)[][]) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    const numRows = values.length;
    const numCols = Math.max(...values.map(r => r.length));
    const range = sheet.getRange(startRow, startCol, numRows, numCols);
    range?.setValues(values);
  }, []);

  const getCellsInRange = useCallback((startRow: number, startCol: number, endRow: number, endCol: number): unknown[][] => {
    const api = apiRef.current;
    if (!api) return [];
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return [];
    const numRows = endRow - startRow + 1;
    const numCols = endCol - startCol + 1;
    const range = sheet.getRange(startRow, startCol, numRows, numCols);
    return (range?.getValues() as unknown[][]) ?? [];
  }, []);

  const getSheetSummary = useCallback((): string => {
    const api = apiRef.current;
    if (!api) return 'No spreadsheet loaded';
    const wb = api.getActiveWorkbook();
    if (!wb) return 'No workbook';
    const sheet = wb.getActiveSheet();
    if (!sheet) return 'No active sheet';

    // List all sheets
    const allSheets = wb.getSheets();
    const sheetNames = allSheets.map(s => s.getSheetName());
    const activeSheetName = sheet.getSheetName();

    const dataRange = sheet.getRange(0, 0, 50, 26);
    const values = dataRange?.getValues() as unknown[][] ?? [];

    let usedRows = 0;
    let usedCols = 0;
    for (let r = 0; r < values.length; r++) {
      for (let c = 0; c < (values[r]?.length ?? 0); c++) {
        const v = values[r]?.[c];
        if (v !== null && v !== undefined && v !== '') {
          if (r + 1 > usedRows) usedRows = r + 1;
          if (c + 1 > usedCols) usedCols = c + 1;
        }
      }
    }

    if (usedRows === 0) return `Sheet "${activeSheetName}" is empty. Sheets: [${sheetNames.join(', ')}]`;

    const colLetters = (c: number) => String.fromCharCode(65 + c);
    const preview: string[] = [];
    const maxPreviewRows = Math.min(usedRows, 20);
    const maxPreviewCols = Math.min(usedCols, 10);

    for (let r = 0; r < maxPreviewRows; r++) {
      const row: string[] = [];
      for (let c = 0; c < maxPreviewCols; c++) {
        const v = values[r]?.[c];
        row.push(v !== null && v !== undefined ? String(v) : '');
      }
      preview.push(`Row ${r + 1}: ${row.join(' | ')}`);
    }

    const colHeaders = Array.from({ length: maxPreviewCols }, (_, i) => colLetters(i)).join(' | ');
    let summary = `Sheets: [${sheetNames.join(', ')}] — Active: "${activeSheetName}"\n`;
    summary += `${usedRows} rows × ${usedCols} cols (${colLetters(0)} to ${colLetters(usedCols - 1)})\n`;
    summary += `Columns: ${colHeaders}\n`;
    summary += preview.join('\n');

    if (usedRows > maxPreviewRows) {
      summary += `\n... and ${usedRows - maxPreviewRows} more rows`;
    }

    return summary;
  }, []);

  const insertRows = useCallback((index: number, count: number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    sheet?.insertRows(index, count);
  }, []);

  const deleteRows = useCallback((index: number, count: number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    sheet?.deleteRows(index, count);
  }, []);

  const insertColumns = useCallback((index: number, count: number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    sheet?.insertColumns(index, count);
  }, []);

  const deleteColumns = useCallback((index: number, count: number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    sheet?.deleteColumns(index, count);
  }, []);

  const setCellFormula = useCallback((row: number, col: number, formula: string) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    sheet.getRange(row, col, 1, 1)?.setValue(formula);
  }, []);

  const formatCells = useCallback((startRow: number, startCol: number, endRow: number, endCol: number, style: Record<string, unknown>) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    const range = sheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);
    if (!range) return;
    if (style.bold) range.setFontWeight('bold');
    if (style.italic) range.setFontStyle('italic');
    if (style.fontSize) range.setFontSize(style.fontSize as number);
    if (style.fontColor) range.setFontColor(style.fontColor as string);
    if (style.background) range.setBackground(style.background as string);
    if (style.fontFamily) range.setFontFamily(style.fontFamily as string);
  }, []);

  const setColumnWidth = useCallback((col: number, width: number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    sheet.setColumnWidth(col, width);
  }, []);

  const setNumberFormat = useCallback((startRow: number, startCol: number, endRow: number, endCol: number, format: string) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    const range = sheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);
    range?.setNumberFormat(format);
  }, []);

  const getActiveSheetData = useCallback(() => {
    const api = apiRef.current;
    if (!api) return { rows: 0, cols: 0, name: '' };
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return { rows: 0, cols: 0, name: '' };
    return {
      rows: DEFAULT_ROW_COUNT,
      cols: DEFAULT_COL_COUNT,
      name: sheet.getSheetName(),
    };
  }, []);

  const clearRange = useCallback((startRow: number, startCol: number, endRow: number, endCol: number) => {
    const api = apiRef.current;
    if (!api) return;
    const sheet = api.getActiveWorkbook()?.getActiveSheet();
    if (!sheet) return;
    const range = sheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1);
    range?.clear();
  }, []);

  const importWorkbook = useCallback((data: UniverWorkbookData, numberFormats?: NumberFormatEntry[]) => {
    const api = apiRef.current;
    if (!api) return;

    // Dispose current workbook
    const currentWb = api.getActiveWorkbook();
    if (currentWb) {
      const unitId = currentWb.getId();
      api.disposeUnit(unitId);
    }

    // Create new workbook with imported data (includes cell styles, merges, dimensions)
    api.createWorkbook(data as unknown as Record<string, unknown>);

    // Apply number formats via Facade API (Univer stores numfmt separately from cell styles)
    if (numberFormats && numberFormats.length > 0) {
      const wb = api.getActiveWorkbook();
      if (wb) {
        const sheets = wb.getSheets();
        const sheetMap = new Map<string, typeof sheets[number]>();
        for (const s of sheets) {
          sheetMap.set(s.getSheetId(), s);
        }

        for (const nf of numberFormats) {
          const sheet = sheetMap.get(nf.sheetId);
          if (sheet) {
            try {
              sheet.getRange(nf.row, nf.col, 1, 1)?.setNumberFormat(nf.format);
            } catch {
              // Skip invalid number format entries
            }
          }
        }
      }
    }
  }, []);

  return {
    api: apiRef.current,
    isReady,
    getCellValue,
    setCellValue,
    setRangeValues,
    getCellsInRange,
    getSheetSummary,
    insertRows,
    deleteRows,
    insertColumns,
    deleteColumns,
    setCellFormula,
    formatCells,
    setColumnWidth,
    setNumberFormat,
    getActiveSheetData,
    clearRange,
    importWorkbook,
  };
}
