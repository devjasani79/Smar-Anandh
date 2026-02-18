import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail(to: string, subject: string, html: string) {
  const GMAIL_USER = 'devjasani79@gmail.com'
  const GMAIL_PASS = Deno.env.get('GMAIL_APP_PASSWORD')!

  // Use Gmail SMTP via a raw fetch to a mail-sending API
  // Since Deno edge functions can't use nodemailer directly,
  // we'll use the Gmail SMTP relay via base64 encoded credentials
  const credentials = btoa(`${GMAIL_USER}:${GMAIL_PASS}`)

  // Using a simple SMTP-to-HTTP bridge approach via Google's SMTP
  // We'll construct the email and send via fetch to a lightweight mail service
  // Alternative: Use Supabase's built-in email or a simple fetch-based approach

  // For edge functions, we use the resend-compatible approach with raw SMTP
  const emailPayload = {
    from: `SmarAnandh <${GMAIL_USER}>`,
    to: [to],
    subject,
    html,
  }

  // Send via Google SMTP using Deno's smtp client
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
    to: to,
    subject: subject,
    content: "text/html",
    html: html,
  })

  await client.close()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { guardian_email, guardian_name, guardian_phone, senior_name, senior_preferred_name, family_pin } = await req.json()

    if (!guardian_email) {
      return new Response(
        JSON.stringify({ error: 'Missing guardian_email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FFF8F0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #FF9933, #FF6B00); border-radius: 16px 16px 0 0; }
        .header h1 { color: white; font-size: 28px; margin: 0; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; }
        .body { background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .info-card { background: #FFF8F0; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF9933; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0e6d6; }
        .info-label { color: #6D6D6D; font-size: 14px; }
        .info-value { color: #1A1A1A; font-weight: 600; }
        .pin-box { text-align: center; background: #2E7D32; color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .pin-box .pin { font-size: 36px; letter-spacing: 12px; font-weight: 700; }
        .footer { text-align: center; padding: 20px; color: #6D6D6D; font-size: 13px; }
        .cta-button { display: inline-block; background: #FF9933; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 Welcome to SmarAnandh</h1>
          <p>Your elder care companion is ready</p>
        </div>
        <div class="body">
          <p>Namaste <strong>${guardian_name || 'Guardian'}</strong>,</p>
          <p>Thank you for registering with SmarAnandh! Your account has been set up successfully. Here are your details:</p>
          
          <div class="info-card">
            <h3 style="margin-top:0;color:#FF9933;">👤 Guardian Details</h3>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${guardian_name || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">${guardian_email}</span>
            </div>
            <div class="info-row" style="border:none;">
              <span class="info-label">Phone</span>
              <span class="info-value">${guardian_phone || 'N/A'}</span>
            </div>
          </div>
          
          <div class="info-card">
            <h3 style="margin-top:0;color:#2E7D32;">🧓 Senior Details</h3>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${senior_name || 'N/A'}</span>
            </div>
            <div class="info-row" style="border:none;">
              <span class="info-label">Preferred Name</span>
              <span class="info-value">${senior_preferred_name || senior_name || 'N/A'}</span>
            </div>
          </div>
          
          <div class="pin-box">
            <p style="margin:0 0 8px;font-size:14px;opacity:0.9;">🔑 Family PIN for Senior Login</p>
            <div class="pin">${family_pin || '****'}</div>
            <p style="margin:8px 0 0;font-size:13px;opacity:0.8;">Senior uses your phone number + this PIN to access the app</p>
          </div>
          
          <p style="color:#6D6D6D;font-size:14px;">
            <strong>How Senior Login Works:</strong><br/>
            1. Senior opens the app and selects "Senior Login"<br/>
            2. Enters your phone number: <strong>${guardian_phone || 'your number'}</strong><br/>
            3. Enters the Family PIN shown above<br/>
            4. They're in! Simple and secure.
          </p>
          
          <div style="text-align:center;">
            <a href="https://smaranandh.lovable.app" class="cta-button">Open SmarAnandh →</a>
          </div>
        </div>
        <div class="footer">
          <p>Made with ❤️ in India for Indian families</p>
          <p>© 2026 SmarAnandh. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `

    await sendEmail(guardian_email, '🙏 Welcome to SmarAnandh — Your Setup is Complete!', html)

    return new Response(
      JSON.stringify({ success: true, message: 'Welcome email sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email send error:', error)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
