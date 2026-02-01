#!/usr/bin/env node

/**
 * Audit App - Main Entry Point
 *
 * Features:
 * - Date parsing with DD/MM/YYYY format support
 * - AI extraction with review mode for corrections
 * - PwC-style Excel export
 */

import { parseDate, formatDate, extractDates } from './utils/dateParser.js';
import { AIExtractor, ExtractionStatus, generateReviewReport } from './services/aiExtractor.js';
import { ExcelExporter, exportToPwCExcel } from './services/excelExporter.js';

// Try to import readline-sync for interactive mode
let readlineSync;
try {
  readlineSync = await import('readline-sync');
  readlineSync = readlineSync.default;
} catch {
  readlineSync = null;
}

/**
 * Sample documents for demonstration
 */
const SAMPLE_DOCUMENTS = [
  {
    id: 'DOC001',
    name: 'Invoice_2024_001.pdf',
    content: `
      Invoice Date: 15/03/2024
      Due Date: 15/04/2024
      Reference No: INV-2024-001
      Vendor: Acme Corporation Ltd
      Amount: $12,500.00
      Transaction Date: 14/03/2024
    `
  },
  {
    id: 'DOC002',
    name: 'Invoice_2024_002.pdf',
    content: `
      Invoice Date: 22/03/2024
      Due Date: 22/04/2024
      Reference No: INV-2024-002
      Vendor: Global Services Inc
      Amount: $8,750.50
      Period Ending: 31/03/2024
    `
  },
  {
    id: 'DOC003',
    name: 'Payment_Receipt.pdf',
    content: `
      Transaction Date: 01/04/2024
      Reference: PAY-2024-0045
      From: Tech Solutions Ltd
      Amount: 5000.00
      Invoice Date: 25/03/2024
    `
  }
];

/**
 * Display banner
 */
function displayBanner() {
  console.log('');
  console.log('========================================');
  console.log('       AUDIT EXTRACTION APP');
  console.log('========================================');
  console.log('');
}

/**
 * Display help
 */
function displayHelp() {
  console.log('Usage: npm run <command>');
  console.log('');
  console.log('Commands:');
  console.log('  start    - Run full extraction, review, and export pipeline');
  console.log('  extract  - Extract data from documents');
  console.log('  review   - Review and correct AI extractions');
  console.log('  export   - Export to PwC-style Excel');
  console.log('');
  console.log('Features:');
  console.log('  - Date parsing supports DD/MM/YYYY format (European/UK)');
  console.log('  - Review mode allows correction of AI extractions');
  console.log('  - Excel export uses PwC professional styling');
  console.log('');
}

/**
 * Demo: Date Parsing
 */
function demoDateParsing() {
  console.log('\n--- DATE PARSING DEMO ---\n');

  const testDates = [
    '15/03/2024',      // DD/MM/YYYY (European)
    '03/15/2024',      // MM/DD/YYYY (US) - will be parsed as DD/MM
    '2024-03-15',      // ISO format
    '15 March 2024',   // Written format
    '15-03-2024',      // DD-MM-YYYY
    '15.03.2024',      // DD.MM.YYYY
  ];

  console.log('Date parsing with DD/MM/YYYY priority:\n');

  for (const dateStr of testDates) {
    const result = parseDate(dateStr);
    console.log(`  Input: "${dateStr}"`);
    if (result.date) {
      console.log(`    Parsed: ${result.formatted} (format: ${result.format})`);
      console.log(`    ISO: ${result.iso}`);
    } else {
      console.log(`    Error: ${result.error}`);
    }
    if (result.warning) {
      console.log(`    Warning: ${result.warning}`);
    }
    console.log('');
  }
}

/**
 * Demo: AI Extraction
 */
