// Document Types
export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  status: 'pending' | 'processing' | 'extracted' | 'error';
  rawContent?: string;
}

// Invoice Extraction Types
export interface ExtractedInvoice {
  id: string;
  documentId: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string;
  purchaseOrderNumber?: string;
  extractionConfidence: number;
  extractedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  glAccountCode?: string;
  taxRate?: number;
}

// Lead Schedule Types (Big 4 Format)
export interface LeadScheduleEntry {
  id: string;
  referenceNumber: string;
  accountCode: string;
  accountDescription: string;
  priorYearBalance: number;
  currentYearBalance: number;
  variance: number;
  variancePercentage: number;
  workpaperReference?: string;
  notes?: string;
}

export interface LeadSchedule {
  id: string;
  scheduleType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';
  title: string;
  clientName: string;
  fiscalYearEnd: Date;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  entries: LeadScheduleEntry[];
  totalPriorYear: number;
  totalCurrentYear: number;
  totalVariance: number;
}

// Audit Workpaper Types
export interface AuditEngagement {
  id: string;
  clientName: string;
  engagementCode: string;
  fiscalYearEnd: Date;
  engagementPartner: string;
  engagementManager: string;
  status: 'planning' | 'fieldwork' | 'completion' | 'archived';
}

// Export Configuration
export interface ExportConfig {
  firmName: string;
  firmLogo?: string;
  headerFormat: 'deloitte' | 'pwc' | 'ey' | 'kpmg' | 'custom';
  includeWatermark: boolean;
  includeSignatureLines: boolean;
  includeTickmarks: boolean;
}
