import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function buildWelcomeHtml(data: {
  guardian_name?: string;
  guardian_email: string;
  guardian_phone?: string;
  senior_name?: string;
  senior_preferred_name?: string;
  family_pin?: string;
}) {
  const { guardian_name, guardian_email, guardian_phone, senior_name, senior_preferred_name, family_pin } = data;
  const name = guardian_name || 'there';
  const appUrl = 'https://smaranandh.lovable.app';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#FFF8F0;margin:0;padding:0;color:#333}
  .wrap{max-width:620px;margin:0 auto;padding:24px 16px}
  .header{text-align:center;padding:32px 24px;background:linear-gradient(135deg,#FF9933,#FF6B00);border-radius:16px 16px 0 0}
  .header h1{color:#fff;font-size:26px;margin:0}
  .header p{color:rgba(255,255,255,.9);margin:8px 0 0;font-size:15px}
  .body{background:#fff;padding:28px 24px;border-radius:0 0 16px 16px;box-shadow:0 4px 20px rgba(0,0,0,.06)}
  .section{background:#FFF8F0;border-radius:12px;padding:20px;margin:18px 0;border-left:4px solid #FF9933}
  .section h3{margin:0 0 12px;color:#FF9933;font-size:16px}
  .section.green{border-left-color:#2E7D32}
  .section.green h3{color:#2E7D32}
  .section.blue{border-left-color:#1565C0}
  .section.blue h3{color:#1565C0}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0e6d6;font-size:14px}
  .row:last-child{border:none}
  .row .label{color:#888}
  .row .val{font-weight:600;color:#1A1A1A}
  .pin-box{text-align:center;background:#2E7D32;color:#fff;padding:20px;border-radius:12px;margin:18px 0}
  .pin-box .pin{font-size:36px;letter-spacing:12px;font-weight:700}
  .btn{display:inline-block;background:#FF9933;color:#fff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:600;font-size:16px;margin:8px 4px}
  .btn.outline{background:transparent;border:2px solid #FF9933;color:#FF9933}
  .step{display:flex;gap:12px;margin:10px 0;align-items:flex-start}
  .step-num{width:28px;height:28px;border-radius:50%;background:#FF9933;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
  .step-text{font-size:14px;line-height:1.5}
  .feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
  .feature-card{background:#FFF8F0;border-radius:10px;padding:14px;text-align:center}
  .feature-card .emoji{font-size:28px;margin-bottom:6px}
  .feature-card .title{font-weight:700;font-size:13px;color:#1A1A1A}
  .feature-card .desc{font-size:11px;color:#888;margin-top:4px}
  .footer{text-align:center;padding:24px 16px;color:#888;font-size:12px}
  .divider{height:1px;background:#f0e6d6;margin:24px 0}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🙏 Namaste, ${name}!</h1>
    <p>Welcome to the SmarAnandh family</p>
  </div>
  <div class="body">
    <p style="font-size:16px;line-height:1.6">Thank you for joining <strong>SmarAnandh</strong> — India's first digital companion designed exclusively for senior care. You've just taken the most important step toward ensuring your loved ones are safe, healthy, and happy.</p>

    <!-- Mission & Vision -->
    <div class="section blue">
      <h3>🎯 Our Mission</h3>
      <p style="font-size:14px;line-height:1.6;margin:0">To empower every Indian family with technology that makes elder care effortless, dignified, and joyful. We believe no senior should feel forgotten, and no family should feel helpless.</p>
      <p style="font-size:14px;line-height:1.6;margin:10px 0 0"><strong>Our Vision:</strong> A world where 140M+ Indian seniors live independently with confidence, connected to their families through intuitive technology they actually enjoy using.</p>
    </div>

    <!-- Guardian Details -->
    <div class="section">
      <h3>👤 Your Guardian Profile</h3>
      <div class="row"><span class="label">Name</span><span class="val">${guardian_name || 'N/A'}</span></div>
      <div class="row"><span class="label">Email</span><span class="val">${guardian_email}</span></div>
      <div class="row"><span class="label">Phone</span><span class="val">${guardian_phone || 'Not set'}</span></div>
    </div>

    ${senior_name ? `
    <div class="section green">
      <h3>🧓 Senior Profile</h3>
      <div class="row"><span class="label">Name</span><span class="val">${senior_name}</span></div>
      <div class="row"><span class="label">Known As</span><span class="val">${senior_preferred_name || senior_name}</span></div>
    </div>
    ` : ''}

    ${family_pin ? `
    <div class="pin-box">
      <p style="margin:0 0 8px;font-size:14px;opacity:.9">🔑 Family PIN for Senior Login</p>
      <div class="pin">${family_pin}</div>
      <p style="margin:8px 0 0;font-size:12px;opacity:.8">Senior uses your phone number + this PIN</p>
    </div>
    ` : ''}

    <div class="divider"></div>

    <h3 style="text-align:center;color:#1A1A1A;margin-bottom:4px">✨ What SmarAnandh Does</h3>
    <p style="text-align:center;color:#888;font-size:13px;margin-top:0">Everything your parents need, nothing they don't</p>
    <div class="feature-grid">
      <div class="feature-card"><div class="emoji">💊</div><div class="title">Dawa Yaad</div><div class="desc">Smart medicine reminders in Hindi with visual pill ID</div></div>
      <div class="feature-card"><div class="emoji">😊</div><div class="title">Khushi Corner</div><div class="desc">Bhajans, Ramayan, photo albums & brain games</div></div>
      <div class="feature-card"><div class="emoji">👨‍👩‍👧</div><div class="title">Parivaar Connect</div><div class="desc">One-tap family calls with big photo tiles</div></div>
      <div class="feature-card"><div class="emoji">🛡️</div><div class="title">Guardian Dashboard</div><div class="desc">Real-time medication logs & activity monitoring</div></div>
    </div>

    <div class="divider"></div>

    <h3 style="color:#1A1A1A;margin-bottom:12px">📋 Quick Setup Guide</h3>
    <div class="step"><div class="step-num">1</div><div class="step-text"><strong>Add Your Senior's Profile</strong> — Name, photo, language preference.</div></div>
    <div class="step"><div class="step-num">2</div><div class="step-text"><strong>Set Up Medicines</strong> — Add medications with dosage & timing.</div></div>
    <div class="step"><div class="step-num">3</div><div class="step-text"><strong>Create a Family PIN</strong> — A simple 4-digit code for senior login.</div></div>
    <div class="step"><div class="step-num">4</div><div class="step-text"><strong>Add Family Members</strong> — Photos & phone numbers for one-tap calling.</div></div>
    <div class="step"><div class="step-num">5</div><div class="step-text"><strong>Hand Over the Phone</strong> — Open Senior Mode. Big buttons, Hindi labels.</div></div>

    <div class="divider"></div>

    <div style="text-align:center;margin:20px 0">
      <p style="font-size:15px;font-weight:600;color:#1A1A1A;margin-bottom:14px">🚀 Get Started Now</p>
      <a href="${appUrl}/auth" class="btn">Open Guardian Dashboard →</a>
      <br/>
      <a href="${appUrl}/senior/auth" class="btn outline">Open Senior Mode 🙏</a>
    </div>

    <div class="divider"></div>

    <div class="section" style="border-left-color:#6D4C41">
      <h3 style="color:#6D4C41">📞 Need Help?</h3>
      <p style="font-size:14px;line-height:1.6;margin:0">We're here for you — just like you're there for your parents.</p>
      <p style="font-size:14px;margin:8px 0 0">
        📧 <strong>Email:</strong> <a href="mailto:devjasani79@gmail.com" style="color:#FF9933">devjasani79@gmail.com</a><br/>
        🌐 <strong>Website:</strong> <a href="${appUrl}" style="color:#FF9933">smaranandh.lovable.app</a>
      </p>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.6;margin-top:20px;text-align:center">
      <em>"Seva hi sabse bada dharma hai"</em> — Service is the highest duty.<br/>
      Thank you for choosing to serve your elders with love and technology. 🙏
    </p>
  </div>
  <div class="footer">
    <p>Made with ❤️ in India for Indian families</p>
    <p>© 2026 SmarAnandh. All rights reserved.</p>
    <p style="font-size:11px;margin-top:8px">You're receiving this because you signed up at smaranandh.lovable.app</p>
  </div>
</div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json()

    if (!payload.guardian_email) {
      return new Response(
        JSON.stringify({ error: 'Missing guardian_email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const html = buildWelcomeHtml(payload)
    const subject = '🙏 Welcome to SmarAnandh — Your Elder Care Journey Begins!'

    const GMAIL_USER = 'devjasani79@gmail.com'
    const GMAIL_PASS = Deno.env.get('GMAIL_APP_PASSWORD')

    if (!GMAIL_PASS) {
      throw new Error('GMAIL_APP_PASSWORD is not configured')
    }

    // Use nodemailer via npm: specifier (compatible with Deno edge runtime)
    const nodemailer = await import("npm:nodemailer@6.9.12")

    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"SmarAnandh" <${GMAIL_USER}>`,
      to: payload.guardian_email,
      subject,
      html,
    })

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
