import { LeadSchedule, LeadScheduleEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Lead Schedule Generator for Audit Workpapers
 *
 * Lead schedules (Lead A, B, C, etc.) are the primary summaries in audit workpapers.
 * Lead A typically represents assets/cash equivalents.
 *
 * This follows Big 4 audit firm standards for schedule formatting.
 */

// Standard Chart of Accounts for Lead A (Assets)
const LEAD_A_ACCOUNTS = [
  { code: '1010', description: 'Cash - Operating Account' },
  { code: '1020', description: 'Cash - Payroll Account' },
  { code: '1030', description: 'Cash - Money Market' },
  { code: '1040', description: 'Petty Cash' },
  { code: '1100', description: 'Short-term Investments' },
  { code: '1110', description: 'Marketable Securities' },
  { code: '1200', description: 'Accounts Receivable - Trade' },
  { code: '1210', description: 'Accounts Receivable - Other' },
  { code: '1220', description: 'Allowance for Doubtful Accounts' },
  { code: '1300', description: 'Inventory - Raw Materials' },
  { code: '1310', description: 'Inventory - Work in Process' },
  { code: '1320', description: 'Inventory - Finished Goods' },
  { code: '1400', description: 'Prepaid Expenses' },
  { code: '1410', description: 'Prepaid Insurance' },
  { code: '1420', description: 'Prepaid Rent' },
  { code: '1500', description: 'Property, Plant & Equipment' },
  { code: '1510', description: 'Accumulated Depreciation - PP&E' },
  { code: '1600', description: 'Intangible Assets' },
  { code: '1610', description: 'Accumulated Amortization' },
  { code: '1700', description: 'Other Assets' },
];

/**
 * Generate realistic sample balance data
 */
function generateSampleBalance(
  accountCode: string,
  baseAmount: number
): { priorYear: number; currentYear: number } {
  // Simulate year-over-year changes
  const changePercent = (Math.random() - 0.5) * 0.3; // -15% to +15% change
  const priorYear = Math.round(baseAmount * (0.8 + Math.random() * 0.4) * 100) / 100;
  const currentYear = Math.round(priorYear * (1 + changePercent) * 100) / 100;

  // Handle contra accounts (negative balances)
  if (accountCode.includes('122') || accountCode.includes('151') || accountCode.includes('161')) {
    return {
      priorYear: -Math.abs(priorYear),
      currentYear: -Math.abs(currentYear),
    };
  }

  return { priorYear, currentYear };
}

/**
 * Generate a sample Lead A (Assets) schedule
 */
export function generateLeadASchedule(
  clientName: string,
  fiscalYearEnd: Date,
  preparedBy: string
): LeadSchedule {
  const entries: LeadScheduleEntry[] = [];
  let refCounter = 1;

  // Generate entries for each account
  for (const account of LEAD_A_ACCOUNTS) {
    // Base amounts vary by account type
    let baseAmount = 50000;
    if (account.code.startsWith('10')) baseAmount = 500000; // Cash accounts
    if (account.code.startsWith('12')) baseAmount = 750000; // Receivables
    if (account.code.startsWith('13')) baseAmount = 400000; // Inventory
    if (account.code.startsWith('15')) baseAmount = 2000000; // PP&E
    if (account.code.startsWith('16')) baseAmount = 300000; // Intangibles

    const balances = generateSampleBalance(account.code, baseAmount);
    const variance = balances.currentYear - balances.priorYear;
    const variancePercentage =
      balances.priorYear !== 0
        ? Math.round((variance / Math.abs(balances.priorYear)) * 10000) / 100
        : 0;

    entries.push({
      id: uuidv4(),
      referenceNumber: `A-${String(refCounter).padStart(3, '0')}`,
      accountCode: account.code,
      accountDescription: account.description,
      priorYearBalance: balances.priorYear,
      currentYearBalance: balances.currentYear,
      variance,
      variancePercentage,
      workpaperReference: `WP-A${refCounter}`,
      notes: Math.random() > 0.7 ? 'Tested - No exceptions noted' : undefined,
    });

    refCounter++;
  }

  // Calculate totals
  const totalPriorYear = entries.reduce((sum, e) => sum + e.priorYearBalance, 0);
  const totalCurrentYear = entries.reduce((sum, e) => sum + e.currentYearBalance, 0);
  const totalVariance = totalCurrentYear - totalPriorYear;

  return {
    id: uuidv4(),
    scheduleType: 'A',
    title: 'Lead Schedule A - Assets',
    clientName,
    fiscalYearEnd,
    preparedBy,
    preparedDate: new Date(),
    entries,
    totalPriorYear: Math.round(totalPriorYear * 100) / 100,
    totalCurrentYear: Math.round(totalCurrentYear * 100) / 100,
    totalVariance: Math.round(totalVariance * 100) / 100,
  };
}

/**
 * Generate Lead schedules for all schedule types
 */
export const SCHEDULE_TYPES = {
  A: { title: 'Assets', description: 'Cash, Receivables, Inventory, PP&E' },
  B: { title: 'Liabilities', description: 'Payables, Accrued Expenses, Debt' },
  C: { title: 'Equity', description: 'Common Stock, Retained Earnings' },
  D: { title: 'Revenue', description: 'Sales, Service Revenue, Other Income' },
  E: { title: 'Cost of Sales', description: 'COGS, Direct Costs' },
  F: { title: 'Operating Expenses', description: 'SG&A, R&D, Other Expenses' },
};

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return amount < 0 ? `(${formatted})` : formatted;
}

/**
 * Format variance percentage
 */
export function formatVariance(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
}

/**
 * Get variance status for styling
 */
export function getVarianceStatus(percentage: number): 'normal' | 'warning' | 'critical' {
  const absPercentage = Math.abs(percentage);
  if (absPercentage > 25) return 'critical';
  if (absPercentage > 10) return 'warning';
  return 'normal';
}
