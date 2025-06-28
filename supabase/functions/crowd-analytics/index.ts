
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CrowdAnalysisRequest {
  locationName: string;
  densityCount: number;
  imageData?: string;
  eventId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { locationName, densityCount, imageData, eventId }: CrowdAnalysisRequest = await req.json()

    // Calculate density percentage (assuming max capacity of 1000 per location)
    const maxCapacity = 1000;
    const densityPercentage = (densityCount / maxCapacity) * 100;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (densityPercentage > 90) riskLevel = 'critical';
    else if (densityPercentage > 75) riskLevel = 'high';
    else if (densityPercentage > 50) riskLevel = 'medium';

    // Insert crowd metrics
    const { data: metric, error: metricError } = await supabaseClient
      .from('crowd_metrics')
      .insert([{
        event_id: eventId,
        location_name: locationName,
        density_count: densityCount,
        density_percentage: densityPercentage,
        sentiment_score: Math.random() * 0.4 + 0.3, // Simulated sentiment (0.3-0.7)
        temperature: Math.random() * 10 + 20, // Simulated temperature (20-30°C)
        noise_level: Math.random() * 40 + 60, // Simulated noise (60-100 dB)
      }])
      .select()
      .single()

    if (metricError) throw metricError

    // Create alert if high risk
    if (riskLevel === 'high' || riskLevel === 'critical') {
      const { error: alertError } = await supabaseClient
        .from('alerts')
        .insert([{
          event_id: eventId,
          title: `High Crowd Density - ${locationName}`,
          message: `Crowd density at ${locationName} has reached ${densityPercentage.toFixed(1)}% capacity (${densityCount} people). Immediate attention required.`,
          alert_type: 'crowd_density',
          severity: riskLevel,
          location_name: locationName,
          metadata: { density_count: densityCount, density_percentage: densityPercentage }
        }])

      if (alertError) console.error('Alert creation error:', alertError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        metric,
        riskLevel,
        recommendations: generateRecommendations(riskLevel, densityPercentage)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in crowd-analytics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateRecommendations(riskLevel: string, densityPercentage: number): string[] {
  const recommendations: string[] = []

  switch (riskLevel) {
    case 'critical':
      recommendations.push('IMMEDIATE EVACUATION PROTOCOLS REQUIRED')
      recommendations.push('Deploy all available security teams')
      recommendations.push('Activate emergency announcements')
      recommendations.push('Implement crowd control barriers')
      break
    case 'high':
      recommendations.push('Deploy additional security personnel')
      recommendations.push('Implement flow control measures')
      recommendations.push('Monitor exit routes for congestion')
      recommendations.push('Consider temporary access restrictions')
      break
    case 'medium':
      recommendations.push('Increase monitoring frequency')
      recommendations.push('Prepare crowd control measures')
      recommendations.push('Alert nearby security teams')
      break
    default:
      recommendations.push('Continue normal monitoring')
      recommendations.push('Maintain current security levels')
  }

  return recommendations
}
