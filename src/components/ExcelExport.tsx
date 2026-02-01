'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Settings, CheckCircle } from 'lucide-react';
import { LeadSchedule, ExtractedInvoice, ExportConfig } from '@/types';
import {
  exportLeadScheduleToExcel,
  exportInvoicesToExcel,
  downloadExcel,
  getExportFormats,
} from '@/utils/excelExporter';

interface ExcelExportProps {
  leadSchedule?: LeadSchedule | null;
  invoices?: ExtractedInvoice[];
}

export default function ExcelExport({ leadSchedule, invoices = [] }: ExcelExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [config, setConfig] = useState<ExportConfig>({
    firmName: '',
    headerFormat: 'custom',
    includeWatermark: false,
    includeSignatureLines: true,
    includeTickmarks: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  const exportFormats = getExportFormats();

  const handleExportLeadSchedule = async () => {
    if (!leadSchedule) return;

    setIsExporting(true);
    try {
      const blob = exportLeadScheduleToExcel(leadSchedule, config);
      const filename = `Lead_Schedule_A_${leadSchedule.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadExcel(blob, filename);
      setExportSuccess('Lead Schedule exported successfully!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(false);
  };

  const handleExportInvoices = async () => {
    if (invoices.length === 0) return;

    setIsExporting(true);
    try {
      const blob = exportInvoicesToExcel(invoices, config);
      const filename = `Invoice_Extract_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadExcel(blob, filename);
      setExportSuccess('Invoices exported successfully!');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsExporting(false);
  };

  const handleExportAll = async () => {
    await handleExportLeadSchedule();
    await handleExportInvoices();
  };

  return (
    <div className="audit-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-audit-primary flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Excel Export
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="audit-btn audit-btn-secondary flex items-center text-sm"
        >
          <Settings className="w-4 h-4 mr-1" />
          Settings
        </button>
      </div>

      {/* Success Message */}
      {exportSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700">{exportSuccess}</span>
        </div>
      )}

      {/* Export Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Header Format
              </label>
              <select
                value={config.headerFormat}
                onChange={(e) =>
                  setConfig({ ...config, headerFormat: e.target.value as ExportConfig['headerFormat'] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-audit-accent focus:border-audit-accent"
              >
                {exportFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Firm Name (optional)
              </label>
              <input
                type="text"
                value={config.firmName}
                onChange={(e) => setConfig({ ...config, firmName: e.target.value })}
                placeholder="Override firm name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-audit-accent focus:border-audit-accent"
              />
            </div>
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.includeSignatureLines}
                  onChange={(e) =>
                    setConfig({ ...config, includeSignatureLines: e.target.checked })
                  }
                  className="rounded border-gray-300 text-audit-accent focus:ring-audit-accent"
                />
                <span className="text-sm text-gray-700">Include signature lines</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.includeTickmarks}
                  onChange={(e) =>
                    setConfig({ ...config, includeTickmarks: e.target.checked })
                  }
                  className="rounded border-gray-300 text-audit-accent focus:ring-audit-accent"
                />
                <span className="text-sm text-gray-700">Include tickmark legend sheet</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export Lead Schedule */}
        <div className="p-4 border border-gray-200 rounded-lg hover:border-audit-accent transition-colors">
          <div className="flex items-center mb-2">
            <FileSpreadsheet className="w-8 h-8 text-audit-primary mr-3" />
            <div>
              <h3 className="font-medium text-gray-800">Lead Schedule</h3>
              <p className="text-xs text-gray-500">
                {leadSchedule ? `${leadSchedule.entries.length} entries` : 'Not generated'}
              </p>
            </div>
          </div>
          <button
            onClick={handleExportLeadSchedule}
            disabled={!leadSchedule || isExporting}
            className="w-full audit-btn audit-btn-primary flex items-center justify-center text-sm mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
        </div>

        {/* Export Invoices */}
        <div className="p-4 border border-gray-200 rounded-lg hover:border-audit-accent transition-colors">
          <div className="flex items-center mb-2">
            <FileSpreadsheet className="w-8 h-8 text-audit-accent mr-3" />
            <div>
              <h3 className="font-medium text-gray-800">Invoices</h3>
              <p className="text-xs text-gray-500">
                {invoices.length > 0 ? `${invoices.length} invoices` : 'None extracted'}
              </p>
            </div>
          </div>
          <button
            onClick={handleExportInvoices}
            disabled={invoices.length === 0 || isExporting}
            className="w-full audit-btn audit-btn-primary flex items-center justify-center text-sm mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
        </div>

        {/* Export All */}
        <div className="p-4 border border-gray-200 rounded-lg hover:border-audit-success transition-colors bg-gray-50">
          <div className="flex items-center mb-2">
            <FileSpreadsheet className="w-8 h-8 text-audit-success mr-3" />
            <div>
              <h3 className="font-medium text-gray-800">Export All</h3>
              <p className="text-xs text-gray-500">Combined workpapers</p>
            </div>
          </div>
          <button
            onClick={handleExportAll}
            disabled={(!leadSchedule && invoices.length === 0) || isExporting}
            className="w-full audit-btn audit-btn-success flex items-center justify-center text-sm mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </button>
        </div>
      </div>

      {/* Format Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Big 4 Headers:</strong> Exports include professional formatting with firm branding,
          signature lines, and standard audit tickmarks. Select your preferred format in Settings.
        </p>
      </div>
    </div>
  );
}
