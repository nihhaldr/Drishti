
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface SummaryTypeSelectorProps {
  summaryType: string;
  query: string;
  onSummaryTypeChange: (value: string) => void;
  onQueryChange: (value: string) => void;
}

export const SummaryTypeSelector = ({
  summaryType,
  query,
  onSummaryTypeChange,
  onQueryChange
}: SummaryTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Summary Type
        </label>
        <Select value={summaryType} onValueChange={onSummaryTypeChange}>
          <SelectTrigger className="bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">General Overview</SelectItem>
            <SelectItem value="security">Security Briefing</SelectItem>
            <SelectItem value="operational">Operational Status</SelectItem>
            <SelectItem value="emergency">Emergency Preparedness</SelectItem>
            <SelectItem value="custom">Custom Query</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {summaryType === 'custom' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Custom Query
          </label>
          <Textarea
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="e.g., 'What is the current situation at the main stage?' or 'Security recommendations for next hour'"
            className="min-h-[120px] bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
        </div>
      )}
    </div>
  );
};
