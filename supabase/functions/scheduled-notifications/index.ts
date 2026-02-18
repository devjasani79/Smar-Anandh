import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const results: string[] = []

    // 1. MEDICATION REMINDERS — Check for active medications due now
    const { data: allSeniors } = await supabase
      .from('seniors')
      .select('id, name, preferred_name')
    
    if (allSeniors) {
      for (const senior of allSeniors) {
        // Get active medications for this senior
        const { data: meds } = await supabase
          .from('medications')
          .select('id, name, dosage, times')
          .eq('senior_id', senior.id)
          .eq('is_active', true)

        if (!meds || meds.length === 0) continue

        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        for (const med of meds) {
          const times = Array.isArray(med.times) ? med.times as string[] : []
          
          for (const time of times) {
            const [h, m] = time.split(':').map(Number)
            // Check if this medication time is within the current 3-hour window
            const timeDiffMinutes = (currentHour * 60 + currentMinute) - (h * 60 + (m || 0))
            
            if (timeDiffMinutes >= 0 && timeDiffMinutes <= 180) {
              // Check if already taken today
              const todayStart = new Date(now)
              todayStart.setHours(0, 0, 0, 0)
              
              const { data: logs } = await supabase
                .from('medication_logs')
                .select('id, status')
                .eq('medication_id', med.id)
                .eq('senior_id', senior.id)
                .gte('scheduled_time', todayStart.toISOString())
                .eq('status', 'taken')

              if (!logs || logs.length === 0) {
                // Get guardian for notification
                const { data: link } = await supabase
                  .from('guardian_senior_links')
                  .select('guardian_id')
                  .eq('senior_id', senior.id)
                  .eq('is_primary', true)
                  .maybeSingle()

                if (link) {
                  // Create missed/reminder notification
                  await supabase.from('notifications').insert({
                    senior_id: senior.id,
                    guardian_id: link.guardian_id,
                    type: 'medication_reminder',
                    title: `💊 Medicine Reminder: ${med.name}`,
                    message: `${senior.preferred_name || senior.name} hasn't taken ${med.name} (${med.dosage}) scheduled for ${time}`,
                    urgency_level: timeDiffMinutes > 60 ? 2 : 3,
                  })
                  results.push(`Reminder: ${senior.name} - ${med.name} at ${time}`)
                }
              }
            }
          }
        }
      }
    }

    // 2. INACTIVITY CHECK — If no activity in 3+ hours during daytime
    if (allSeniors) {
      for (const senior of allSeniors) {
        const currentHour = now.getHours()
        // Only check during waking hours (7am - 10pm)
        if (currentHour < 7 || currentHour > 22) continue

        const { data: recentActivity } = await supabase
          .from('activity_logs')
          .select('id')
          .eq('senior_id', senior.id)
          .gte('logged_at', threeHoursAgo.toISOString())
          .limit(1)

        if (!recentActivity || recentActivity.length === 0) {
          const { data: link } = await supabase
            .from('guardian_senior_links')
            .select('guardian_id')
            .eq('senior_id', senior.id)
            .eq('is_primary', true)
            .maybeSingle()

          if (link) {
            await supabase.from('notifications').insert({
              senior_id: senior.id,
              guardian_id: link.guardian_id,
              type: 'inactivity_check',
              title: `🔔 Check on ${senior.preferred_name || senior.name}`,
              message: `No activity detected for ${senior.preferred_name || senior.name} in the last 3 hours. Consider checking in.`,
              urgency_level: 3,
            })
            results.push(`Inactivity alert: ${senior.name}`)
          }
        }
      }
    }

    // 3. ACTIVITY SUGGESTIONS — Suggest joy activities periodically
    if (allSeniors) {
      const suggestions = [
        '🎵 How about some morning bhajans? Open Khushi > Suno for devotional music.',
        '🧠 Keep the mind sharp! Play a memory game in Khushi > Khelo.',
        '📺 Watch a relaxing nature video in Khushi > Dekho.',
        '📞 Call a family member today. Open Parivaar to connect.',
        '🙏 Time for evening aarti! Open Khushi > Suno for bhajans.',
        '📸 Look at family photos in Khushi > Yaadein for happy memories.',
      ]
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]

      for (const senior of allSeniors) {
        const { data: link } = await supabase
          .from('guardian_senior_links')
          .select('guardian_id')
          .eq('senior_id', senior.id)
          .eq('is_primary', true)
          .maybeSingle()

        if (link) {
          await supabase.from('notifications').insert({
            senior_id: senior.id,
            guardian_id: link.guardian_id,
            type: 'activity_suggestion',
            title: '✨ Activity Suggestion',
            message: `For ${senior.preferred_name || senior.name}: ${randomSuggestion}`,
            urgency_level: 4,
          })
          results.push(`Activity suggestion sent for: ${senior.name}`)
        }
      }
    }

    // 4. SEND EMAIL DIGEST TO GUARDIANS (summary of notifications)
    const GMAIL_USER = 'devjasani79@gmail.com'
    const GMAIL_PASS = Deno.env.get('GMAIL_APP_PASSWORD')

    if (GMAIL_PASS && allSeniors) {
      // Get unique guardians
      const { data: links } = await supabase
        .from('guardian_senior_links')
        .select('guardian_id')
        .eq('is_primary', true)

      if (links) {
        const guardianIds = [...new Set(links.map(l => l.guardian_id))]
        
        for (const guardianId of guardianIds) {
          // Get unread notifications count
          const { count } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('guardian_id', guardianId)
            .eq('is_read', false)

          if (count && count > 0) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', guardianId)
              .maybeSingle()

            // Get guardian email from auth
            const { data: { user } } = await supabase.auth.admin.getUserById(guardianId)
            
            if (user?.email) {
              try {
                const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts")
                const client = new SmtpClient()
                await client.connectTLS({
                  hostname: "smtp.gmail.com",
                  port: 465,
                  username: GMAIL_USER,
                  password: GMAIL_PASS,
                })

                await client.send({
                  from: GMAIL_USER,
                  to: user.email,
                  subject: `🔔 SmarAnandh: ${count} unread notification${count > 1 ? 's' : ''}`,
                  content: "text/html",
                  html: `
                    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                      <h2 style="color:#FF9933;">🙏 SmarAnandh Update</h2>
                      <p>Hi ${profile?.full_name || 'Guardian'},</p>
                      <p>You have <strong>${count} unread notification${count > 1 ? 's' : ''}</strong> waiting for you.</p>
                      <p>Open the app to review medication status, activity updates, and more.</p>
                      <a href="https://smaranandh.lovable.app/guardian" 
                         style="display:inline-block;background:#FF9933;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
                        Open Dashboard →
                      </a>
                      <p style="color:#6D6D6D;font-size:12px;margin-top:20px;">Made with ❤️ by SmarAnandh</p>
                    </div>
                  `,
                })
                await client.close()
                results.push(`Email digest sent to ${user.email}`)
              } catch (emailErr) {
                console.error('Email digest error:', emailErr)
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: now.toISOString(),
        actions: results.length,
        details: results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Scheduled notifications error:', error)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
