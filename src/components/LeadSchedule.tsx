'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, RefreshCw, Download, Printer, CheckSquare } from 'lucide-react';
import { LeadSchedule as LeadScheduleType } from '@/types';
import {
  generateLeadASchedule,
  formatCurrency,
  formatVariance,
  getVarianceStatus,
} from '@/utils/leadScheduleGenerator';

interface LeadScheduleProps {
  onScheduleGenerated?: (schedule: LeadScheduleType) => void;
}

export default function LeadSchedule({ onScheduleGenerated }: LeadScheduleProps) {
  const [schedule, setSchedule] = useState<LeadScheduleType | null>(null);
  const [clientName, setClientName] = useState('Sample Corporation');
  const [preparedBy, setPrepparedBy] = useState('Audit Senior');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newSchedule = generateLeadASchedule(
      clientName,
      new Date(new Date().getFullYear(), 11, 31), // Dec 31 of current year
      preparedBy
    );
    setSchedule(newSchedule);
    onScheduleGenerated?.(newSchedule);
    setIsGenerating(false);
  };

  const getVarianceColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 font-semibold';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="audit-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-audit-primary flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Lead A Schedule - Assets
        </h2>
      </div>

      {/* Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Name
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-audit-accent focus:border-audit-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prepared By
          </label>
          <input
            type="text"
            value={preparedBy}
            onChange={(e) => setPrepparedBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-audit-accent focus:border-audit-accent"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="audit-btn audit-btn-primary w-full flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Sample
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schedule Display */}
      {schedule && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Schedule Header */}
          <div className="bg-audit-primary text-white p-4">
            <div className="text-center">
              <h3 className="text-lg font-bold">{schedule.clientName}</h3>
              <p className="text-sm opacity-90">{schedule.title}</p>
              <p className="text-sm opacity-75">
                Fiscal Year Ended: {schedule.fiscalYearEnd.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Workpaper Info */}
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between text-sm">
            <div>
              <span className="text-gray-500">Prepared by:</span>{' '}
              <span className="font-medium">{schedule.preparedBy}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-500">Date:</span>{' '}
              <span className="font-medium">
                {schedule.preparedDate.toLocaleDateString()}
              </span>
            </div>
            <div className="schedule-ref">
              Schedule: Lead-A | WP Ref: LA-001
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-audit-secondary text-white text-sm">
                  <th className="py-2 px-3 text-left w-20">Ref</th>
                  <th className="py-2 px-3 text-left w-24">Account</th>
                  <th className="py-2 px-3 text-left">Description</th>
                  <th className="py-2 px-3 text-right w-32">Prior Year</th>
                  <th className="py-2 px-3 text-right w-32">Current Year</th>
                  <th className="py-2 px-3 text-right w-28">Variance</th>
                  <th className="py-2 px-3 text-right w-20">%</th>
                  <th className="py-2 px-3 text-center w-16">W/P</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {schedule.entries.map((entry, index) => {
                  const varianceStatus = getVarianceStatus(entry.variancePercentage);
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-xs text-gray-500">
                        {entry.referenceNumber}
                      </td>
                      <td className="py-2 px-3 font-mono">{entry.accountCode}</td>
                      <td className="py-2 px-3">{entry.accountDescription}</td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatCurrency(entry.priorYearBalance)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatCurrency(entry.currentYearBalance)}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono ${getVarianceColor(
                          varianceStatus
                        )}`}
                      >
                        {formatCurrency(entry.variance)}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono ${getVarianceColor(
                          varianceStatus
                        )}`}
                      >
                        {formatVariance(entry.variancePercentage)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-xs text-audit-accent hover:underline cursor-pointer">
                          {entry.workpaperReference}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-audit-primary text-white font-semibold">
                  <td colSpan={3} className="py-3 px-3">
                    TOTAL ASSETS
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatCurrency(schedule.totalPriorYear)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatCurrency(schedule.totalCurrentYear)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatCurrency(schedule.totalVariance)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatVariance(
                      schedule.totalPriorYear !== 0
                        ? (schedule.totalVariance / Math.abs(schedule.totalPriorYear)) * 100
                        : 0
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 p-4 border-t flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <CheckSquare className="w-4 h-4 mr-1 text-audit-success" />
                Footed and cross-footed
              </span>
              <span>|</span>
              <span>
                Generated: {new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex space-x-2">
              <button className="audit-btn audit-btn-secondary flex items-center text-sm">
                <Printer className="w-4 h-4 mr-1" />
                Print
              </button>
              <button className="audit-btn audit-btn-primary flex items-center text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!schedule && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No schedule generated yet.</p>
          <p className="text-sm">Enter client details and click "Generate Sample" to create a Lead A schedule.</p>
        </div>
      )}
    </div>
  );
}
