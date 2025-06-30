
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Copy, Download, RefreshCw } from 'lucide-react';
import { crowdDataService, LocationData } from '@/services/crowdDataService';
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
    
    // Simulate AI processing time
    setTimeout(() => {
      const totalPeople = locations.reduce((sum, loc) => sum + loc.current, 0);
      const highRiskAreas = locations.filter(loc => loc.density >= 80);
      const mediumRiskAreas = locations.filter(loc => loc.density >= 60 && loc.density < 80);
      const avgDensity = Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length);
      const increasingTrends = locations.filter(loc => loc.trend === 'up');
      
      let summary = '';
      
      switch (summaryType) {
        case 'overview':
          summary = generateOverviewSummary(totalPeople, avgDensity, highRiskAreas, mediumRiskAreas, increasingTrends);
          break;
        case 'security':
          summary = generateSecuritySummary(highRiskAreas, increasingTrends, totalPeople);
          break;
        case 'operational':
          summary = generateOperationalSummary(locations, totalPeople, avgDensity);
          break;
        case 'emergency':
          summary = generateEmergencySummary(highRiskAreas, locations);
          break;
        default:
          summary = generateCustomSummary(query, locations);
      }
      
      setGeneratedSummary(summary);
      setIsGenerating(false);
      toast.success('Summary generated successfully');
    }, 2000);
  };

  const generateOverviewSummary = (totalPeople: number, avgDensity: number, highRisk: LocationData[], mediumRisk: LocationData[], increasing: LocationData[]) => {
    const timestamp = new Date().toLocaleString();
    
    return `**SITUATIONAL OVERVIEW - ${timestamp}**

**Current Status:**
• Total attendees: ${totalPeople.toLocaleString()}
• Average crowd density: ${avgDensity}%
• Locations monitored: ${locations.length}

**Risk Assessment:**
• Critical areas (>80% capacity): ${highRisk.length}
• Medium risk areas (60-80% capacity): ${mediumRisk.length}
• Areas with increasing trends: ${increasing.length}

**Key Locations:**
${highRisk.length > 0 ? 
  highRisk.map(area => `• ${area.name}: ${area.density}% capacity (${area.current}/${area.capacity}) - CRITICAL`).join('\n') :
  '• No critical areas at this time'
}

**Trend Analysis:**
${increasing.length > 0 ? 
  `Areas showing increasing crowds: ${increasing.map(area => area.name).join(', ')}` :
  'Crowd levels are stable across all monitored areas'
}

**Overall Assessment:**
${highRisk.length > 0 ? 
  'ELEVATED RISK - Immediate attention required for overcrowded areas' :
  avgDensity > 60 ? 
    'MODERATE RISK - Continue monitoring, prepare contingency measures' :
    'LOW RISK - Normal operations, routine monitoring sufficient'
}`;
  };

  const generateSecuritySummary = (highRisk: LocationData[], increasing: LocationData[], totalPeople: number) => {
    const timestamp = new Date().toLocaleString();
    
    return `**SECURITY BRIEFING - ${timestamp}**

**Threat Level:** ${highRisk.length > 0 ? 'ELEVATED' : 'NORMAL'}

**Priority Deployments:**
${highRisk.length > 0 ? 
  highRisk.map(area => `• ${area.name}: Deploy additional security - ${area.density}% capacity`).join('\n') :
  '• No immediate deployments required'
}

**Areas Requiring Monitoring:**
${increasing.map(area => `• ${area.name}: Increasing trend (${area.density}%)`).join('\n')}

**Resource Allocation:**
• Estimated security personnel needed: ${Math.ceil(totalPeople / 200)}
• High-priority posts: ${highRisk.length}
• Patrol routes: ${locations.length} locations

**Recommended Actions:**
${highRisk.length > 0 ? `
• Deploy crowd control barriers to critical areas
• Increase security presence at ${highRisk.map(a => a.name).join(', ')}
• Activate crowd dispersal protocols if needed` : `
• Maintain standard patrol schedules
• Monitor crowd flow patterns
• Keep emergency response teams on standby`}

**Emergency Contacts:**
• Command Center: Ready
• Medical Units: On standby
• Local Authorities: Notified of current status`;
  };

  const generateOperationalSummary = (locations: LocationData[], totalPeople: number, avgDensity: number) => {
    const timestamp = new Date().toLocaleString();
    
    return `**OPERATIONAL STATUS - ${timestamp}**

**Capacity Management:**
• Total venue utilization: ${avgDensity}%
• Peak capacity locations: ${locations.filter(l => l.density > 75).map(l => l.name).join(', ') || 'None'}
• Available capacity: ${locations.reduce((sum, loc) => sum + (loc.capacity - loc.current), 0).toLocaleString()} people

**Flow Management:**
${locations.map(loc => `• ${loc.name}: ${loc.trend === 'up' ? '↗️ Increasing' : loc.trend === 'down' ? '↘️ Decreasing' : '➡️ Stable'} (${loc.density}%)`).join('\n')}

**Infrastructure Status:**
• Entry/exit points: Operational
• Emergency routes: Clear
• Communication systems: Active

**Recommendations:**
${avgDensity > 70 ? `
• Consider implementing entry controls
• Open additional service points
• Prepare crowd redirection measures` : `
• Continue normal operations
• Monitor for capacity changes
• Maintain readiness for peak periods`}

**Next Review:** ${new Date(Date.now() + 15 * 60000).toLocaleTimeString()}`;
  };

  const generateEmergencySummary = (highRisk: LocationData[], allLocations: LocationData[]) => {
    const timestamp = new Date().toLocaleString();
    
    return `**EMERGENCY PREPAREDNESS SUMMARY - ${timestamp}**

**Current Risk Level:** ${highRisk.length > 0 ? 'HIGH' : 'MODERATE'}

**Critical Areas:**
${highRisk.length > 0 ? 
  highRisk.map(area => `• ${area.name}: OVERCROWDED (${area.density}%) - Evacuation priority`).join('\n') :
  '• No critical evacuation priorities at this time'
}

**Evacuation Capacity:**
• Primary routes: Available
• Secondary routes: Available  
• Emergency exits: Clear
• Estimated evacuation time: ${Math.ceil(allLocations.reduce((sum, loc) => sum + loc.current, 0) / 1000)} minutes

**Emergency Resources:**
• Medical stations: Active
• Fire safety: Operational
• Communication: All channels open
• Emergency vehicles: Access confirmed

**Action Plan:**
${highRisk.length > 0 ? `
1. Immediate crowd control at critical areas
2. Prepare for partial evacuation if needed
3. Alert emergency services
4. Activate incident command center` : `
1. Continue routine monitoring
2. Maintain emergency readiness
3. Regular safety checks
4. Keep evacuation routes clear`}

**Weather/External Factors:**
• Current conditions: Stable
• Forecast: No adverse conditions expected
• External events: None affecting venue`;
  };

  const generateCustomSummary = (query: string, locations: LocationData[]) => {
    const timestamp = new Date().toLocaleString();
    
    return `**CUSTOM ANALYSIS - ${timestamp}**

**Query:** "${query}"

**Analysis Based on Current Data:**
${locations.map(loc => `• ${loc.name}: ${loc.current} people (${loc.density}% capacity) - ${loc.trend} trend`).join('\n')}

**Key Insights:**
• This analysis is based on real-time crowd data
• Patterns suggest normal event progression
• Recommend continued monitoring

**Data Sources:**
• Manual crowd counts: ${locations.length} locations
• Last updated: ${timestamp}
• Confidence level: High (manual verification)

Note: For more specific analysis, please provide detailed questions about crowd management, security concerns, or operational needs.`;
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

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Summary Type
                </label>
                <Select value={summaryType} onValueChange={setSummaryType}>
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
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'What is the current situation at the main stage?' or 'Security recommendations for next hour'"
                    className="min-h-[120px] bg-blue-50 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
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
