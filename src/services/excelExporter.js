/**
 * Excel Exporter with PwC-Style Headers
 * Creates professionally formatted Excel files matching PwC audit standards
 */

import ExcelJS from 'exceljs';
import { formatDate } from '../utils/dateParser.js';

/**
 * PwC Brand Colors
 */
const PWC_COLORS = {
  orange: 'D04A02',        // PwC Primary Orange
  darkOrange: 'B8380F',    // Darker orange for alternating
  black: '000000',         // PwC Black
  white: 'FFFFFF',         // White
  gray: '464646',          // Dark gray for text
  lightGray: 'F2F2F2',     // Light gray for alternating rows
  headerBg: 'D04A02',      // Header background (PwC Orange)
  subHeaderBg: '464646',   // Sub-header background
};

/**
 * PwC-style header mappings for audit fields
 * Maps internal field names to PwC-standard column headers
 */
const PWC_HEADER_MAPPINGS = {
  // Document identification
  documentId: 'Document ID',
  documentName: 'Document Name',
  referenceNumber: 'Reference No.',

  // Dates - PwC format
  invoiceDate: 'Invoice Date',
  dueDate: 'Due Date',
  transactionDate: 'Transaction Date',
  periodEnd: 'Period End Date',
  extractedAt: 'Extraction Date',
  reviewedAt: 'Review Date',

  // Financial
  amount: 'Amount',
  amount_0: 'Amount',
  amount_1: 'Amount (2)',
  amount_2: 'Amount (3)',
  currency: 'Currency',

  // Vendor/Party
  vendorName: 'Vendor/Supplier Name',
  vendorId: 'Vendor ID',
  customerName: 'Customer Name',
  customerId: 'Customer ID',

  // Status
  status: 'Status',
  confidence: 'AI Confidence',
  reviewed: 'Reviewed',
  corrected: 'Corrected',

  // Audit trail
  createdBy: 'Created By',
  reviewedBy: 'Reviewed By',
  approvedBy: 'Approved By',
  notes: 'Notes/Comments',

  // Default confidence columns
  invoiceDate_confidence: 'Invoice Date Confidence',
  dueDate_confidence: 'Due Date Confidence',
  amount_confidence: 'Amount Confidence',
  vendorName_confidence: 'Vendor Name Confidence',
  referenceNumber_confidence: 'Reference No. Confidence',

  // Corrected flags
  invoiceDate_corrected: 'Invoice Date Corrected',
  dueDate_corrected: 'Due Date Corrected',
  amount_corrected: 'Amount Corrected',
  vendorName_corrected: 'Vendor Name Corrected',
};

/**
 * Get PwC-style header for a field
 */
function getPwCHeader(fieldName) {
  return PWC_HEADER_MAPPINGS[fieldName] || formatFieldName(fieldName);
}

/**
 * Format a camelCase field name to Title Case
 */
