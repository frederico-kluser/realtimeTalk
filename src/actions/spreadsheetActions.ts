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

export const spreadsheetActions = createActionRegistry({
  set_cell_value: {
    description: 'Set the value of a single cell in the spreadsheet. Use when the user asks to write, set, change, or update a specific cell value.',
    parameters: z.object({
      cell: z.string().describe('Cell reference like "A1", "B3", "C10"'),
      value: z.union([z.string(), z.number()]).describe('The value to set — text, number, or formula starting with "="'),
    }),
    handler: async ({ cell, value }: { cell: string; value: string | number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = cell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${cell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;
      spreadsheetRef.setCellValue(row, col, value);
      return { success: true, cell, value };
    },
  },

  set_range_values: {
    description: 'Set values for a range of cells at once. Use when the user asks to fill multiple cells, create a table, or populate data in rows/columns.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "A1"'),
      values: z.array(z.array(z.union([z.string(), z.number()]))).describe('2D array of values — each inner array is a row'),
    }),
    handler: async ({ startCell, values }: { startCell: string; values: (string | number)[][] }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = startCell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${startCell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;
      spreadsheetRef.setRangeValues(row, col, values);
      return { success: true, startCell, rows: values.length, cols: values[0]?.length ?? 0 };
    },
  },

  set_cell_formula: {
    description: 'Set a formula in a specific cell. Use when the user asks to calculate, sum, average, or create formulas.',
    parameters: z.object({
      cell: z.string().describe('Cell reference like "A1"'),
      formula: z.string().describe('Excel formula like "=SUM(A1:A10)", "=AVERAGE(B2:B50)", "=A1*B1"'),
    }),
    handler: async ({ cell, formula }: { cell: string; formula: string }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const match = cell.match(/^([A-Za-z]+)(\d+)$/);
      if (!match) return { error: `Invalid cell reference: ${cell}` };
      const col = colIndex(match[1]!);
      const row = parseInt(match[2]!, 10) - 1;
      const f = formula.startsWith('=') ? formula : `=${formula}`;
      spreadsheetRef.setCellFormula(row, col, f);
      return { success: true, cell, formula: f };
    },
  },

  get_cell_value: {
    description: 'Read the value of a cell. Use when the user asks what is in a cell, asks to check a value, or when you need to inspect data before modifying.',
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
    description: 'Read values from a range of cells. Use when you need to understand the current spreadsheet data, analyze content, or before making modifications.',
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
    description: 'Get a summary of the current spreadsheet contents including headers, data preview, and dimensions. Use this to understand what data exists before making changes.',
    parameters: z.object({}),
    handler: async () => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const summary = spreadsheetRef.getSheetSummary();
      return { summary };
    },
  },

  insert_rows: {
    description: 'Insert new empty rows into the spreadsheet. Use when the user asks to add rows or make space for new data.',
    parameters: z.object({
      afterRow: z.number().describe('Row number after which to insert (1-based). Use 0 to insert at the top.'),
      count: z.number().describe('Number of rows to insert').default(1),
    }),
    handler: async ({ afterRow, count }: { afterRow: number; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      spreadsheetRef.insertRows(afterRow, count);
      return { success: true, insertedAt: afterRow, count };
    },
  },

  delete_rows: {
    description: 'Delete rows from the spreadsheet. Use when the user asks to remove rows or clean up data.',
    parameters: z.object({
      startRow: z.number().describe('First row to delete (1-based)'),
      count: z.number().describe('Number of rows to delete').default(1),
    }),
    handler: async ({ startRow, count }: { startRow: number; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      spreadsheetRef.deleteRows(startRow - 1, count);
      return { success: true, deletedFrom: startRow, count };
    },
  },

  insert_columns: {
    description: 'Insert new empty columns. Use when the user asks to add columns.',
    parameters: z.object({
      afterColumn: z.string().describe('Column letter after which to insert like "A", "B"'),
      count: z.number().describe('Number of columns to insert').default(1),
    }),
    handler: async ({ afterColumn, count }: { afterColumn: string; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      const col = colIndex(afterColumn);
      spreadsheetRef.insertColumns(col + 1, count);
      return { success: true, insertedAfter: afterColumn, count };
    },
  },

  delete_columns: {
    description: 'Delete columns from the spreadsheet.',
    parameters: z.object({
      startColumn: z.string().describe('First column to delete like "A", "B"'),
      count: z.number().describe('Number of columns to delete').default(1),
    }),
    handler: async ({ startColumn, count }: { startColumn: string; count: number }) => {
      if (!spreadsheetRef) return { error: 'Spreadsheet not ready' };
      spreadsheetRef.deleteColumns(colIndex(startColumn), count);
      return { success: true, deletedFrom: startColumn, count };
    },
  },

  format_cells: {
    description: 'Format cells with styling like bold, colors, font size. Use when the user asks to make cells bold, change colors, format headers, etc.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "A1"'),
      endCell: z.string().describe('Bottom-right cell like "D1"'),
      bold: z.boolean().optional().describe('Make text bold'),
      italic: z.boolean().optional().describe('Make text italic'),
      fontSize: z.number().optional().describe('Font size in points'),
      fontColor: z.string().optional().describe('Font color as hex like "#FF0000"'),
      background: z.string().optional().describe('Background color as hex like "#FFFF00"'),
      fontFamily: z.string().optional().describe('Font family like "Arial", "Inter"'),
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
      return { success: true, range: `${params.startCell}:${params.endCell}` };
    },
  },

  set_number_format: {
    description: 'Apply number formatting to cells like currency, percentage, date format. Use when user asks to format numbers as money, percentage, etc.',
    parameters: z.object({
      startCell: z.string().describe('Top-left cell like "B2"'),
      endCell: z.string().describe('Bottom-right cell like "B100"'),
      format: z.string().describe('Number format code like "$#,##0.00", "0.00%", "DD/MM/YYYY", "#,##0"'),
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
      return { success: true, range: `${startCell}:${endCell}`, format };
    },
  },

  set_column_width: {
    description: 'Set the width of a column. Use when user asks to resize or widen a column.',
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
    description: 'Clear all content and formatting from a range. Use when user asks to clear, empty, or reset cells.',
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
      spreadsheetRef.clearRange(startRow, startCol, endRow, endCol);
      return { success: true, range: `${startCell}:${endCell}` };
    },
  },

  get_current_time: {
    description: 'Get the current date and time. Use when the user asks what time or date it is.',
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
