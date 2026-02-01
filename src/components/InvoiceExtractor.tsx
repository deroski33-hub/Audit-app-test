'use client';

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, Eye, Edit2, Trash2 } from 'lucide-react';
import { UploadedDocument, ExtractedInvoice } from '@/types';
import { simulateAIExtraction, validateInvoice } from '@/utils/invoiceExtractor';

interface InvoiceExtractorProps {
  documents: UploadedDocument[];
  onInvoicesExtracted: (invoices: ExtractedInvoice[]) => void;
  onDocumentStatusChange: (documentId: string, status: UploadedDocument['status']) => void;
}

export default function InvoiceExtractor({
  documents,
  onInvoicesExtracted,
  onDocumentStatusChange,
}: InvoiceExtractorProps) {
  const [extractedInvoices, setExtractedInvoices] = useState<ExtractedInvoice[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtractedInvoice | null>(null);
  const [extractionProgress, setExtractionProgress] = useState(0);

  const pendingDocuments = documents.filter((doc) => doc.status === 'pending');

  const handleExtractAll = async () => {
    if (pendingDocuments.length === 0) return;

    setIsExtracting(true);
    setExtractionProgress(0);
    const newInvoices: ExtractedInvoice[] = [];

    for (let i = 0; i < pendingDocuments.length; i++) {
      const doc = pendingDocuments[i];
      onDocumentStatusChange(doc.id, 'processing');

      try {
        const invoice = await simulateAIExtraction(doc.id, doc.fileName);
        newInvoices.push(invoice);
        onDocumentStatusChange(doc.id, 'extracted');
      } catch (error) {
        console.error('Extraction failed:', error);
        onDocumentStatusChange(doc.id, 'error');
      }

      setExtractionProgress(Math.round(((i + 1) / pendingDocuments.length) * 100));
    }

    setExtractedInvoices((prev) => [...prev, ...newInvoices]);
    onInvoicesExtracted(newInvoices);
    setIsExtracting(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          High ({confidence}%)
        </span>
      );
    }
    if (confidence >= 70) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          Medium ({confidence}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Low ({confidence}%)
      </span>
    );
  };

  const removeInvoice = (invoiceId: string) => {
    setExtractedInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice(null);
    }
  };

  return (
    <div className="audit-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-audit-primary flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-audit-accent" />
          AI Invoice Extraction
        </h2>
        <button
          onClick={handleExtractAll}
          disabled={pendingDocuments.length === 0 || isExtracting}
          className="audit-btn audit-btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isExtracting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Extracting... {extractionProgress}%
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Extract All ({pendingDocuments.length})
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {isExtracting && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-audit-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${extractionProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Processing documents... Please wait.
          </p>
        </div>
      )}

      {/* Extracted Invoices Table */}
      {extractedInvoices.length > 0 && (
        <div className="overflow-x-auto">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Total</th>
                <th>Confidence</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extractedInvoices.map((invoice) => {
                const validation = validateInvoice(invoice);
                return (
                  <tr key={invoice.id}>
                    <td className="font-mono text-sm">{invoice.invoiceNumber}</td>
                    <td>{invoice.vendorName}</td>
                    <td>{invoice.invoiceDate.toLocaleDateString()}</td>
                    <td className="font-medium">
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </td>
                    <td>{getConfidenceBadge(invoice.extractionConfidence)}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-audit-accent hover:text-audit-primary transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-400 hover:text-audit-primary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeInvoice(invoice.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {extractedInvoices.length === 0 && !isExtracting && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No invoices extracted yet.</p>
          <p className="text-sm">Upload documents and click "Extract All" to begin.</p>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="audit-header flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoice Details</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-white hover:text-gray-200"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Vendor
                  </label>
                  <p className="font-medium">{selectedInvoice.vendorName}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </label>
                  <p className="font-mono">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Invoice Date
                  </label>
                  <p>{selectedInvoice.invoiceDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Due Date
                  </label>
                  <p>{selectedInvoice.dueDate?.toLocaleDateString() || 'N/A'}</p>
                </div>
                {selectedInvoice.purchaseOrderNumber && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      PO Number
                    </label>
                    <p className="font-mono">{selectedInvoice.purchaseOrderNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Extraction Confidence
                  </label>
                  <p>{getConfidenceBadge(selectedInvoice.extractionConfidence)}</p>
                </div>
              </div>

              <h4 className="font-semibold text-gray-700 mb-2">Line Items</h4>
              <table className="audit-table mb-4">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>GL Code</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td className="font-mono text-sm">{item.glAccountCode || '-'}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.unitPrice)}</td>
                      <td>{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t pt-4">
                <div className="flex justify-end space-y-1">
                  <div className="w-48">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t mt-2 pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
