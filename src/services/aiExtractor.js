/**
 * AI Extraction Service
 * Handles document data extraction with review mode for corrections
 */

import { parseDate, formatDate } from '../utils/dateParser.js';

/**
 * Extraction status enum
 */
export const ExtractionStatus = {
  PENDING: 'pending',
  EXTRACTED: 'extracted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

/**
 * Confidence levels for AI extractions
 */
export const ConfidenceLevel = {
  HIGH: 'high',      // >= 0.9
  MEDIUM: 'medium',  // >= 0.7
  LOW: 'low',        // >= 0.5
  UNCERTAIN: 'uncertain' // < 0.5
};

/**
 * Get confidence level from score
 */
function getConfidenceLevel(score) {
  if (score >= 0.9) return ConfidenceLevel.HIGH;
  if (score >= 0.7) return ConfidenceLevel.MEDIUM;
  if (score >= 0.5) return ConfidenceLevel.LOW;
  return ConfidenceLevel.UNCERTAIN;
}

/**
 * Extraction field with metadata for review
 */
export class ExtractionField {
  constructor(name, value, confidence = 1.0, source = null) {
    this.name = name;
    this.originalValue = value;
    this.currentValue = value;
    this.confidence = confidence;
    this.confidenceLevel = getConfidenceLevel(confidence);
    this.source = source;
    this.reviewed = false;
    this.corrected = false;
    this.reviewNotes = '';
    this.extractedAt = new Date();
    this.reviewedAt = null;
    this.reviewedBy = null;
  }

  /**
   * Update field value during review
   */
  correct(newValue, reviewer = 'user', notes = '') {
    if (newValue !== this.currentValue) {
      this.currentValue = newValue;
      this.corrected = true;
    }
    this.reviewed = true;
    this.reviewedAt = new Date();
    this.reviewedBy = reviewer;
    this.reviewNotes = notes;
    return this;
  }

  /**
   * Approve field without changes
   */
  approve(reviewer = 'user', notes = '') {
    this.reviewed = true;
    this.reviewedAt = new Date();
    this.reviewedBy = reviewer;
    this.reviewNotes = notes;
    return this;
  }

  /**
   * Check if field needs review (low confidence)
   */
  needsReview() {
    return !this.reviewed && (
      this.confidenceLevel === ConfidenceLevel.LOW ||
      this.confidenceLevel === ConfidenceLevel.UNCERTAIN
    );
  }

  /**
   * Export field data
   */
  toJSON() {
    return {
      name: this.name,
      originalValue: this.originalValue,
      currentValue: this.currentValue,
      confidence: this.confidence,
      confidenceLevel: this.confidenceLevel,
      reviewed: this.reviewed,
      corrected: this.corrected,
      reviewNotes: this.reviewNotes
    };
  }
}

/**
 * Document extraction result with review capabilities
 */
export class ExtractionResult {
  constructor(documentId, documentName) {
    this.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    this.documentId = documentId;
    this.documentName = documentName;
    this.fields = new Map();
    this.status = ExtractionStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.reviewCompletedAt = null;
  }

  /**
   * Add an extracted field
   */
  addField(name, value, confidence = 1.0, source = null) {
    const field = new ExtractionField(name, value, confidence, source);
    this.fields.set(name, field);
    this.status = ExtractionStatus.EXTRACTED;
    this.updatedAt = new Date();
    return field;
  }

  /**
   * Get a field by name
   */
  getField(name) {
    return this.fields.get(name);
  }

  /**
   * Get all fields that need review
   */
  getFieldsNeedingReview() {
    return Array.from(this.fields.values()).filter(f => f.needsReview());
  }

  /**
   * Get all fields
   */
  getAllFields() {
    return Array.from(this.fields.values());
  }

  /**
   * Check if review is complete
   */
  isReviewComplete() {
    return Array.from(this.fields.values()).every(f => f.reviewed);
  }

  /**
   * Mark review as complete
   */
  completeReview() {
    if (this.isReviewComplete()) {
      this.status = ExtractionStatus.REVIEWED;
      this.reviewCompletedAt = new Date();
      this.updatedAt = new Date();
    }
    return this;
  }

  /**
   * Approve all extractions
   */
  approveAll(reviewer = 'user') {
    for (const field of this.fields.values()) {
      if (!field.reviewed) {
        field.approve(reviewer);
      }
    }
    this.status = ExtractionStatus.APPROVED;
    this.reviewCompletedAt = new Date();
    this.updatedAt = new Date();
    return this;
  }

  /**
   * Get extraction summary
   */
  getSummary() {
    const fields = Array.from(this.fields.values());
    return {
      documentId: this.documentId,
      documentName: this.documentName,
      totalFields: fields.length,
      reviewedFields: fields.filter(f => f.reviewed).length,
      correctedFields: fields.filter(f => f.corrected).length,
      fieldsNeedingReview: fields.filter(f => f.needsReview()).length,
      status: this.status,
      averageConfidence: fields.length > 0
        ? fields.reduce((sum, f) => sum + f.confidence, 0) / fields.length
        : 0
    };
  }

  /**
   * Export to plain object for Excel/JSON
   */
  toExportData() {
    const data = {
      documentId: this.documentId,
      documentName: this.documentName,
      status: this.status,
      extractedAt: this.createdAt,
      reviewedAt: this.reviewCompletedAt
    };

    for (const field of this.fields.values()) {
      data[field.name] = field.currentValue;
      data[`${field.name}_confidence`] = field.confidence;
      data[`${field.name}_corrected`] = field.corrected;
    }

    return data;
  }
}

/**
 * AI Extraction Service with review mode
 */
export class AIExtractor {
  constructor() {
    this.extractions = new Map();
    this.reviewMode = false;
  }

  /**
   * Enable review mode
   */
  enableReviewMode() {
    this.reviewMode = true;
    return this;
  }

  /**
   * Disable review mode
   */
  disableReviewMode() {
    this.reviewMode = false;
    return this;
  }

  /**
   * Simulate AI extraction from document
   * In production, this would call an actual AI service
   */
  async extractFromDocument(documentId, documentName, content) {
    const result = new ExtractionResult(documentId, documentName);

    // Simulate extraction of common audit fields
    const extractions = this.simulateExtraction(content);

    for (const { name, value, confidence, source } of extractions) {
      result.addField(name, value, confidence, source);
    }

    this.extractions.set(result.id, result);
    return result;
  }

  /**
   * Simulate AI extraction (placeholder for actual AI integration)
   */
  simulateExtraction(content) {
    // This simulates what an AI would extract
    // In production, replace with actual AI API calls
    const extractions = [];

    // Extract dates using our date parser
    const datePatterns = [
      { field: 'invoiceDate', pattern: /invoice\s*date[:\s]*([^\n,]+)/i },
      { field: 'dueDate', pattern: /due\s*date[:\s]*([^\n,]+)/i },
      { field: 'transactionDate', pattern: /transaction\s*date[:\s]*([^\n,]+)/i },
      { field: 'periodEnd', pattern: /period\s*end(?:ing)?[:\s]*([^\n,]+)/i },
    ];

    for (const { field, pattern } of datePatterns) {
      const match = content?.match(pattern);
      if (match) {
        const parsed = parseDate(match[1].trim());
        extractions.push({
          name: field,
          value: parsed.date ? formatDate(parsed.date, 'DD/MM/YYYY') : match[1].trim(),
          confidence: parsed.date ? 0.95 : 0.6,
          source: match[0]
        });
      }
    }

    // Extract amounts
    const amountPattern = /(?:amount|total|value)[:\s]*[\$\£\€]?\s*([\d,]+\.?\d*)/gi;
    let amountMatch;
    let amountIndex = 0;
    while ((amountMatch = amountPattern.exec(content)) !== null) {
      extractions.push({
        name: amountIndex === 0 ? 'amount' : `amount_${amountIndex}`,
        value: amountMatch[1].replace(/,/g, ''),
        confidence: 0.85,
        source: amountMatch[0]
      });
      amountIndex++;
    }

    // Extract reference numbers
    const refPattern = /(?:ref(?:erence)?|invoice)\s*(?:no|number|#)?[:\s]*([A-Z0-9-]+)/gi;
    const refMatch = content?.match(refPattern);
    if (refMatch) {
      extractions.push({
        name: 'referenceNumber',
        value: refMatch[0].split(/[:\s]+/).pop(),
        confidence: 0.9,
        source: refMatch[0]
      });
    }

    // Extract vendor/supplier name
    const vendorPattern = /(?:vendor|supplier|from)[:\s]*([^\n]+)/i;
    const vendorMatch = content?.match(vendorPattern);
    if (vendorMatch) {
      extractions.push({
        name: 'vendorName',
        value: vendorMatch[1].trim(),
        confidence: 0.75,
        source: vendorMatch[0]
      });
    }

    return extractions;
  }

  /**
   * Get extraction by ID
   */
  getExtraction(id) {
    return this.extractions.get(id);
  }

  /**
   * Get all extractions
   */
  getAllExtractions() {
    return Array.from(this.extractions.values());
  }

  /**
   * Get extractions needing review
   */
  getExtractionsNeedingReview() {
    return this.getAllExtractions().filter(e =>
      e.status === ExtractionStatus.EXTRACTED &&
      e.getFieldsNeedingReview().length > 0
    );
  }

  /**
   * Start interactive review session
   */
  async startReviewSession(readline) {
    this.enableReviewMode();
    const needsReview = this.getExtractionsNeedingReview();

    if (needsReview.length === 0) {
      console.log('No extractions need review.');
      return;
    }

    console.log(`\n=== REVIEW MODE ===`);
    console.log(`${needsReview.length} document(s) need review.\n`);

    for (const extraction of needsReview) {
      await this.reviewExtraction(extraction, readline);
    }

    this.disableReviewMode();
    console.log('\nReview session complete.');
  }

  /**
   * Review a single extraction interactively
   */
  async reviewExtraction(extraction, readline) {
    console.log(`\n--- Reviewing: ${extraction.documentName} ---`);
    const fieldsToReview = extraction.getFieldsNeedingReview();

    console.log(`${fieldsToReview.length} field(s) need review (low confidence):\n`);

    for (const field of fieldsToReview) {
      console.log(`Field: ${field.name}`);
      console.log(`  Extracted value: ${field.currentValue}`);
      console.log(`  Confidence: ${(field.confidence * 100).toFixed(0)}% (${field.confidenceLevel})`);
      console.log(`  Source: "${field.source}"`);

      if (readline) {
        const answer = readline.question('  Correct value (Enter to accept, or type new value): ');
        if (answer.trim()) {
          field.correct(answer.trim(), 'reviewer');
          console.log(`  -> Corrected to: ${field.currentValue}`);
        } else {
          field.approve('reviewer');
          console.log(`  -> Approved`);
        }
      } else {
        field.approve('auto');
      }
      console.log('');
    }

    extraction.completeReview();
    return extraction;
  }
}

/**
 * Create a review report
 */
export function generateReviewReport(extractions) {
  const report = {
    generatedAt: new Date().toISOString(),
    totalDocuments: extractions.length,
    reviewed: 0,
    approved: 0,
    correctionsMade: 0,
    documents: []
  };

  for (const extraction of extractions) {
    const summary = extraction.getSummary();
    report.documents.push(summary);

    if (summary.status === ExtractionStatus.REVIEWED ||
        summary.status === ExtractionStatus.APPROVED) {
      report.reviewed++;
    }
    if (summary.status === ExtractionStatus.APPROVED) {
      report.approved++;
    }
    report.correctionsMade += summary.correctedFields;
  }

  return report;
}

export default AIExtractor;
