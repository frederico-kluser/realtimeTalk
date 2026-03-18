import { z } from 'zod';
import { createActionRegistry } from './registry';
import type { SpreadsheetHandle } from '@/hooks/useSpreadsheet';

let spreadsheetRef: SpreadsheetHandle | null = null;

export function setSpreadsheetRef(handle: SpreadsheetHandle) {
  spreadsheetRef = handle;
}

function colIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

// ─── Undo / Change History ──────────────────────────────────────────────
interface ChangeEntry {
  actionName: string;
  description: string;
  undo: () => void;
}

const changeHistory: ChangeEntry[] = [];
const MAX_HISTORY = 20;

function pushChange(actionName: string, description: string, undoFn: () => void) {
  changeHistory.push({ actionName, description, undo: undoFn });
  if (changeHistory.length > MAX_HISTORY) changeHistory.shift();
}

export function getLastChange(): ChangeEntry | undefined {
  return changeHistory[changeHistory.length - 1];
}

export function popLastChange(): ChangeEntry | undefined {
  return changeHistory.pop();
}

export function getChangeHistoryLength(): number {
  return changeHistory.length;
}

export const spreadsheetActions = createActionRegistry({
  set_cell_value: {
    description: 'Write a value to one cell.',
    parameters: z.object({
      cell: z.string().describe('Cell reference like "A1"'),
      value: z.union([z.string(), z.number()]).describe('Text, number, or formula starting with "="'),
    }),
    handler: async ({ cell, value }: { cell: string; value: string | number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = cell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${cell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;

      const prev = spreadsheetRef.getCellValue(row, col);
      spreadsheetRef.setCellValue(row, col, value);
      pushChange('set_cell_value', `Set ${cell} = ${value}`, () => {
        if (prev !== null && prev !== undefined && prev !== '') {
          spreadsheetRef!.setCellValue(row, col, prev as string | number);
        } else {
          spreadsheetRef!.clearRange(row, col, row, col);
        }
      });

      return { success: true, cell, value };
    },
  },

  set_range_values: {
    description: 'Fill multiple cells at once with a 2D array of values.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "A1"'),
      values: z.array(z.array(z.union([z.string(), z.number()]))).describe('2D array — each inner array is a row'),
    }),
    handler: async ({ startCell, values }: { startCell: string; values: (string | number)[][] }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = startCell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${startCell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;
      const numRows = values.length;
      const numCols = Math.max(...values.map(r => r.length));

      const prev = spreadsheetRef.getCellsInRange(row, col, row + numRows - 1, col + numCols - 1);
      spreadsheetRef.setRangeValues(row, col, values);
      pushChange('set_range_values', `Set ${numRows}x${numCols} range from ${startCell}`, () => {
        spreadsheetRef!.clearRange(row, col, row + numRows - 1, col + numCols - 1);
        if (prev.length > 0) {
          const restored = prev.map(r => r.map(v => (v ?? '') as string | number));
          spreadsheetRef!.setRangeValues(row, col, restored);
        }
      });

      return { success: true, startCell, rows: numRows, cols: numCols };
    },
  },

  set_cell_formula: {
    description: 'Set a formula in a cell (SUM, AVERAGE, IF, VLOOKUP, etc.).',
    parameters: z.object({
      cell: z.string().describe('Cell reference like "A1"'),
      formula: z.string().describe('Formula like "=SUM(A1:A10)"'),
    }),
    handler: async ({ cell, formula }: { cell: string; formula: string }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = cell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${cell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;
      const f = formula.startsWith('=') ? formula : `=${formula}`;

      const prev = spreadsheetRef.getCellValue(row, col);
      spreadsheetRef.setCellFormula(row, col, f);
      pushChange('set_cell_formula', `Formula ${f} in ${cell}`, () => {
        if (prev !== null && prev !== undefined && prev !== '') {
          spreadsheetRef!.setCellValue(row, col, prev as string | number);
        } else {
          spreadsheetRef!.clearRange(row, col, row, col);
        }
      });

      return { success: true, cell, formula: f };
    },
  },

  get_cell_value: {
    description: 'Read one cell value.',
    parameters: z.object({
      cell: z.string().describe('Cell reference like "A1"'),
    }),
    handler: async ({ cell }: { cell: string }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = cell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${cell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;
      const value = spreadsheetRef.getCellValue(row, col);
      return { cell, value: value ?? 'empty' };
    },
  },

  get_range_values: {
    description: 'Read values from a cell range.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "A1"'),
      endCell: z.string().describe('Bottom-right cell like "D10"'),
    }),
    handler: async ({ startCell, endCell }: { startCell: string; endCell: string }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const m1 = startCell.match(/^([A-Za-z]+)(\d+)$/);
      const m2 = endCell.match(/^([A-Za-z]+)(\d+)$/);
      if (!m1 || !m2) return { error: 'Invalid cell references' };
      const startCol = colIndex(m1[1]!);
      const startRow = parseInt(m1[2]!, 10) - 1;
      const endCol = colIndex(m2[1]!);
      const endRow = parseInt(m2[2]!, 10) - 1;
      const values = spreadsheetRef.getCellsInRange(startRow, startCol, endRow, endCol);
      return { range: `${startCell}:${endCell}`, values };
    },
  },

  get_sheet_summary: {
    description: 'Get spreadsheet dimensions, headers, and a data preview. Call this before modifying existing data.',
    parameters: z.object({}),
    handler: async () => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const summary = spreadsheetRef.getSheetSummary();
      return { summary };
    },
  },

  insert_rows: {
    description: 'Insert empty rows.',
    parameters: z.object({
      afterRow: z.number().describe('Row number after which to insert (1-based). 0 = top.'),
      count: z.number().describe('Number of rows').default(1),
    }),
    handler: async ({ afterRow, count }: { afterRow: number; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      spreadsheetRef.insertRows(afterRow, count);
      pushChange('insert_rows', `Insert ${count} rows after row ${afterRow}`, () => {
        spreadsheetRef!.deleteRows(afterRow, count);
      });
      return { success: true, insertedAt: afterRow, count };
    },
  },

  delete_rows: {
    description: 'Delete rows.',
    parameters: z.object({
      startRow: z.number().describe('First row to delete (1-based)'),
      count: z.number().describe('Number of rows').default(1),
    }),
    handler: async ({ startRow, count }: { startRow: number; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const row0 = startRow - 1;
      const maxCol = spreadsheetRef.getActiveSheetData().cols;
      const prev = spreadsheetRef.getCellsInRange(row0, 0, row0 + count - 1, maxCol - 1);
      spreadsheetRef.deleteRows(row0, count);
      pushChange('delete_rows', `Delete ${count} rows from row ${startRow}`, () => {
        spreadsheetRef!.insertRows(row0, count);
        if (prev.length > 0) {
          const restored = prev.map(r => r.map(v => (v ?? '') as string | number));
          spreadsheetRef!.setRangeValues(row0, 0, restored);
        }
      });
      return { success: true, deletedFrom: startRow, count };
    },
  },

  insert_columns: {
    description: 'Insert empty columns.',
    parameters: z.object({
      afterColumn: z.string().describe('Column letter after which to insert like "A"'),
      count: z.number().describe('Number of columns').default(1),
    }),
    handler: async ({ afterColumn, count }: { afterColumn: string; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const col = colIndex(afterColumn);
      spreadsheetRef.insertColumns(col + 1, count);
      pushChange('insert_columns', `Insert ${count} columns after ${afterColumn}`, () => {
        spreadsheetRef!.deleteColumns(col + 1, count);
      });
      return { success: true, insertedAfter: afterColumn, count };
    },
  },

  delete_columns: {
    description: 'Delete columns.',
    parameters: z.object({
      startColumn: z.string().describe('First column letter like "A"'),
      count: z.number().describe('Number of columns').default(1),
    }),
    handler: async ({ startColumn, count }: { startColumn: string; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const col0 = colIndex(startColumn);
      const maxRow = spreadsheetRef.getActiveSheetData().rows;
      const prev = spreadsheetRef.getCellsInRange(0, col0, maxRow - 1, col0 + count - 1);
      spreadsheetRef.deleteColumns(col0, count);
      pushChange('delete_columns', `Delete ${count} columns from ${startColumn}`, () => {
        spreadsheetRef!.insertColumns(col0, count);
        if (prev.length > 0) {
          const restored = prev.map(r => r.map(v => (v ?? '') as string | number));
          spreadsheetRef!.setRangeValues(0, col0, restored);
        }
      });
      return { success: true, deletedFrom: startColumn, count };
    },
  },

  format_cells: {
    description: 'Apply styling (bold, colors, font) to a cell range.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "A1"'),
      endCell: z.string().describe('Bottom-right cell like "D1"'),
      bold: z.boolean().optional().describe('Bold text'),
      italic: z.boolean().optional().describe('Italic text'),
      fontSize: z.number().optional().describe('Font size in points'),
      fontColor: z.string().optional().describe('Hex color like "#FF0000"'),
      background: z.string().optional().describe('Hex background like "#FFFF00"'),
      fontFamily: z.string().optional().describe('Font name like "Arial"'),
    }),
    handler: async (params: {
      startCell: string; endCell: string;
      bold?: boolean; italic?: boolean; fontSize?: number;
      fontColor?: string; background?: string; fontFamily?: string;
    }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const m1 = params.startCell.match(/^([A-Za-z]+)(\d+)$/);
      const m2 = params.endCell.match(/^([A-Za-z]+)(\d+)$/);
      if (!m1 || !m2) return { error: 'Invalid cell references' };
      const startCol = colIndex(m1[1]!);
      const startRow = parseInt(m1[2]!, 10) - 1;
      const endCol = colIndex(m2[1]!);
      const endRow = parseInt(m2[2]!, 10) - 1;
      spreadsheetRef.formatCells(startRow, startCol, endRow, endCol, {
        bold: params.bold,
        italic: params.italic,
        fontSize: params.fontSize,
        fontColor: params.fontColor,
        background: params.background,
        fontFamily: params.fontFamily,
      });
      pushChange('format_cells', `Format ${params.startCell}:${params.endCell}`, () => {
        // Formatting undo is limited — no-op for now
      });
      return { success: true, range: `${params.startCell}:${params.endCell}` };
    },
  },

  set_number_format: {
    description: 'Apply number format (currency, percentage, date) to a range.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "B2"'),
      endCell: z.string().describe('Bottom-right cell like "B100"'),
      format: z.string().describe('Format code like "$#,##0.00", "0.00%", "#,##0"'),
    }),
    handler: async ({ startCell, endCell, format }: { startCell: string; endCell: string; format: string }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const m1 = startCell.match(/^([A-Za-z]+)(\d+)$/);
      const m2 = endCell.match(/^([A-Za-z]+)(\d+)$/);
      if (!m1 || !m2) return { error: 'Invalid cell references' };
      const startCol = colIndex(m1[1]!);
      const startRow = parseInt(m1[2]!, 10) - 1;
      const endCol = colIndex(m2[1]!);
      const endRow = parseInt(m2[2]!, 10) - 1;
      spreadsheetRef.setNumberFormat(startRow, startCol, endRow, endCol, format);
      pushChange('set_number_format', `Number format ${format} on ${startCell}:${endCell}`, () => {
        // Number format undo is limited — no-op for now
      });
      return { success: true, range: `${startCell}:${endCell}`, format };
    },
  },

  set_column_width: {
    description: 'Resize a column width.',
    parameters: z.object({
      column: z.string().describe('Column letter like "A"'),
      width: z.number().describe('Width in pixels'),
    }),
    handler: async ({ column, width }: { column: string; width: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      spreadsheetRef.setColumnWidth(colIndex(column), width);
      return { success: true, column, width };
    },
  },

  clear_range: {
    description: 'Clear all content from a range.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "A1"'),
      endCell: z.string().describe('Bottom-right cell like "Z200"'),
    }),
    handler: async ({ startCell, endCell }: { startCell: string; endCell: string }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const m1 = startCell.match(/^([A-Za-z]+)(\d+)$/);
      const m2 = endCell.match(/^([A-Za-z]+)(\d+)$/);
      if (!m1 || !m2) return { error: 'Invalid cell references' };
      const startCol = colIndex(m1[1]!);
      const startRow = parseInt(m1[2]!, 10) - 1;
      const endCol = colIndex(m2[1]!);
      const endRow = parseInt(m2[2]!, 10) - 1;

      const prev = spreadsheetRef.getCellsInRange(startRow, startCol, endRow, endCol);
      spreadsheetRef.clearRange(startRow, startCol, endRow, endCol);
      pushChange('clear_range', `Clear ${startCell}:${endCell}`, () => {
        if (prev.length > 0) {
          const restored = prev.map(r => r.map(v => (v ?? '') as string | number));
          spreadsheetRef!.setRangeValues(startRow, startCol, restored);
        }
      });

      return { success: true, range: `${startCell}:${endCell}` };
    },
  },

  undo_last_change: {
    description: 'Undo the last spreadsheet modification. Call when the user asks to undo, revert, or go back.',
    parameters: z.object({}),
    handler: async () => {
      const entry = popLastChange();
      if (!entry) return { error: 'Nothing to undo' };
      entry.undo();
      return { success: true, undone: entry.description, remaining: getChangeHistoryLength() };
    },
  },

  get_current_time: {
    description: 'Get current date and time.',
    parameters: z.object({
      timezone: z.string().optional().describe('IANA timezone like "America/New_York"'),
    }),
    handler: async ({ timezone }: { timezone?: string }) => {
      const now = new Date();
      const tz = timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const formatted = now.toLocaleString('en-US', { timeZone: tz });
      return { datetime: formatted, iso: now.toISOString() };
    },
  },
});
