import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


let twilioClient = null;
  if (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio SMS enabled');
  } else {
    console.log('Twilio not configured — SMS disabled');
  }

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─────────────────────────────────────────────
// AI HELPER — OpenRouter free tier
// ─────────────────────────────────────────────
async function callAI(prompt, maxTokens = 400) {
  console.log('[callAI] Sending request to OpenRouter, model=google/gemma-3-4b-it:free, apiKeyPresent=', !!process.env.OPENROUTER_API_KEY);
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Cura AI'
    },
    body: JSON.stringify({
      model: 'google/gemma-3-4b-it:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens
    })
  });
  console.log('[callAI] OpenRouter HTTP status:', res.status);
  const data = await res.json();
  console.log('[callAI] OpenRouter response body:', JSON.stringify(data));
  if (data.error) {
    console.log('[callAI] THROW — OpenRouter returned error:', JSON.stringify(data.error));
    throw new Error(data.error.message);
  }
  return data.choices[0].message.content;
}

// ─────────────────────────────────────────────
// HELPER: fetch patient context from Supabase
// ─────────────────────────────────────────────
async function getPatientContext(patientId) {
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
  
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, preferred_language')
      .eq('id', patientId)
      .single();
  
    let doctorProfile = null;
    if (patient?.assigned_doctor_id) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', patient.assigned_doctor_id)
        .single();
      doctorProfile = data;
    }
  
    const { data: timeline } = await supabase
      .from('health_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(10);
  
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: false })
      .limit(3);
  
    return {
      patient: patient ? {
        ...patient,
        profiles: profile,
        assigned_doctor: doctorProfile
      } : null,
      timeline: timeline || [],
      appointments: appointments || []
    };
  }

