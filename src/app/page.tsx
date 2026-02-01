'use client';

import React, { useState } from 'react';
import { FileCheck, LayoutDashboard, Upload, Sparkles, FileSpreadsheet, Download } from 'lucide-react';
import DocumentUpload from '@/components/DocumentUpload';
import InvoiceExtractor from '@/components/InvoiceExtractor';
import LeadSchedule from '@/components/LeadSchedule';
import ExcelExport from '@/components/ExcelExport';
import { UploadedDocument, ExtractedInvoice, LeadSchedule as LeadScheduleType } from '@/types';

type TabType = 'upload' | 'extract' | 'schedule' | 'export';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [invoices, setInvoices] = useState<ExtractedInvoice[]>([]);
  const [leadSchedule, setLeadSchedule] = useState<LeadScheduleType | null>(null);

  const handleDocumentsUploaded = (newDocs: UploadedDocument[]) => {
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleDocumentStatusChange = (documentId: string, status: UploadedDocument['status']) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? { ...doc, status } : doc))
    );
  };

  const handleInvoicesExtracted = (newInvoices: ExtractedInvoice[]) => {
    setInvoices((prev) => [...prev, ...newInvoices]);
  };

  const handleScheduleGenerated = (schedule: LeadScheduleType) => {
    setLeadSchedule(schedule);
  };

  const tabs = [
    { id: 'upload' as const, label: 'Document Upload', icon: Upload, count: documents.length },
    { id: 'extract' as const, label: 'AI Extraction', icon: Sparkles, count: invoices.length },
    { id: 'schedule' as const, label: 'Lead Schedule', icon: FileSpreadsheet, count: leadSchedule ? 1 : 0 },
    { id: 'export' as const, label: 'Excel Export', icon: Download, count: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-audit-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileCheck className="w-8 h-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold">Audit Workpaper Management</h1>
                <p className="text-sm text-blue-200">
                  Document Upload | AI Extraction | Big 4 Exports
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="text-blue-200">Current Engagement</p>
                <p className="font-medium">Sample Corporation - FY2024</p>
              </div>
              <div className="w-10 h-10 bg-white text-audit-primary rounded-full flex items-center justify-center font-bold">
                AS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-audit-accent text-audit-accent'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        isActive
                          ? 'bg-audit-accent text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Overview */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <LayoutDashboard className="w-5 h-5 text-audit-primary mr-2" />
              <h2 className="font-semibold text-gray-800">Workflow Progress</h2>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-audit-primary">{documents.length}</p>
                <p className="text-xs text-gray-500">Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-audit-accent">{invoices.length}</p>
                <p className="text-xs text-gray-500">Invoices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-audit-success">
                  {leadSchedule ? leadSchedule.entries.length : 0}
                </p>
                <p className="text-xs text-gray-500">Schedule Entries</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-audit-primary via-audit-accent to-audit-success transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      ((documents.length > 0 ? 25 : 0) +
                        (invoices.length > 0 ? 25 : 0) +
                        (leadSchedule ? 25 : 0) +
                        25),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {documents.length === 0
                ? 'Upload documents to begin'
                : invoices.length === 0
                ? 'Extract invoices'
                : !leadSchedule
                ? 'Generate schedule'
                : 'Ready to export'}
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'upload' && (
            <DocumentUpload onDocumentsUploaded={handleDocumentsUploaded} />
          )}

          {activeTab === 'extract' && (
            <InvoiceExtractor
              documents={documents}
              onInvoicesExtracted={handleInvoicesExtracted}
              onDocumentStatusChange={handleDocumentStatusChange}
            />
          )}

          {activeTab === 'schedule' && (
            <LeadSchedule onScheduleGenerated={handleScheduleGenerated} />
          )}

          {activeTab === 'export' && (
            <ExcelExport leadSchedule={leadSchedule} invoices={invoices} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>Audit Workpaper Management System v1.0</p>
            <p>Professional audit document processing with AI-powered extraction</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
