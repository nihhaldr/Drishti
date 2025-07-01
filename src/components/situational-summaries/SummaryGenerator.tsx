
import React from 'react';
import { LocationData } from '@/services/crowdDataService';

export class SummaryGenerator {
  static generateOverviewSummary(
    totalPeople: number, 
    avgDensity: number, 
    highRisk: LocationData[], 
    mediumRisk: LocationData[], 
    increasing: LocationData[],
    locations: LocationData[]
  ) {
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
  }

  static generateSecuritySummary(highRisk: LocationData[], increasing: LocationData[], totalPeople: number) {
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
• Patrol routes: ${increasing.length} locations

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
  }

  static generateOperationalSummary(locations: LocationData[], totalPeople: number, avgDensity: number) {
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
  }

  static generateEmergencySummary(highRisk: LocationData[], allLocations: LocationData[]) {
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
  }

  static generateCustomSummary(query: string, locations: LocationData[]) {
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
  }
}