async function demoExtraction(extractor) {
  console.log('\n--- AI EXTRACTION DEMO ---\n');

  for (const doc of SAMPLE_DOCUMENTS) {
    console.log(`Extracting from: ${doc.name}`);
    const result = await extractor.extractFromDocument(doc.id, doc.name, doc.content);

    const summary = result.getSummary();
    console.log(`  - Extracted ${summary.totalFields} fields`);
    console.log(`  - Fields needing review: ${summary.fieldsNeedingReview}`);
    console.log(`  - Average confidence: ${(summary.averageConfidence * 100).toFixed(0)}%`);
    console.log('');
  }

  return extractor.getAllExtractions();
}

/**
 * Demo: Review Mode
 */
async function demoReviewMode(extractor) {
  console.log('\n--- REVIEW MODE DEMO ---\n');

  const needsReview = extractor.getExtractionsNeedingReview();

  if (needsReview.length === 0) {
    console.log('No extractions need review (all high confidence).');

    // Auto-approve all
    for (const extraction of extractor.getAllExtractions()) {
      extraction.approveAll('auto-reviewer');
    }
    console.log('All extractions auto-approved.\n');
    return;
  }

  if (readlineSync) {
    console.log(`${needsReview.length} document(s) have fields needing review.\n`);
    const startReview = readlineSync.question('Start review session? (y/n): ');

    if (startReview.toLowerCase() === 'y') {
      await extractor.startReviewSession(readlineSync);
    } else {
      // Auto-approve
      for (const extraction of extractor.getAllExtractions()) {
        extraction.approveAll('auto-reviewer');
      }
      console.log('Extractions auto-approved.\n');
    }
  } else {
    console.log('Interactive mode not available. Auto-approving extractions.\n');
    for (const extraction of extractor.getAllExtractions()) {
      extraction.approveAll('auto-reviewer');
    }
  }

  // Generate review report
  const report = generateReviewReport(extractor.getAllExtractions());
  console.log('\nReview Summary:');
  console.log(`  - Total documents: ${report.totalDocuments}`);
  console.log(`  - Reviewed: ${report.reviewed}`);
  console.log(`  - Corrections made: ${report.correctionsMade}`);
  console.log('');
}

/**
 * Demo: Excel Export
 */
async function demoExcelExport(extractions) {
  console.log('\n--- PWC-STYLE EXCEL EXPORT ---\n');

  const filename = 'audit_report.xlsx';

  try {
    await exportToPwCExcel(extractions, filename, {
      title: 'Audit Extraction Report',
      subtitle: 'AI-Assisted Document Analysis',
      includeConfidence: true,
      includeCorrected: true,
      includeAuditTrail: true
    });

    console.log(`Excel report generated: ${filename}`);
    console.log('');
    console.log('PwC-style features applied:');
    console.log('  - Orange header background (#D04A02)');
    console.log('  - White bold header text');
    console.log('  - Alternating row colors');
    console.log('  - Professional column headers');
    console.log('  - DD/MM/YYYY date format');
    console.log('  - Audit trail worksheet');
    console.log('  - Summary section');
    console.log('');
  } catch (error) {
    console.error('Error generating Excel:', error.message);
    console.log('Note: Run "npm install" to install dependencies.\n');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  displayBanner();

  const extractor = new AIExtractor();

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      displayHelp();
      break;

    case 'extract':
      await demoExtraction(extractor);
      break;

    case 'review':
      await demoExtraction(extractor);
      await demoReviewMode(extractor);
      break;

    case 'export':
      const extractions = await demoExtraction(extractor);
      for (const e of extractions) e.approveAll('auto');
      await demoExcelExport(extractions);
      break;

    case 'dates':
      demoDateParsing();
      break;

    case 'start':
    default:
      // Full pipeline
      console.log('Running full extraction pipeline...\n');

      // Step 1: Date parsing demo
      demoDateParsing();

      // Step 2: Extract
      await demoExtraction(extractor);

      // Step 3: Review
      await demoReviewMode(extractor);

      // Step 4: Export
      await demoExcelExport(extractor.getAllExtractions());

      console.log('========================================');
      console.log('Pipeline complete!');
      console.log('========================================\n');
      break;
  }
}

// Run
main().catch(console.error);
