/**
 * Trial Balance (Mizan) Report Generator
 * Creates a full TB with all leads, mapping codes, and 3-period comparison
 */

import ExcelJS from 'exceljs';

// PwC Brand Colors
const PWC_COLORS = {
  orange: 'D04A02',
  black: '000000',
  white: 'FFFFFF',
  gray: '464646',
  lightGray: 'F2F2F2',
  darkGray: '333333',
  green: '2E7D32',
  red: 'C62828',
};

// TB Mapping Categories
const TB_MAPPING = {
  A: 'Assets',
  B: 'Liabilities',
  C: 'Equity',
  D: 'Revenue',
  E: 'Cost of Sales',
  F: 'Operating Expenses',
  G: 'Other Income/Expenses'
};

// Sample Chart of Accounts with all leads
const CHART_OF_ACCOUNTS = [
  // A - Assets
  { code: '1000', name: 'Cash and Cash Equivalents', mapping: 'A', subMapping: 'A1' },
  { code: '1010', name: 'Petty Cash', mapping: 'A', subMapping: 'A1' },
  { code: '1020', name: 'Bank - Current Account', mapping: 'A', subMapping: 'A1' },
  { code: '1030', name: 'Bank - Savings Account', mapping: 'A', subMapping: 'A1' },
  { code: '1100', name: 'Accounts Receivable', mapping: 'A', subMapping: 'A2' },
  { code: '1110', name: 'Allowance for Doubtful Accounts', mapping: 'A', subMapping: 'A2' },
  { code: '1200', name: 'Inventory - Raw Materials', mapping: 'A', subMapping: 'A3' },
  { code: '1210', name: 'Inventory - Work in Progress', mapping: 'A', subMapping: 'A3' },
  { code: '1220', name: 'Inventory - Finished Goods', mapping: 'A', subMapping: 'A3' },
  { code: '1300', name: 'Prepaid Expenses', mapping: 'A', subMapping: 'A4' },
  { code: '1310', name: 'Prepaid Insurance', mapping: 'A', subMapping: 'A4' },
  { code: '1320', name: 'Prepaid Rent', mapping: 'A', subMapping: 'A4' },
  { code: '1500', name: 'Property, Plant & Equipment', mapping: 'A', subMapping: 'A5' },
  { code: '1510', name: 'Land', mapping: 'A', subMapping: 'A5' },
  { code: '1520', name: 'Buildings', mapping: 'A', subMapping: 'A5' },
  { code: '1530', name: 'Machinery & Equipment', mapping: 'A', subMapping: 'A5' },
  { code: '1540', name: 'Vehicles', mapping: 'A', subMapping: 'A5' },
  { code: '1550', name: 'Furniture & Fixtures', mapping: 'A', subMapping: 'A5' },
  { code: '1560', name: 'Accumulated Depreciation', mapping: 'A', subMapping: 'A5' },
  { code: '1600', name: 'Intangible Assets', mapping: 'A', subMapping: 'A6' },
  { code: '1610', name: 'Goodwill', mapping: 'A', subMapping: 'A6' },
  { code: '1620', name: 'Patents & Trademarks', mapping: 'A', subMapping: 'A6' },

  // B - Liabilities
  { code: '2000', name: 'Accounts Payable', mapping: 'B', subMapping: 'B1' },
  { code: '2010', name: 'Accounts Payable - Trade', mapping: 'B', subMapping: 'B1' },
  { code: '2020', name: 'Accounts Payable - Other', mapping: 'B', subMapping: 'B1' },
  { code: '2100', name: 'Accrued Expenses', mapping: 'B', subMapping: 'B2' },
  { code: '2110', name: 'Accrued Salaries', mapping: 'B', subMapping: 'B2' },
  { code: '2120', name: 'Accrued Interest', mapping: 'B', subMapping: 'B2' },
  { code: '2130', name: 'Accrued Taxes', mapping: 'B', subMapping: 'B2' },
  { code: '2200', name: 'Short-term Loans', mapping: 'B', subMapping: 'B3' },
  { code: '2210', name: 'Bank Overdraft', mapping: 'B', subMapping: 'B3' },
  { code: '2300', name: 'VAT Payable', mapping: 'B', subMapping: 'B4' },
  { code: '2400', name: 'Long-term Loans', mapping: 'B', subMapping: 'B5' },
  { code: '2410', name: 'Bonds Payable', mapping: 'B', subMapping: 'B5' },
  { code: '2500', name: 'Deferred Tax Liability', mapping: 'B', subMapping: 'B6' },
  { code: '2600', name: 'Provisions', mapping: 'B', subMapping: 'B7' },
  { code: '2610', name: 'Provision for End of Service', mapping: 'B', subMapping: 'B7' },

  // C - Equity
  { code: '3000', name: 'Share Capital', mapping: 'C', subMapping: 'C1' },
  { code: '3010', name: 'Authorized Capital', mapping: 'C', subMapping: 'C1' },
  { code: '3020', name: 'Paid-in Capital', mapping: 'C', subMapping: 'C1' },
  { code: '3100', name: 'Share Premium', mapping: 'C', subMapping: 'C2' },
  { code: '3200', name: 'Retained Earnings', mapping: 'C', subMapping: 'C3' },
  { code: '3300', name: 'Statutory Reserve', mapping: 'C', subMapping: 'C4' },
  { code: '3400', name: 'Other Reserves', mapping: 'C', subMapping: 'C5' },
  { code: '3500', name: 'Treasury Shares', mapping: 'C', subMapping: 'C6' },
  { code: '3600', name: 'Current Year Profit/Loss', mapping: 'C', subMapping: 'C7' },

  // D - Revenue
  { code: '4000', name: 'Sales Revenue', mapping: 'D', subMapping: 'D1' },
  { code: '4010', name: 'Product Sales', mapping: 'D', subMapping: 'D1' },
  { code: '4020', name: 'Service Revenue', mapping: 'D', subMapping: 'D1' },
  { code: '4030', name: 'Sales Returns & Allowances', mapping: 'D', subMapping: 'D1' },
  { code: '4040', name: 'Sales Discounts', mapping: 'D', subMapping: 'D1' },
  { code: '4100', name: 'Contract Revenue', mapping: 'D', subMapping: 'D2' },
  { code: '4200', name: 'Rental Income', mapping: 'D', subMapping: 'D3' },
  { code: '4300', name: 'Commission Income', mapping: 'D', subMapping: 'D4' },

  // E - Cost of Sales
  { code: '5000', name: 'Cost of Goods Sold', mapping: 'E', subMapping: 'E1' },
  { code: '5010', name: 'Direct Materials', mapping: 'E', subMapping: 'E1' },
  { code: '5020', name: 'Direct Labor', mapping: 'E', subMapping: 'E1' },
  { code: '5030', name: 'Manufacturing Overhead', mapping: 'E', subMapping: 'E1' },
  { code: '5100', name: 'Cost of Services', mapping: 'E', subMapping: 'E2' },
  { code: '5200', name: 'Inventory Adjustments', mapping: 'E', subMapping: 'E3' },
  { code: '5300', name: 'Purchase Discounts', mapping: 'E', subMapping: 'E4' },

  // F - Operating Expenses
  { code: '6000', name: 'Salaries & Wages', mapping: 'F', subMapping: 'F1' },
  { code: '6010', name: 'Staff Salaries', mapping: 'F', subMapping: 'F1' },
  { code: '6020', name: 'Management Salaries', mapping: 'F', subMapping: 'F1' },
  { code: '6030', name: 'Employee Benefits', mapping: 'F', subMapping: 'F1' },
  { code: '6040', name: 'Social Insurance', mapping: 'F', subMapping: 'F1' },
  { code: '6100', name: 'Rent Expense', mapping: 'F', subMapping: 'F2' },
  { code: '6110', name: 'Office Rent', mapping: 'F', subMapping: 'F2' },
  { code: '6120', name: 'Warehouse Rent', mapping: 'F', subMapping: 'F2' },
  { code: '6200', name: 'Utilities', mapping: 'F', subMapping: 'F3' },
  { code: '6210', name: 'Electricity', mapping: 'F', subMapping: 'F3' },
  { code: '6220', name: 'Water', mapping: 'F', subMapping: 'F3' },
  { code: '6230', name: 'Telephone & Internet', mapping: 'F', subMapping: 'F3' },
  { code: '6300', name: 'Depreciation Expense', mapping: 'F', subMapping: 'F4' },
  { code: '6310', name: 'Depreciation - Buildings', mapping: 'F', subMapping: 'F4' },
  { code: '6320', name: 'Depreciation - Equipment', mapping: 'F', subMapping: 'F4' },
  { code: '6330', name: 'Depreciation - Vehicles', mapping: 'F', subMapping: 'F4' },
  { code: '6400', name: 'Insurance Expense', mapping: 'F', subMapping: 'F5' },
  { code: '6500', name: 'Professional Fees', mapping: 'F', subMapping: 'F6' },
  { code: '6510', name: 'Legal Fees', mapping: 'F', subMapping: 'F6' },
  { code: '6520', name: 'Audit Fees', mapping: 'F', subMapping: 'F6' },
  { code: '6530', name: 'Consulting Fees', mapping: 'F', subMapping: 'F6' },
  { code: '6600', name: 'Marketing & Advertising', mapping: 'F', subMapping: 'F7' },
  { code: '6700', name: 'Travel & Entertainment', mapping: 'F', subMapping: 'F8' },
  { code: '6800', name: 'Office Supplies', mapping: 'F', subMapping: 'F9' },
  { code: '6900', name: 'Repairs & Maintenance', mapping: 'F', subMapping: 'F10' },

  // G - Other Income/Expenses
  { code: '7000', name: 'Interest Income', mapping: 'G', subMapping: 'G1' },
  { code: '7100', name: 'Interest Expense', mapping: 'G', subMapping: 'G2' },
  { code: '7200', name: 'Foreign Exchange Gain/Loss', mapping: 'G', subMapping: 'G3' },
  { code: '7300', name: 'Gain on Sale of Assets', mapping: 'G', subMapping: 'G4' },
  { code: '7400', name: 'Loss on Sale of Assets', mapping: 'G', subMapping: 'G5' },
  { code: '7500', name: 'Dividend Income', mapping: 'G', subMapping: 'G6' },
  { code: '7600', name: 'Miscellaneous Income', mapping: 'G', subMapping: 'G7' },
  { code: '7700', name: 'Miscellaneous Expense', mapping: 'G', subMapping: 'G8' },
  { code: '8000', name: 'Income Tax Expense', mapping: 'G', subMapping: 'G9' },
  { code: '8100', name: 'Zakat Expense', mapping: 'G', subMapping: 'G10' },
];

