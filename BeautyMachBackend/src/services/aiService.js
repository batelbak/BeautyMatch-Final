// src/services/aiService.js
const Groq = require('groq-sdk');
const { SYSTEM_PROMPT, buildUserPrompt } = require('./aiPrompts');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Asks the AI for a personalized routine, then enriches the response
 * with full product data from the catalog so the frontend can render
 * { product, reason } cards directly.
 */
async function getRecommendationsFromAI({ skinType, concern, freeText, catalog }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  // Lookup maps for enrichment + fallback
  const byId = new Map(catalog.map((p) => [String(p.id), p]));
  const byName = new Map(catalog.map((p) => [String(p.name).toLowerCase().trim(), p]));

  // Trim catalog to keep the prompt small
  const slimCatalog = catalog.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    skinType: p.skinType,
    concern: p.concern,
    price: p.price,
    description: (p.description || '').slice(0, 160),
  }));

  const userPrompt = buildUserPrompt({ skinType, concern, freeText, catalog: slimCatalog });

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  console.log('\n=================================');
  console.log('🤖 AI RAW RESPONSE:', raw);
  console.log('=================================\n');

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('❌ Failed to parse AI JSON:', e.message);
    parsed = {};
  }

  const summary = parsed.summary || '';
  const routine = {
    morning: Array.isArray(parsed.routine?.morning) ? parsed.routine.morning : [],
    evening: Array.isArray(parsed.routine?.evening) ? parsed.routine.evening : [],
  };

  // Enrich AI recommendations -> { product, reason }
  const aiRecs = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
  const enriched = [];
  const seenIds = new Set();

  for (const rec of aiRecs) {
    let product = null;
    if (rec.productId != null && byId.has(String(rec.productId))) {
      product = byId.get(String(rec.productId));
    } else if (rec.name && byName.has(String(rec.name).toLowerCase().trim())) {
      product = byName.get(String(rec.name).toLowerCase().trim());
    }
    if (product && !seenIds.has(product.id)) {
      seenIds.add(product.id);
      enriched.push({
        product,
        reason: rec.reason || 'Recommended based on your skin profile.',
      });
    }
  }

  // Fallback: if AI returned 0 valid products, filter catalog by skinType/concern
  if (enriched.length === 0) {
    console.warn('⚠️ AI returned no valid products — using catalog fallback');
    const matches = catalog.filter((p) => {
      const stOk =
        !p.skinType ||
        String(p.skinType).toLowerCase() === String(skinType).toLowerCase() ||
        String(p.skinType).toLowerCase() === 'all';
      const cOk =
        !p.concern ||
        String(p.concern).toLowerCase().includes(String(concern).toLowerCase());
      return stOk || cOk;
    });
    for (const product of matches.slice(0, 4)) {
      enriched.push({
        product,
        reason: `Selected for ${skinType} skin with focus on ${concern}.`,
      });
    }
  }

  const result = {
    summary,
    routine,
    recommendations: enriched,
    freeText: freeText || '',
  };

  console.log('📦 FINAL RESPONSE SENT TO FRONTEND:');
  console.log(JSON.stringify({
    summary: (result.summary || '').slice(0, 80) + '...',
    morningSteps: result.routine.morning.length,
    eveningSteps: result.routine.evening.length,
    productCount: result.recommendations.length,
    productNames: result.recommendations.map((r) => r.product.name),
  }, null, 2));

  return result;
}

module.exports = { getRecommendationsFromAI };
