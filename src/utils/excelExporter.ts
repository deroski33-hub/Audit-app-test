import * as XLSX from 'xlsx';
import { LeadSchedule, ExtractedInvoice, ExportConfig } from '@/types';

/**
 * Excel Exporter with Big 4 Audit Firm Headers
 *
 * This module provides Excel export functionality following Big 4 audit firm
 * formatting standards. Supports Deloitte, PwC, EY, and KPMG header styles.
 */

// Big 4 Firm Header Configurations
const BIG4_HEADERS: Record<string, { firmName: string; colors: { primary: string; secondary: string } }> = {
  deloitte: {
    firmName: 'Deloitte & Touche LLP',
    colors: { primary: '#86BC25', secondary: '#0076A8' },
  },
  pwc: {
    firmName: 'PricewaterhouseCoopers LLP',
    colors: { primary: '#D04A02', secondary: '#2D2D2D' },
  },
  ey: {
    firmName: 'Ernst & Young LLP',
    colors: { primary: '#FFE600', secondary: '#2E2E38' },
  },
  kpmg: {
    firmName: 'KPMG LLP',
    colors: { primary: '#00338D', secondary: '#0091DA' },
  },
  custom: {
    firmName: 'Audit Firm',
    colors: { primary: '#1e3a5f', secondary: '#3182ce' },
  },
};

// Standard Audit Tickmarks
const TICKMARKS = {
  'F': 'Footed',
  'C': 'Cross-footed',
  'T': 'Traced to source document',
  'V': 'Vouched to supporting documentation',
  'R': 'Recalculated',
  'A': 'Agreed to prior year workpapers',
  'I': 'Inspected',
  'O': 'Observed',
  'E': 'Confirmed externally',
  'S': 'Scanned for reasonableness',
  '√': 'No exceptions noted',
  'PBC': 'Prepared by client',
};

/**
 * Create a workbook with standard Big 4 formatting
 */
function createFormattedWorkbook(): XLSX.WorkBook {
  return XLSX.utils.book_new();
}

/**
 * Apply Big 4 header styling to a worksheet
 */
function applyBig4Header(
  ws: XLSX.WorkSheet,
  config: ExportConfig,
  clientName: string,
  scheduleTitle: string,
  fiscalYearEnd: Date
): void {
  const firmConfig = BIG4_HEADERS[config.headerFormat] || BIG4_HEADERS.custom;
  const firmName = config.firmName || firmConfig.firmName;

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Ref
    { wch: 12 }, // Account Code
    { wch: 40 }, // Description
    { wch: 18 }, // Prior Year
    { wch: 18 }, // Current Year
    { wch: 18 }, // Variance
    { wch: 10 }, // Variance %
    { wch: 12 }, // W/P Ref
  ];
}

/**
 * Export Lead Schedule to Excel with Big 4 headers
 */
export function exportLeadScheduleToExcel(
  schedule: LeadSchedule,
  config: ExportConfig
): Blob {
  const wb = createFormattedWorkbook();
  const firmConfig = BIG4_HEADERS[config.headerFormat] || BIG4_HEADERS.custom;
  const firmName = config.firmName || firmConfig.firmName;

  // Build header rows
  const headerRows = [
    [firmName],
    [''],
    [schedule.clientName],
    [schedule.title],
    [`Fiscal Year Ended: ${schedule.fiscalYearEnd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`],
    [''],
    [`Prepared by: ${schedule.preparedBy}`, '', `Date: ${schedule.preparedDate.toLocaleDateString()}`],
    [schedule.reviewedBy ? `Reviewed by: ${schedule.reviewedBy}` : '', '', schedule.reviewedDate ? `Date: ${schedule.reviewedDate.toLocaleDateString()}` : ''],
    [''],
    ['Ref', 'Account', 'Description', 'Prior Year', 'Current Year', 'Variance', 'Var %', 'W/P Ref'],
  ];

  // Add data rows
  const dataRows = schedule.entries.map(entry => [
    entry.referenceNumber,
    entry.accountCode,
    entry.accountDescription,
    entry.priorYearBalance,
    entry.currentYearBalance,
    entry.variance,
    `${entry.variancePercentage >= 0 ? '+' : ''}${entry.variancePercentage.toFixed(1)}%`,
    entry.workpaperReference || '',
  ]);

  // Add total row
  const totalRow = [
    '',
    '',
    'TOTAL',
    schedule.totalPriorYear,
    schedule.totalCurrentYear,
    schedule.totalVariance,
    `${((schedule.totalVariance / Math.abs(schedule.totalPriorYear)) * 100).toFixed(1)}%`,
    '',
  ];

  // Add footer rows
  const footerRows = [
    [''],
    ['Tickmarks:'],
    ['F - Footed', '', 'C - Cross-footed', '', 'T - Traced to source'],
    ['V - Vouched', '', 'R - Recalculated', '', '√ - No exceptions'],
    [''],
    config.includeSignatureLines ? ['________________________', '', '________________________'] : [],
    config.includeSignatureLines ? ['Preparer Signature', '', 'Reviewer Signature'] : [],
  ];

  // Combine all rows
  const allRows = [...headerRows, ...dataRows, totalRow, ...footerRows.filter(r => r.length > 0)];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(allRows);

  // Apply formatting
  applyBig4Header(ws, config, schedule.clientName, schedule.title, schedule.fiscalYearEnd);

  // Set merge ranges for header
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Firm name
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Client name
    { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }, // Schedule title
    { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } }, // Fiscal year
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Lead Schedule A');

  // Add tickmark legend sheet if requested
  if (config.includeTickmarks) {
    const tickmarkData = [
      ['Audit Tickmark Legend'],
      [''],
      ['Symbol', 'Meaning'],
      ...Object.entries(TICKMARKS).map(([symbol, meaning]) => [symbol, meaning]),
    ];
    const tickmarkWs = XLSX.utils.aoa_to_sheet(tickmarkData);
    XLSX.utils.book_append_sheet(wb, tickmarkWs, 'Tickmark Legend');
  }

  // Generate Excel file as blob
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Export extracted invoices to Excel
 */
