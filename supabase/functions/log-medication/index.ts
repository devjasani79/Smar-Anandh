import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const authHeader = req.headers.get('Authorization')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } }
    })

    const { action, medication_log_id, medication_id, senior_id, snooze_minutes } = await req.json()

    if (action === 'taken') {
      // Mark medication as taken
      const { error } = await supabase
        .from('medication_logs')
        .update({
          status: 'taken',
          taken_at: new Date().toISOString()
        })
        .eq('id', medication_log_id)

      if (error) throw error

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          senior_id,
          activity_type: 'medication_taken',
          activity_data: { medication_log_id }
        })

      return new Response(
        JSON.stringify({ success: true, message: 'Medication marked as taken' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'snooze') {
      const snoozeUntil = new Date(Date.now() + (snooze_minutes || 10) * 60 * 1000)
      
      const { error } = await supabase
        .from('medication_logs')
        .update({
          status: 'snoozed',
          snoozed_until: snoozeUntil.toISOString()
        })
        .eq('id', medication_log_id)

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Snoozed for ${snooze_minutes || 10} minutes`,
          snoozed_until: snoozeUntil.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create_pending') {
      // Create a new pending log for a medication
      const { error } = await supabase
        .from('medication_logs')
        .insert({
          medication_id,
          senior_id,
          scheduled_time: new Date().toISOString(),
          status: 'pending'
        })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, message: 'Pending log created' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Log medication error:', error)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
