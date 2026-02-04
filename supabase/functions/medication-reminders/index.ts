import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MedicationDue {
  medication_id: string;
  medication_name: string;
  dosage: string;
  senior_id: string;
  senior_name: string;
  guardian_email: string;
  scheduled_time: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time in IST (India Standard Time)
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset)
    const currentHour = istTime.getUTCHours()
    const currentMinute = istTime.getUTCMinutes()
    
    // Round to nearest 30-minute slot for checking
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute < 30 ? '00' : '30'}`
    
    console.log(`Checking medications for time slot: ${timeSlot} IST`)

    // Get all active medications that are due now
    const { data: medications, error: medError } = await supabase
      .from('medications')
      .select(`
        id,
        name,
        dosage,
        times,
        senior_id,
        seniors!inner(
          id,
          name,
          guardian_email
        )
      `)
      .eq('is_active', true)

    if (medError) {
      console.error('Error fetching medications:', medError)
      throw medError
    }

    const medicationsDue: MedicationDue[] = []
    
    // Check each medication's schedule
    for (const med of medications || []) {
      const times = med.times as string[]
      
      if (Array.isArray(times)) {
        for (const time of times) {
          // Check if this time matches current time slot (with some flexibility)
          const [medHour, medMinute] = time.split(':').map(Number)
          const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (medHour * 60 + medMinute))
          
          // Within 15 minute window
          if (timeDiff <= 15) {
            const senior = med.seniors as any
            medicationsDue.push({
              medication_id: med.id,
              medication_name: med.name,
              dosage: med.dosage,
              senior_id: med.senior_id,
              senior_name: senior?.name || 'Senior',
              guardian_email: senior?.guardian_email || '',
              scheduled_time: time
            })
          }
        }
      }
    }

    console.log(`Found ${medicationsDue.length} medications due`)

    // Create medication logs and notifications for due medications
    for (const med of medicationsDue) {
      const scheduledTime = new Date()
      const [hour, minute] = med.scheduled_time.split(':').map(Number)
      scheduledTime.setHours(hour, minute, 0, 0)

      // Check if log already exists for this medication at this time today
      const startOfDay = new Date(scheduledTime)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(scheduledTime)
      endOfDay.setHours(23, 59, 59, 999)

      const { data: existingLog } = await supabase
        .from('medication_logs')
        .select('id')
        .eq('medication_id', med.medication_id)
        .eq('senior_id', med.senior_id)
        .gte('scheduled_time', startOfDay.toISOString())
        .lte('scheduled_time', endOfDay.toISOString())
        .single()

      if (!existingLog) {
        // Create medication log entry
        const { error: logError } = await supabase
          .from('medication_logs')
          .insert({
            medication_id: med.medication_id,
            senior_id: med.senior_id,
            scheduled_time: scheduledTime.toISOString(),
            status: 'pending'
          })

        if (logError) {
          console.error('Error creating medication log:', logError)
        }

        // Create notification for guardian
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            type: 'medication_reminder',
            title: `💊 Medicine Time for ${med.senior_name}`,
            message: `${med.medication_name} (${med.dosage}) is due at ${med.scheduled_time}`,
            senior_id: med.senior_id,
            urgency_level: 2
          })

        if (notifError) {
          console.error('Error creating notification:', notifError)
        }

        console.log(`Created reminder for ${med.medication_name} for ${med.senior_name}`)
      }
    }

    // Check for missed medications (pending logs older than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const { data: missedLogs } = await supabase
      .from('medication_logs')
      .select(`
        id,
        medication_id,
        senior_id,
        scheduled_time,
        medications!inner(name, dosage),
        seniors!inner(name, guardian_email)
      `)
      .eq('status', 'pending')
      .lt('scheduled_time', oneHourAgo.toISOString())

    // Update missed medications to 'missed' status
    for (const log of missedLogs || []) {
      await supabase
        .from('medication_logs')
        .update({ status: 'missed' })
        .eq('id', log.id)

      const med = log.medications as any
      const senior = log.seniors as any
      
      // Create urgent notification for missed medication
      await supabase
        .from('notifications')
        .insert({
          type: 'medication_missed',
          title: `⚠️ Missed Medicine Alert`,
          message: `${senior?.name} missed ${med?.name} (${med?.dosage}) scheduled at ${new Date(log.scheduled_time).toLocaleTimeString()}`,
          senior_id: log.senior_id,
          urgency_level: 1
        })

      console.log(`Marked medication as missed: ${med?.name} for ${senior?.name}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        medications_due: medicationsDue.length,
        missed_updated: missedLogs?.length || 0,
        checked_at: istTime.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Medication reminder error:', error)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