export function exportInvoicesToExcel(
  invoices: ExtractedInvoice[],
  config: ExportConfig
): Blob {
  const wb = createFormattedWorkbook();
  const firmConfig = BIG4_HEADERS[config.headerFormat] || BIG4_HEADERS.custom;
  const firmName = config.firmName || firmConfig.firmName;

  // Invoice Summary Sheet
  const summaryHeaders = [
    [firmName],
    [''],
    ['Invoice Extraction Summary'],
    [`Generated: ${new Date().toLocaleString()}`],
    [''],
    ['Invoice #', 'Vendor', 'Invoice Date', 'Due Date', 'Subtotal', 'Tax', 'Total', 'PO #', 'Confidence'],
  ];

  const summaryData = invoices.map(inv => [
    inv.invoiceNumber,
    inv.vendorName,
    inv.invoiceDate.toLocaleDateString(),
    inv.dueDate?.toLocaleDateString() || 'N/A',
    inv.subtotal,
    inv.taxAmount,
    inv.totalAmount,
    inv.purchaseOrderNumber || '',
    `${inv.extractionConfidence}%`,
  ]);

  // Add totals
  const totalRow = [
    '',
    'TOTAL',
    '',
    '',
    invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
    invoices.reduce((sum, inv) => sum + inv.taxAmount, 0),
    invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    '',
    '',
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet([...summaryHeaders, ...summaryData, totalRow]);

  // Set column widths for summary
  summarySheet['!cols'] = [
    { wch: 18 }, // Invoice #
    { wch: 30 }, // Vendor
    { wch: 12 }, // Invoice Date
    { wch: 12 }, // Due Date
    { wch: 14 }, // Subtotal
    { wch: 12 }, // Tax
    { wch: 14 }, // Total
    { wch: 15 }, // PO #
    { wch: 12 }, // Confidence
  ];

  XLSX.utils.book_append_sheet(wb, summarySheet, 'Invoice Summary');

  // Invoice Line Items Sheet
  const lineItemHeaders = [
    [firmName],
    [''],
    ['Invoice Line Item Detail'],
    [''],
    ['Invoice #', 'Vendor', 'Line Description', 'GL Code', 'Qty', 'Unit Price', 'Amount', 'Tax Rate'],
  ];

  const lineItemData: any[][] = [];
  invoices.forEach(inv => {
    inv.lineItems.forEach(item => {
      lineItemData.push([
        inv.invoiceNumber,
        inv.vendorName,
        item.description,
        item.glAccountCode || '',
        item.quantity,
        item.unitPrice,
        item.amount,
        item.taxRate ? `${(item.taxRate * 100).toFixed(1)}%` : '',
      ]);
    });
  });

  const lineItemSheet = XLSX.utils.aoa_to_sheet([...lineItemHeaders, ...lineItemData]);

  // Set column widths for line items
  lineItemSheet['!cols'] = [
    { wch: 18 }, // Invoice #
    { wch: 25 }, // Vendor
    { wch: 35 }, // Description
    { wch: 12 }, // GL Code
    { wch: 8 },  // Qty
    { wch: 12 }, // Unit Price
    { wch: 14 }, // Amount
    { wch: 10 }, // Tax Rate
  ];

  XLSX.utils.book_append_sheet(wb, lineItemSheet, 'Line Items');

  // Generate Excel file as blob
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Download Excel file
 */
export function downloadExcel(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get available export format options
 */
export function getExportFormats(): Array<{ value: string; label: string }> {
  return [
    { value: 'deloitte', label: 'Deloitte Format' },
    { value: 'pwc', label: 'PwC Format' },
    { value: 'ey', label: 'EY Format' },
    { value: 'kpmg', label: 'KPMG Format' },
    { value: 'custom', label: 'Custom Format' },
  ];
}
