const OpenAI = require('openai');
const { SYSTEM_PROMPT, buildUserPrompt } = require('./aiPrompts');

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

async function getRecommendationsFromAI({ skinType, concern, freeText, catalog }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in .env file');
  }

  const userPrompt = buildUserPrompt({ skinType, concern, freeText, catalog });

  console.log('\n========== 🤖 AI REQUEST ==========');
  console.log('skinType:', skinType, '| concern:', concern, '| freeText:', freeText || '(none)');
  console.log('catalog size:', catalog.length);
  console.log('===================================\n');

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.6,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  console.log('🤖 AI RAW RESPONSE:\n', raw, '\n');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error('❌ JSON parse failed:', err.message);
    throw new Error('The AI returned an invalid response');
  }

  // Enrich AI recommendations with full product data from catalog
  const catalogById = new Map(catalog.map((p) => [Number(p.id), p]));
  const catalogByName = new Map(catalog.map((p) => [String(p.name).toLowerCase().trim(), p]));

  const rawRecs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  let recommendations = rawRecs
    .map((rec) => {
      let product = catalogById.get(Number(rec.productId));
      // Fallback: AI returned a bad id but a real name
      if (!product && rec.name) {
        product = catalogByName.get(String(rec.name).toLowerCase().trim());
      }
      if (!product) {
        console.warn('⚠️  AI returned unknown product:', rec.productId, rec.name);
        return null;
      }
      return { product, reason: rec.reason || '' };
    })
    .filter(Boolean);

  // Final safety net: if AI failed entirely, fill from catalog by skin type / concern
  if (recommendations.length === 0) {
    console.warn('⚠️  AI returned 0 valid products — falling back to filtered catalog.');
    const fallback = catalog
      .filter(p =>
        (!skinType || !p.skinType || String(p.skinType).toLowerCase().includes(String(skinType).toLowerCase())) &&
        (!concern  || !p.concern  || String(p.concern ).toLowerCase().includes(String(concern ).toLowerCase()))
      )
      .slice(0, 4);
    recommendations = fallback.map(product => ({
      product,
      reason: `Selected for ${skinType} skin with focus on ${concern}.`,
    }));
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
    recommendations,
  };
}

module.exports = { getRecommendationsFromAI };