// Generate random but realistic balances
function generateBalances(account) {
  const baseAmounts = {
    'A': { min: 50000, max: 5000000, debit: true },
    'B': { min: 30000, max: 3000000, debit: false },
    'C': { min: 100000, max: 10000000, debit: false },
    'D': { min: 200000, max: 8000000, debit: false },
    'E': { min: 100000, max: 4000000, debit: true },
    'F': { min: 10000, max: 500000, debit: true },
    'G': { min: 5000, max: 200000, debit: true },
  };

  const config = baseAmounts[account.mapping];
  const base = Math.random() * (config.max - config.min) + config.min;

  // Generate 3 periods with some variation
  const period1 = Math.round(base * (0.85 + Math.random() * 0.3));
  const period2 = Math.round(base * (0.9 + Math.random() * 0.2));
  const period3 = Math.round(base);

  if (config.debit) {
    return {
      period1: { debit: period1, credit: 0 },
      period2: { debit: period2, credit: 0 },
      period3: { debit: period3, credit: 0 },
    };
  } else {
    return {
      period1: { debit: 0, credit: period1 },
      period2: { debit: 0, credit: period2 },
      period3: { debit: 0, credit: period3 },
    };
  }
}

// Format number with commas
function formatNumber(num) {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format date as DD/MM/YYYY
function formatDate(date) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

async function generateTrialBalance() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Audit App';
  workbook.created = new Date();

  // ============ MAIN TB SHEET ============
  const ws = workbook.addWorksheet('Trial Balance - Mizan');

  // Company header
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'ACME CORPORATION LTD.';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: PWC_COLORS.orange } };
  titleCell.alignment = { horizontal: 'center' };

  ws.mergeCells('A2:L2');
  const subtitleCell = ws.getCell('A2');
  subtitleCell.value = 'TRIAL BALANCE (MIZAN) - THREE PERIOD COMPARISON';
  subtitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: PWC_COLORS.darkGray } };
  subtitleCell.alignment = { horizontal: 'center' };

  ws.mergeCells('A3:L3');
  const periodCell = ws.getCell('A3');
  periodCell.value = `As at 31/12/2024 | 31/12/2023 | 31/12/2022`;
  periodCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: PWC_COLORS.gray } };
  periodCell.alignment = { horizontal: 'center' };

  // Empty row
  ws.addRow([]);

  // Headers Row 1 - Period headers
  const headerRow1 = ws.addRow([
    '', '', '', '',
    'Period 3: 31/12/2024', '',
    'Period 2: 31/12/2023', '',
    'Period 1: 31/12/2022', '',
    '', ''
  ]);
  ws.mergeCells('E5:F5');
  ws.mergeCells('G5:H5');
  ws.mergeCells('I5:J5');

  headerRow1.eachCell((cell, colNumber) => {
    if (colNumber >= 5 && colNumber <= 10) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PWC_COLORS.darkGray } };
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: PWC_COLORS.white } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    }
  });

  // Headers Row 2 - Column headers
  const headers = [
    'Account Code',
    'Account Name',
    'TB Map',
    'Sub-Map',
    'Debit', 'Credit',
    'Debit', 'Credit',
    'Debit', 'Credit',
    'Movement',
    'Variance %'
  ];

  const headerRow2 = ws.addRow(headers);
  headerRow2.height = 25;
  headerRow2.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PWC_COLORS.orange } };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: PWC_COLORS.white } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: PWC_COLORS.black } },
      bottom: { style: 'thin', color: { argb: PWC_COLORS.black } },
      left: { style: 'thin', color: { argb: PWC_COLORS.black } },
      right: { style: 'thin', color: { argb: PWC_COLORS.black } }
    };
  });

  // Set column widths
  ws.getColumn(1).width = 14;  // Account Code
  ws.getColumn(2).width = 35;  // Account Name
  ws.getColumn(3).width = 10;  // TB Map
  ws.getColumn(4).width = 10;  // Sub-Map
  ws.getColumn(5).width = 16;  // P3 Debit
  ws.getColumn(6).width = 16;  // P3 Credit
  ws.getColumn(7).width = 16;  // P2 Debit
  ws.getColumn(8).width = 16;  // P2 Credit
  ws.getColumn(9).width = 16;  // P1 Debit
  ws.getColumn(10).width = 16; // P1 Credit
  ws.getColumn(11).width = 16; // Movement
  ws.getColumn(12).width = 12; // Variance %

  // Totals accumulators
  let totals = {
    p3Debit: 0, p3Credit: 0,
    p2Debit: 0, p2Credit: 0,
    p1Debit: 0, p1Credit: 0
  };

  // Add data rows grouped by mapping
  let currentMapping = '';
  let rowIndex = 0;

  for (const account of CHART_OF_ACCOUNTS) {
    // Add section header if new mapping category
    if (account.mapping !== currentMapping) {
      currentMapping = account.mapping;
      const sectionRow = ws.addRow([
        '', `${account.mapping} - ${TB_MAPPING[account.mapping]}`, '', '', '', '', '', '', '', '', '', ''
      ]);
      sectionRow.getCell(2).font = { name: 'Arial', size: 11, bold: true, color: { argb: PWC_COLORS.orange } };
      sectionRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3E0' } };
      ws.mergeCells(sectionRow.number, 2, sectionRow.number, 4);
    }

    const balances = generateBalances(account);

    // Calculate movement (P3 - P2)
    const p3Net = balances.period3.debit - balances.period3.credit;
    const p2Net = balances.period2.debit - balances.period2.credit;
    const movement = p3Net - p2Net;
    const variancePercent = p2Net !== 0 ? ((movement / Math.abs(p2Net)) * 100) : 0;

    // Accumulate totals
    totals.p3Debit += balances.period3.debit;
    totals.p3Credit += balances.period3.credit;
    totals.p2Debit += balances.period2.debit;
    totals.p2Credit += balances.period2.credit;
    totals.p1Debit += balances.period1.debit;
    totals.p1Credit += balances.period1.credit;

    const dataRow = ws.addRow([
      account.code,
      account.name,
      account.mapping,
      account.subMapping,
      balances.period3.debit || '',
      balances.period3.credit || '',
      balances.period2.debit || '',
      balances.period2.credit || '',
      balances.period1.debit || '',
      balances.period1.credit || '',
      movement,
      variancePercent
    ]);

    // Style data row
    const isAlternate = rowIndex % 2 === 1;
    dataRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isAlternate ? PWC_COLORS.lightGray : PWC_COLORS.white }
      };
      cell.font = { name: 'Arial', size: 9, color: { argb: PWC_COLORS.gray } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
        left: { style: 'thin', color: { argb: 'E0E0E0' } },
        right: { style: 'thin', color: { argb: 'E0E0E0' } }
      };

      // Number formatting
      if (colNumber >= 5 && colNumber <= 11) {
        cell.numFmt = '#,##0.00';
        cell.alignment = { horizontal: 'right' };
      }
      if (colNumber === 12) {
        cell.numFmt = '0.0%';
        cell.alignment = { horizontal: 'center' };
        // Color code variance
        if (variancePercent > 10) {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: PWC_COLORS.red } };
        } else if (variancePercent < -10) {
          cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: PWC_COLORS.green } };
        }
      }
    });

    rowIndex++;
  }

  // Add totals row
  ws.addRow([]); // Empty row
  const totalsRow = ws.addRow([
    '', 'TOTAL', '', '',
    totals.p3Debit,
    totals.p3Credit,
    totals.p2Debit,
    totals.p2Credit,
    totals.p1Debit,
    totals.p1Credit,
    totals.p3Debit - totals.p3Credit - (totals.p2Debit - totals.p2Credit),
    ''
  ]);

  totalsRow.eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PWC_COLORS.orange } };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: PWC_COLORS.white } };
    cell.border = {
      top: { style: 'double', color: { argb: PWC_COLORS.black } },
      bottom: { style: 'double', color: { argb: PWC_COLORS.black } }
    };
    if (colNumber >= 5 && colNumber <= 11) {
      cell.numFmt = '#,##0.00';
      cell.alignment = { horizontal: 'right' };
    }
  });

  // Add balance check row
  const checkRow = ws.addRow([
    '', 'Balance Check (Debit - Credit)', '', '',
    totals.p3Debit - totals.p3Credit,
    '',
    totals.p2Debit - totals.p2Credit,
    '',
    totals.p1Debit - totals.p1Credit,
    '', '', ''
  ]);
  checkRow.getCell(2).font = { name: 'Arial', size: 9, italic: true, color: { argb: PWC_COLORS.gray } };
  [5, 7, 9].forEach(col => {
    const cell = checkRow.getCell(col);
    cell.numFmt = '#,##0.00';
    const val = cell.value;
    if (Math.abs(val) < 1) {
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: PWC_COLORS.green } };
    } else {
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: PWC_COLORS.red } };
    }
  });

  // ============ TB MAPPING SUMMARY SHEET ============
  const summaryWs = workbook.addWorksheet('TB Mapping Summary');

  summaryWs.mergeCells('A1:F1');
  summaryWs.getCell('A1').value = 'TB MAPPING SUMMARY';
  summaryWs.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: PWC_COLORS.orange } };

  summaryWs.addRow([]);

  const summaryHeaders = ['Mapping', 'Description', 'Period 3 (2024)', 'Period 2 (2023)', 'Period 1 (2022)', 'YoY Change'];
  const summaryHeaderRow = summaryWs.addRow(summaryHeaders);
  summaryHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PWC_COLORS.orange } };
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: PWC_COLORS.white } };
    cell.alignment = { horizontal: 'center' };
  });

  // Calculate mapping totals
  const mappingTotals = {};
  for (const mapping of Object.keys(TB_MAPPING)) {
    mappingTotals[mapping] = { p1: 0, p2: 0, p3: 0 };
  }

  for (const account of CHART_OF_ACCOUNTS) {
    const balances = generateBalances(account);
    const sign = ['A', 'E', 'F', 'G'].includes(account.mapping) ? 1 : -1;
    mappingTotals[account.mapping].p1 += sign * (balances.period1.debit - balances.period1.credit);
    mappingTotals[account.mapping].p2 += sign * (balances.period2.debit - balances.period2.credit);
    mappingTotals[account.mapping].p3 += sign * (balances.period3.debit - balances.period3.credit);
  }

  for (const [mapping, desc] of Object.entries(TB_MAPPING)) {
    const t = mappingTotals[mapping];
    const yoyChange = t.p2 !== 0 ? ((t.p3 - t.p2) / Math.abs(t.p2)) : 0;
    const row = summaryWs.addRow([mapping, desc, t.p3, t.p2, t.p1, yoyChange]);
    row.getCell(3).numFmt = '#,##0.00';
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(5).numFmt = '#,##0.00';
    row.getCell(6).numFmt = '0.0%';
  }

  summaryWs.getColumn(1).width = 12;
  summaryWs.getColumn(2).width = 25;
  summaryWs.getColumn(3).width = 18;
  summaryWs.getColumn(4).width = 18;
  summaryWs.getColumn(5).width = 18;
  summaryWs.getColumn(6).width = 14;

  // Freeze panes
  ws.views = [{ state: 'frozen', ySplit: 6, xSplit: 2 }];

  // Save
  const filename = 'trial_balance_mizan.xlsx';
  await workbook.xlsx.writeFile(filename);
  console.log(`\nTrial Balance generated: ${filename}`);
  console.log(`- ${CHART_OF_ACCOUNTS.length} accounts`);
  console.log(`- 3 periods comparison`);
  console.log(`- TB Mapping A through G`);

  return filename;
}

// Run
generateTrialBalance().catch(console.error);
