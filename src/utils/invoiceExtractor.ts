import { ExtractedInvoice, InvoiceLineItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI-powered Invoice Data Extraction Utility
 *
 * This module provides intelligent extraction of invoice data from documents.
 * In production, this would integrate with OCR services (e.g., Azure Form Recognizer,
 * AWS Textract, Google Document AI) or LLM-based extraction.
 *
 * For demonstration, it includes pattern matching and simulation capabilities.
 */

// Common invoice patterns for extraction
const INVOICE_PATTERNS = {
  invoiceNumber: [
    /invoice\s*(?:#|no\.?|number)?\s*[:.]?\s*([A-Z0-9-]+)/i,
    /inv\s*(?:#|no\.?)?\s*[:.]?\s*([A-Z0-9-]+)/i,
    /(?:bill|reference)\s*(?:#|no\.?)?\s*[:.]?\s*([A-Z0-9-]+)/i,
  ],
  date: [
    /(?:invoice\s*)?date\s*[:.]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
  ],
  amount: [
    /(?:total|amount\s*due|balance\s*due)\s*[:.]?\s*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})/,
    /(?:grand\s*total|subtotal)\s*[:.]?\s*\$?\s*([\d,]+\.?\d*)/i,
  ],
  vendor: [
    /(?:from|vendor|supplier|bill\s*from)\s*[:.]?\s*([A-Za-z0-9\s&.,'-]+?)(?:\n|$)/i,
  ],
  poNumber: [
    /(?:p\.?o\.?|purchase\s*order)\s*(?:#|no\.?)?\s*[:.]?\s*([A-Z0-9-]+)/i,
  ],
};

// Sample vendor names for demonstration
const SAMPLE_VENDORS = [
  'Office Supplies Co.',
  'Tech Solutions Inc.',
  'Industrial Parts Ltd.',
  'Professional Services LLC',
  'Consulting Group International',
  'Global Logistics Corp.',
  'Premium Materials Inc.',
];

// Sample line item descriptions
const SAMPLE_LINE_ITEMS = [
  { description: 'Office supplies and stationery', glCode: '6200-100' },
  { description: 'IT equipment maintenance', glCode: '6300-200' },
  { description: 'Professional consulting services', glCode: '6400-300' },
  { description: 'Software licenses (annual)', glCode: '6500-400' },
  { description: 'Equipment rental', glCode: '6600-500' },
  { description: 'Shipping and handling', glCode: '6700-600' },
  { description: 'Travel and accommodation', glCode: '6800-700' },
];

/**
 * Parse a date string into a Date object
 */
function parseDate(dateStr: string): Date {
  // Handle various date formats
  const cleaned = dateStr.replace(/[\/\-\.]/g, '/');
  const parsed = new Date(cleaned);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Parse a currency amount string into a number
 */
function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[$,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Extract invoice data from text content using pattern matching
 */
export function extractFromText(text: string, documentId: string): ExtractedInvoice {
  let invoiceNumber = '';
  let invoiceDate = new Date();
  let totalAmount = 0;
  let vendorName = '';
  let poNumber = '';

  // Extract invoice number
  for (const pattern of INVOICE_PATTERNS.invoiceNumber) {
    const match = text.match(pattern);
    if (match) {
      invoiceNumber = match[1].trim();
      break;
    }
  }

  // Extract date
  for (const pattern of INVOICE_PATTERNS.date) {
    const match = text.match(pattern);
    if (match) {
      invoiceDate = parseDate(match[1] || match[0]);
      break;
    }
  }

  // Extract total amount
  for (const pattern of INVOICE_PATTERNS.amount) {
    const match = text.match(pattern);
    if (match) {
      totalAmount = parseAmount(match[1]);
      break;
    }
  }

  // Extract vendor name
  for (const pattern of INVOICE_PATTERNS.vendor) {
    const match = text.match(pattern);
    if (match) {
      vendorName = match[1].trim();
      break;
    }
  }

  // Extract PO number
  for (const pattern of INVOICE_PATTERNS.poNumber) {
    const match = text.match(pattern);
    if (match) {
      poNumber = match[1].trim();
      break;
    }
  }

  // Calculate tax (assume standard rate if not found)
  const taxRate = 0.08;
  const subtotal = totalAmount / (1 + taxRate);
  const taxAmount = totalAmount - subtotal;

  // Generate sample line items based on total
  const lineItems = generateLineItems(subtotal, 3);

  return {
    id: uuidv4(),
    documentId,
    vendorName: vendorName || 'Unknown Vendor',
    invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
    invoiceDate,
    dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    currency: 'USD',
    paymentTerms: 'Net 30',
    purchaseOrderNumber: poNumber || undefined,
    extractionConfidence: calculateConfidence(invoiceNumber, vendorName, totalAmount),
    extractedAt: new Date(),
  };
}

/**
 * Generate sample line items for demonstration
 */
function generateLineItems(subtotal: number, count: number): InvoiceLineItem[] {
  const items: InvoiceLineItem[] = [];
  let remainingAmount = subtotal;

  for (let i = 0; i < count; i++) {
    const sample = SAMPLE_LINE_ITEMS[Math.floor(Math.random() * SAMPLE_LINE_ITEMS.length)];
    const isLast = i === count - 1;
    const amount = isLast
      ? remainingAmount
      : Math.round((remainingAmount * (0.2 + Math.random() * 0.4)) * 100) / 100;

    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = Math.round((amount / quantity) * 100) / 100;

    items.push({
      id: uuidv4(),
      description: sample.description,
      quantity,
      unitPrice,
      amount: Math.round(amount * 100) / 100,
      glAccountCode: sample.glCode,
      taxRate: 0.08,
    });

    remainingAmount -= amount;
  }

  return items;
}

/**
 * Calculate extraction confidence score (0-100)
 */
function calculateConfidence(invoiceNumber: string, vendorName: string, totalAmount: number): number {
  let score = 50; // Base score

  if (invoiceNumber && invoiceNumber !== `INV-${Date.now()}`) score += 20;
  if (vendorName && vendorName !== 'Unknown Vendor') score += 15;
  if (totalAmount > 0) score += 15;

  return Math.min(score, 100);
}

/**
 * Simulate AI extraction with realistic delay and sample data
 * This mimics the behavior of calling an external AI/OCR service
 */
export async function simulateAIExtraction(
  documentId: string,
  fileName: string
): Promise<ExtractedInvoice> {
  // Simulate API processing time
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Generate realistic sample data
  const vendor = SAMPLE_VENDORS[Math.floor(Math.random() * SAMPLE_VENDORS.length)];
  const invoiceDate = new Date(
    Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
  );
  const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const subtotal = Math.round((1000 + Math.random() * 9000) * 100) / 100;
  const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const lineItems = generateLineItems(subtotal, Math.floor(Math.random() * 4) + 2);

  return {
    id: uuidv4(),
    documentId,
    vendorName: vendor,
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    invoiceDate,
    dueDate,
    lineItems,
    subtotal,
    taxAmount,
    totalAmount,
    currency: 'USD',
    paymentTerms: 'Net 30',
    purchaseOrderNumber: Math.random() > 0.5 ? `PO-${Math.floor(Math.random() * 100000)}` : undefined,
    extractionConfidence: 75 + Math.floor(Math.random() * 20),
    extractedAt: new Date(),
  };
}

/**
 * Batch extract invoices from multiple documents
 */
export async function batchExtract(
  documents: Array<{ id: string; fileName: string; content?: string }>
): Promise<ExtractedInvoice[]> {
  const results: ExtractedInvoice[] = [];

  for (const doc of documents) {
    try {
      const invoice = doc.content
        ? extractFromText(doc.content, doc.id)
        : await simulateAIExtraction(doc.id, doc.fileName);
      results.push(invoice);
    } catch (error) {
      console.error(`Failed to extract invoice from ${doc.fileName}:`, error);
    }
  }

  return results;
}

/**
 * Validate extracted invoice data
 */
export function validateInvoice(invoice: ExtractedInvoice): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!invoice.vendorName || invoice.vendorName === 'Unknown Vendor') {
    errors.push('Vendor name is missing or could not be extracted');
  }

  if (!invoice.invoiceNumber) {
    errors.push('Invoice number is required');
  }

  if (invoice.totalAmount <= 0) {
    errors.push('Invoice total must be greater than zero');
  }

  // Line item validation
  const lineItemTotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  if (Math.abs(lineItemTotal - invoice.subtotal) > 0.01) {
    warnings.push('Line item total does not match subtotal');
  }

  // Confidence warning
  if (invoice.extractionConfidence < 70) {
    warnings.push('Low extraction confidence - manual review recommended');
  }

  // Date validation
  if (invoice.invoiceDate > new Date()) {
    warnings.push('Invoice date is in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
