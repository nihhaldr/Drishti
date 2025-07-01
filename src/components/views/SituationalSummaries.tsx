
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Copy, Download, RefreshCw } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
import { SummaryTypeSelector } from '@/components/situational-summaries/SummaryTypeSelector';
import { SummaryGenerator } from '@/components/situational-summaries/SummaryGenerator';
import { toast } from 'sonner';

export const SituationalSummaries = () => {
  const [query, setQuery] = useState('');
  const [summaryType, setSummaryType] = useState('overview');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);

  useEffect(() => {
    setLocations(crowdDataService.getLocations());
    
    const unsubscribe = crowdDataService.subscribe((newLocations) => {
      setLocations(newLocations);
    });

    return unsubscribe;
  }, []);

  const generateSummary = async () => {
    if (locations.length === 0) {
      toast.error('No crowd data available. Please add some manual data first.');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const totalPeople = locations.reduce((sum, loc) => sum + loc.current, 0);
      const highRiskAreas = locations.filter(loc => loc.density >= 80);
      const mediumRiskAreas = locations.filter(loc => loc.density >= 60 && loc.density < 80);
      const avgDensity = Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length);
      const increasingTrends = locations.filter(loc => loc.trend === 'up');
      
      let summary = '';
      
      switch (summaryType) {
        case 'overview':
          summary = SummaryGenerator.generateOverviewSummary(totalPeople, avgDensity, highRiskAreas, mediumRiskAreas, increasingTrends, locations);
          break;
        case 'security':
          summary = SummaryGenerator.generateSecuritySummary(highRiskAreas, increasingTrends, totalPeople);
          break;
        case 'operational':
          summary = SummaryGenerator.generateOperationalSummary(locations, totalPeople, avgDensity);
          break;
        case 'emergency':
          summary = SummaryGenerator.generateEmergencySummary(highRiskAreas, locations);
          break;
        default:
          summary = SummaryGenerator.generateCustomSummary(query, locations);
      }
      
      setGeneratedSummary(summary);
      setIsGenerating(false);
      toast.success('Summary generated successfully');
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSummary);
    toast.success('Summary copied to clipboard');
  };

  const downloadSummary = () => {
    const blob = new Blob([generatedSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `situational-summary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Summary downloaded');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Situational Summary Generator</h1>
            </div>
            <p className="text-gray-600 mb-8">Generate AI-powered situational summaries based on real crowd data.</p>

            <SummaryTypeSelector
              summaryType={summaryType}
              query={query}
              onSummaryTypeChange={setSummaryType}
              onQueryChange={setQuery}
            />

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
              <h3 className="font-medium text-blue-900 mb-2">Current Data Status</h3>
              <p className="text-sm text-blue-700">
                {locations.length > 0 ? 
                  `${locations.length} locations with crowd data • Last updated: ${new Date().toLocaleTimeString()}` :
                  'No crowd data available. Please add manual data in the Crowd Analysis section.'
                }
              </p>
            </div>

            <Button
              onClick={generateSummary}
              disabled={isGenerating || (summaryType === 'custom' && !query.trim()) || locations.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                'Generate Summary'
              )}
            </Button>
          </div>
        </Card>

        {generatedSummary && (
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Summary</h3>
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadSummary} size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {generatedSummary}
                </pre>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
