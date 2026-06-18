const OpenAI = require('openai');
const { SYSTEM_PROMPT, buildUserPrompt } = require('./aiPrompts');

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

async function getRecommendationsFromAI({ skinType, concern, freeText, catalog }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY חסר בקובץ .env');
  }

  const userPrompt = buildUserPrompt({ skinType, concern, freeText, catalog });

  console.log('\n========== 🤖 AI REQUEST ==========');
  console.log('SYSTEM:', SYSTEM_PROMPT.substring(0, 100) + '...');
  console.log('USER:', userPrompt.substring(0, 300) + '...');
  console.log('===================================\n');

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  console.log('🤖 AI RAW RESPONSE:', raw.substring(0, 300) + '...\n');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('❌ JSON parse failed:', err.message);
    throw new Error('ה-AI החזיר תשובה לא תקינה');
  }

  return {
    skinType,
    concern,
    freeText: freeText || '',
    summary: parsed.summary || '',
    routine: {
      morning: Array.isArray(parsed.routine?.morning) ? parsed.routine.morning : [],
      evening: Array.isArray(parsed.routine?.evening) ? parsed.routine.evening : [],
    },
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  };
}

module.exports = { getRecommendationsFromAI };
