
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LostPersonRequest {
  name?: string;
  description: string;
  age?: number;
  lastSeenLocation: string;
  contactName: string;
  contactPhone: string;
  photoUrl?: string;
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

    const requestData: LostPersonRequest = await req.json()

    // Insert lost person record
    const { data: lostPerson, error: insertError } = await supabaseClient
      .from('lost_persons')
      .insert([{
        event_id: requestData.eventId,
        name: requestData.name,
        description: requestData.description,
        age: requestData.age,
        last_seen_location: requestData.lastSeenLocation,
        last_seen_time: new Date().toISOString(),
        photo_url: requestData.photoUrl,
        contact_name: requestData.contactName,
        contact_phone: requestData.contactPhone,
        ai_match_confidence: 0.0,
        status: 'missing'
      }])
      .select()
      .single()

    if (insertError) throw insertError

    // Create alert for lost person
    const { error: alertError } = await supabaseClient
      .from('alerts')
      .insert([{
        event_id: requestData.eventId,
        title: `Lost Person Report - ${requestData.name || 'Unknown'}`,
        message: `${requestData.description}. Last seen at ${requestData.lastSeenLocation}. Contact: ${requestData.contactName} (${requestData.contactPhone})`,
        alert_type: 'lost_person',
        severity: 'medium',
        location_name: requestData.lastSeenLocation,
        metadata: {
          lost_person_id: lostPerson.id,
          contact_info: {
            name: requestData.contactName,
            phone: requestData.contactPhone
          }
        }
      }])

    if (alertError) console.error('Alert creation error:', alertError)

    // Simulate AI matching process (in real implementation, this would use computer vision AI)
    setTimeout(async () => {
      try {
        // Simulate finding matches with confidence scores
        const matches = await simulateAIMatching(requestData.description, requestData.photoUrl)
        
        if (matches.length > 0) {
          // Update confidence score
          await supabaseClient
            .from('lost_persons')
            .update({ 
              ai_match_confidence: matches[0].confidence,
              status: matches[0].confidence > 0.8 ? 'found' : 'missing'
            })
            .eq('id', lostPerson.id)

          // Create alert for potential match
          if (matches[0].confidence > 0.7) {
            await supabaseClient
              .from('alerts')
              .insert([{
                event_id: requestData.eventId,
                title: `Potential Match Found - ${requestData.name || 'Lost Person'}`,
                message: `AI system found potential match with ${(matches[0].confidence * 100).toFixed(1)}% confidence at ${matches[0].location}`,
                alert_type: 'lost_person',
                severity: 'high',
                location_name: matches[0].location,
                metadata: {
                  lost_person_id: lostPerson.id,
                  match_confidence: matches[0].confidence,
                  match_location: matches[0].location
                }
              }])
          }
        }
      } catch (error) {
        console.error('AI matching error:', error)
      }
    }, 5000) // Simulate 5-second processing delay

    return new Response(
      JSON.stringify({
        success: true,
        lostPerson,
        message: 'Lost person report submitted. AI search initiated.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in lost-person-ai:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function simulateAIMatching(description: string, photoUrl?: string) {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Simulate potential matches (in real implementation, this would use actual AI)
  const locations = ['Main Stage', 'Food Court', 'Gate 3', 'VIP Area', 'Parking Lot A']
  const matches = []
  
  // Random chance of finding matches
  if (Math.random() > 0.3) {
    matches.push({
      location: locations[Math.floor(Math.random() * locations.length)],
      confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
      timestamp: new Date().toISOString()
    })
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence)
}