function formatFieldName(fieldName) {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Excel Exporter Class
 */
export class ExcelExporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.workbook.creator = 'Audit App';
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
  }

  /**
   * Apply PwC-style header formatting
   */
  applyPwCHeaderStyle(row) {
    row.height = 28;
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: PWC_COLORS.headerBg }
      };
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: PWC_COLORS.white }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: PWC_COLORS.black } },
        bottom: { style: 'thin', color: { argb: PWC_COLORS.black } },
        left: { style: 'thin', color: { argb: PWC_COLORS.black } },
        right: { style: 'thin', color: { argb: PWC_COLORS.black } }
      };
    });
  }

  /**
   * Apply PwC-style data row formatting
   */
  applyPwCDataStyle(row, isAlternate = false) {
    row.height = 20;
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isAlternate ? PWC_COLORS.lightGray : PWC_COLORS.white }
      };
      cell.font = {
        name: 'Arial',
        size: 10,
        color: { argb: PWC_COLORS.gray }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
    });
  }

  /**
   * Create PwC-style title section
   */
  addPwCTitleSection(worksheet, title, subtitle = '') {
    // Title row
    const titleRow = worksheet.addRow([title]);
    titleRow.height = 35;
    const titleCell = titleRow.getCell(1);
    titleCell.font = {
      name: 'Arial',
      size: 18,
      bold: true,
      color: { argb: PWC_COLORS.orange }
    };

    // Subtitle row
    if (subtitle) {
      const subtitleRow = worksheet.addRow([subtitle]);
      subtitleRow.height = 20;
      const subtitleCell = subtitleRow.getCell(1);
      subtitleCell.font = {
        name: 'Arial',
        size: 11,
        color: { argb: PWC_COLORS.gray }
      };
    }

    // Generated date
    const dateRow = worksheet.addRow([`Generated: ${formatDate(new Date(), 'DD/MM/YYYY')}`]);
    dateRow.height = 18;
    const dateCell = dateRow.getCell(1);
    dateCell.font = {
      name: 'Arial',
      size: 9,
      italic: true,
      color: { argb: PWC_COLORS.gray }
    };

    // Empty row for spacing
    worksheet.addRow([]);
  }

  /**
   * Export extraction results to PwC-style Excel
   */
  async exportExtractions(extractions, filename = 'audit_extractions.xlsx', options = {}) {
    const {
      includeConfidence = true,
      includeCorrected = true,
      sheetName = 'Audit Data',
      title = 'Audit Extraction Report',
      subtitle = ''
    } = options;

    const worksheet = this.workbook.addWorksheet(sheetName);

    // Add title section
    this.addPwCTitleSection(worksheet, title, subtitle);

    // Determine columns from data
    const columns = this.buildColumnDefinitions(extractions, includeConfidence, includeCorrected);

    // Add headers with PwC styling
    const headerRow = worksheet.addRow(columns.map(col => col.header));
    this.applyPwCHeaderStyle(headerRow);

    // Set column widths
    columns.forEach((col, index) => {
      worksheet.getColumn(index + 1).width = col.width || 15;
    });

    // Add data rows
    extractions.forEach((extraction, index) => {
      const rowData = this.buildRowData(extraction, columns);
      const dataRow = worksheet.addRow(rowData);
      this.applyPwCDataStyle(dataRow, index % 2 === 1);

      // Apply number formatting to amount columns
      columns.forEach((col, colIndex) => {
        if (col.key.includes('amount') && !col.key.includes('confidence') && !col.key.includes('corrected')) {
          const cell = dataRow.getCell(colIndex + 1);
          cell.numFmt = '#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }
        // Apply percentage formatting to confidence columns
        if (col.key.includes('confidence')) {
          const cell = dataRow.getCell(colIndex + 1);
          cell.numFmt = '0%';
          cell.alignment = { horizontal: 'center' };
        }
      });
    });

    // Add summary section
    this.addSummarySection(worksheet, extractions, columns.length);

    // Auto-filter
    const headerRowNum = 5; // After title section
    worksheet.autoFilter = {
      from: { row: headerRowNum, column: 1 },
      to: { row: headerRowNum, column: columns.length }
    };

    // Freeze header row
    worksheet.views = [{ state: 'frozen', ySplit: headerRowNum }];

    // Save workbook
    await this.workbook.xlsx.writeFile(filename);
    return filename;
  }

  /**
   * Build column definitions from extraction data
   */
  buildColumnDefinitions(extractions, includeConfidence, includeCorrected) {
    const columns = [
      { key: 'documentId', header: getPwCHeader('documentId'), width: 15 },
      { key: 'documentName', header: getPwCHeader('documentName'), width: 25 },
    ];

    // Collect all unique field names from extractions
    const fieldNames = new Set();
    for (const extraction of extractions) {
      const exportData = extraction.toExportData();
      for (const key of Object.keys(exportData)) {
        if (!key.startsWith('document') && !key.endsWith('_confidence') && !key.endsWith('_corrected')) {
          if (key !== 'status' && key !== 'extractedAt' && key !== 'reviewedAt') {
            fieldNames.add(key);
          }
        }
      }
    }

    // Add data columns
    for (const fieldName of fieldNames) {
      columns.push({
        key: fieldName,
        header: getPwCHeader(fieldName),
        width: fieldName.includes('Date') ? 15 : (fieldName.includes('Name') ? 25 : 18)
      });

      if (includeConfidence) {
        columns.push({
          key: `${fieldName}_confidence`,
          header: getPwCHeader(`${fieldName}_confidence`) || `${getPwCHeader(fieldName)} Confidence`,
          width: 12
        });
      }

      if (includeCorrected) {
        columns.push({
          key: `${fieldName}_corrected`,
          header: getPwCHeader(`${fieldName}_corrected`) || `${getPwCHeader(fieldName)} Corrected`,
          width: 12
        });
      }
    }

    // Add status columns
    columns.push(
      { key: 'status', header: getPwCHeader('status'), width: 12 },
      { key: 'extractedAt', header: getPwCHeader('extractedAt'), width: 15 },
      { key: 'reviewedAt', header: getPwCHeader('reviewedAt'), width: 15 }
    );

    return columns;
  }

  /**
   * Build row data from extraction
   */
  buildRowData(extraction, columns) {
    const exportData = extraction.toExportData();
    return columns.map(col => {
      const value = exportData[col.key];
      if (value instanceof Date) {
        return formatDate(value, 'DD/MM/YYYY');
      }
      if (col.key.includes('confidence') && typeof value === 'number') {
        return value;
      }
      if (col.key.includes('corrected') && typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return value ?? '';
    });
  }

  /**
   * Add summary section at the bottom
   */
  addSummarySection(worksheet, extractions, columnCount) {
    // Add empty rows for spacing
    worksheet.addRow([]);
    worksheet.addRow([]);

    // Summary header
    const summaryHeaderRow = worksheet.addRow(['Summary']);
    summaryHeaderRow.getCell(1).font = {
      name: 'Arial',
      size: 12,
      bold: true,
      color: { argb: PWC_COLORS.orange }
    };

    // Calculate summary stats
    let totalCorrected = 0;
    let totalFields = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const extraction of extractions) {
      const fields = extraction.getAllFields();
      totalFields += fields.length;
      for (const field of fields) {
        if (field.corrected) totalCorrected++;
        totalConfidence += field.confidence;
        confidenceCount++;
      }
    }

    const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount * 100).toFixed(1) : 0;

    // Summary data
    const summaryData = [
      ['Total Documents:', extractions.length],
      ['Total Fields Extracted:', totalFields],
      ['Fields Corrected:', totalCorrected],
      ['Average Confidence:', `${avgConfidence}%`],
      ['Report Generated:', formatDate(new Date(), 'DD/MM/YYYY')]
    ];

    for (const [label, value] of summaryData) {
      const row = worksheet.addRow([label, value]);
      row.getCell(1).font = { name: 'Arial', size: 10, bold: true, color: { argb: PWC_COLORS.gray } };
      row.getCell(2).font = { name: 'Arial', size: 10, color: { argb: PWC_COLORS.gray } };
    }
  }

  /**
   * Create audit trail worksheet
   */
  addAuditTrailSheet(extractions) {
    const worksheet = this.workbook.addWorksheet('Audit Trail');

    this.addPwCTitleSection(worksheet, 'Audit Trail', 'Document extraction and review history');

    const headers = ['Document', 'Field', 'Original Value', 'Current Value', 'Corrected', 'Confidence', 'Reviewed By', 'Review Date', 'Notes'];
    const headerRow = worksheet.addRow(headers);
    this.applyPwCHeaderStyle(headerRow);

    // Set column widths
    [20, 18, 20, 20, 10, 12, 15, 15, 30].forEach((width, i) => {
      worksheet.getColumn(i + 1).width = width;
    });

    let rowIndex = 0;
    for (const extraction of extractions) {
      for (const field of extraction.getAllFields()) {
        const dataRow = worksheet.addRow([
          extraction.documentName,
          field.name,
          field.originalValue,
          field.currentValue,
          field.corrected ? 'Yes' : 'No',
          `${(field.confidence * 100).toFixed(0)}%`,
          field.reviewedBy || '-',
          field.reviewedAt ? formatDate(field.reviewedAt, 'DD/MM/YYYY') : '-',
          field.reviewNotes || ''
        ]);
        this.applyPwCDataStyle(dataRow, rowIndex % 2 === 1);
        rowIndex++;
      }
    }

    return worksheet;
  }
}

/**
 * Quick export function
 */
export async function exportToPwCExcel(extractions, filename, options = {}) {
  const exporter = new ExcelExporter();
  await exporter.exportExtractions(extractions, filename, options);

  if (options.includeAuditTrail) {
    exporter.addAuditTrailSheet(extractions);
    await exporter.workbook.xlsx.writeFile(filename);
  }

  return filename;
}

export default ExcelExporter;