// ─────────────────────────────────────────────
// ENDPOINT 1: AI ADVICE FOR PATIENT
// POST /api/ai-advice
// ─────────────────────────────────────────────
app.post('/api/ai-advice', async (req, res) => {
    try {
      const { patientId, structuredInput, language } = req.body;
      
      console.log('ai-advice called with patientId:', patientId);
      
      // Test direct query first
      const { data: directPatient, error: directError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      console.log('directPatient:', JSON.stringify(directPatient));
      console.log('directError:', JSON.stringify(directError));
  
      if (!directPatient) {
        console.log('[ai-advice] RETURN 404 — directPatient is null. directError:', JSON.stringify(directError));
        return res.status(404).json({
          error: `Patient not found. ID: ${patientId}, DB error: ${directError?.message}`
        });
      }

      console.log('[ai-advice] Patient found, calling getPatientContext...');
      const { patient, timeline, appointments } = await getPatientContext(patientId);
      const context = buildContextString(patient, timeline, appointments);
      const respondInLang = language === 'es' ? 'Spanish' : 'English';
  
      const prompt = `
  You are Cura AI, a compassionate chronic care assistant for rural Arizona patients.
  You are NOT a doctor and cannot diagnose. Provide supportive, personalized guidance only.
  
  PATIENT CONTEXT:
  ${context}
  
  PATIENT REPORT:
  ${structuredInput}
  
  INSTRUCTIONS:
  - Respond in ${respondInLang}
  - Keep response under 120 words
  - Reference the patient's specific conditions and medications by name
  - If symptoms are severe (7+ out of 10) or include chest pain or shortness of breath, strongly advise contacting their doctor or calling 911
  - Be warm and supportive, not clinical
  - End with one concrete next step
  - Do NOT start your response with "I"
  - Do NOT include any disclaimers about being an AI
      `.trim();
  
      console.log('[ai-advice] Calling callAI...');
      const response = await callAI(prompt, 300);
      console.log('[ai-advice] callAI returned successfully, response length:', response?.length);

      const flagged =
        structuredInput.toLowerCase().includes('chest pain') ||
        structuredInput.toLowerCase().includes('shortness of breath') ||
        structuredInput.includes('severity: 9') ||
        structuredInput.includes('severity: 10');
  
      await supabase.from('health_timeline').insert({
        patient_id: patientId,
        event_type: 'ai_advice',
        content: {
          response_en: language === 'en' ? response : null,
          response_es: language === 'es' ? response : null,
          flagged,
          structured_input: structuredInput
        },
        created_by: null
      });
  
      res.json({ response, flagged });
    } catch (err) {
      console.error('[ai-advice] CATCH — error thrown:', err.message);
      console.error('[ai-advice] Stack:', err.stack);
      res.status(500).json({ error: err.message });
    }
  });

// ─────────────────────────────────────────────
// ENDPOINT 2: PATIENT SUMMARY FOR DOCTOR
// POST /api/ai-summary
// ─────────────────────────────────────────────
app.post('/api/ai-summary', async (req, res) => {
  try {
    const { patientId } = req.body;
    const { patient, timeline, appointments } = await getPatientContext(patientId);
    const context = buildContextString(patient, timeline, appointments);

    const prompt = `
You are a clinical AI assistant for Banner University Family Care.
Generate a concise structured patient summary for the attending physician.

PATIENT DATA:
${context}

Write a clinical summary in this exact format with these exact headers:

PATIENT OVERVIEW
[Name, age, primary conditions in one sentence]

CURRENT MEDICATIONS
[Bullet list of medications with doses]

RECENT ACTIVITY
[2-3 sentences summarizing recent health events]

FLAGGED CONCERNS
[Any patterns, missed medications, escalating symptoms — or write "None identified"]

RECOMMENDATION
[One clinical recommendation for the physician]

Keep it factual and professional. Under 200 words total.
    `.trim();

    const summary = await callAI(prompt, 400);
    res.json({ summary });
  } catch (err) {
    console.error('ai-summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ENDPOINT 3: PRE-APPOINTMENT BRIEF
// POST /api/ai-brief
// ─────────────────────────────────────────────
app.post('/api/ai-brief', async (req, res) => {
  try {
    const { patientId, appointmentId } = req.body;
    const { patient, timeline, appointments } = await getPatientContext(patientId);
    const context = buildContextString(patient, timeline, appointments);

    const prompt = `
You are a clinical AI assistant for Banner University Family Care.
Generate a pre-appointment brief for the physician — one paragraph they can read in 30 seconds before the visit.

PATIENT DATA:
${context}

Write ONE paragraph (60-80 words) covering:
- Who the patient is and their primary conditions
- The most important thing from the last 30 days
- Any flagged symptoms or missed medications
- What to focus on in this appointment

Be direct and clinical. No headers. One clean paragraph only.
    `.trim();

    const brief = await callAI(prompt, 200);

    if (appointmentId) {
      await supabase
        .from('appointments')
        .update({ ai_brief: brief })
        .eq('id', appointmentId);
    }

    res.json({ brief });
  } catch (err) {
    console.error('ai-brief error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// ENDPOINT 4: TWILIO SMS INBOUND WEBHOOK
// POST /api/sms/inbound
// ─────────────────────────────────────────────
app.post('/api/sms/inbound', async (req, res) => {
  try {
    const { From, Body } = req.body;
    const incomingText = Body?.trim();
    const fromPhone = From;

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_language')
      .eq('phone', fromPhone)
      .single();

    await supabase.from('sms_messages').insert({
      phone_number: fromPhone,
      direction: 'inbound',
      body: incomingText,
      linked_patient_id: profile?.id || null
    });

    let replyText = '';

    if (!profile) {
      replyText = 'Welcome to Cura AI. We could not find your account. Please contact your Banner provider to get registered.';
    } else {
      const lang = profile.preferred_language || 'en';
      const patientId = profile.id;
      const lowerText = incomingText.toLowerCase();

      if (
        lowerText.includes('ride') ||
        lowerText.includes('viaje') ||
        lowerText.includes('transporte')
      ) {
        await supabase.from('ride_requests').insert({
          patient_id: patientId,
          requested_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          pickup_address: 'Address on file',
          destination: 'Banner University Medical Center, Tucson, AZ',
          status: 'open'
        });

        const { data: drivers } = await supabase
          .from('profiles')
          .select('phone')
          .eq('role', 'volunteer_driver')
          .not('phone', 'is', null);

        for (const driver of drivers || []) {
          if (twilioClient) {
            await twilioClient.messages.create({
              body: 'Cura AI: A patient needs a ride. Open the Cura AI app to accept.',
              from: process.env.TWILIO_PHONE_NUMBER,
              to: driver.phone
            });
          }
        }

        replyText = lang === 'es'
          ? 'Cura AI: Tu solicitud de viaje fue enviada. Un voluntario te contactara pronto.'
          : 'Cura AI: Your ride request was sent. A volunteer will contact you soon.';

      } else if (['yes', 'si', 'sí', 'no'].includes(lowerText)) {
        const taken = ['yes', 'si', 'sí'].includes(lowerText);

        await supabase.from('health_timeline').insert({
          patient_id: patientId,
          event_type: 'sms_checkin',
          content: {
            message: incomingText,
            parsed: { adherence: taken, source: 'sms' }
          },
          created_by: patientId
        });

        replyText = lang === 'es'
          ? (taken
            ? 'Cura AI: Perfecto, gracias por confirmar. Sigue asi!'
            : 'Cura AI: Recuerda tomar tus medicamentos. Cudate mucho.')
          : (taken
            ? 'Cura AI: Great, thanks for confirming! Keep it up!'
            : 'Cura AI: Please remember to take your medications. Take care.');

      } else {
        const { patient, timeline, appointments } = await getPatientContext(patientId);
        const context = buildContextString(patient, timeline, appointments);

        const prompt = `
You are Cura AI, a care assistant responding via SMS to a rural Arizona patient.
Keep your response under 140 characters. Respond in ${lang === 'es' ? 'Spanish' : 'English'}.

PATIENT CONTEXT:
${context}

PATIENT SAYS: "${incomingText}"

Give personalized, warm guidance referencing their specific conditions.
If they mention chest pain or cannot breathe, tell them to call 911 immediately.
End with a simple yes/no question they can reply to.
        `.trim();

        const aiReply = await callAI(prompt, 100);
        replyText = `Cura AI: ${aiReply}`;

        await supabase.from('health_timeline').insert({
          patient_id: patientId,
          event_type: 'sms_checkin',
          content: {
            message: incomingText,
            parsed: { source: 'sms', language: lang },
            ai_response: replyText
          },
          created_by: patientId
        });
      }
    }

    if (twilioClient) {
      await twilioClient.messages.create({
        body: replyText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: fromPhone
      });
    }

    await supabase.from('sms_messages').insert({
      phone_number: fromPhone,
      direction: 'outbound',
      body: replyText,
      linked_patient_id: profile?.id || null
    });

    res.status(200).send('<Response></Response>');
    } catch (err) {
    console.error('sms/inbound error FULL:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });
  
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION:', err);
  });

app.listen(PORT, () => {
  console.log(`Cura AI backend running on http://localhost:${PORT}`);
});