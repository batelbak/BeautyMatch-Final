//const { GoogleGenerativeAI } = require('@google/generative-ai');
//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//
//async function getRecommendationsFromAI({ skinType, concern, catalog }) {
//  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//
//  const catalogText = catalog
//    .map((p) => `- id:${p.id} | ${p.name} (${p.brand}) | ${p.category} | ${p.price}₪ | skin:${p.skinType} | concern:${p.concern} | ${p.description}`)
//    .join('\n');
//
//  const prompt = `You are a skincare expert. The user has skin type "${skinType}" and main concern "${concern}".
//From the following product catalog, recommend the 3 best products. Return ONLY valid JSON with this shape:
//{ "recommendations": [ { "id": <productId>, "reason": "<short reason>" } ] }
//
//Catalog:
//${catalogText}`;
//
//  const result = await model.generateContent(prompt);
//  const text = result.response.text();
//  const jsonMatch = text.match(/\{[\s\S]*\}/);
//  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };
//
//  // הצמדת פרטי המוצר המלאים
//  const full = parsed.recommendations.map((r) => {
//    const product = catalog.find((p) => p.id === r.id);
//    return { product, reason: r.reason };
//  }).filter((r) => r.product);
//
//  return { skinType, concern, recommendations: full };
//}
//
//module.exports = { getRecommendationsFromAI };
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getRecommendationsFromAI({ skinType, concern, catalog }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const catalogText = catalog
    .map((p) => `- id:${p.id} | ${p.name} (${p.brand}) | ${p.category} | ${p.price}₪ | skin:${p.skinType} | concern:${p.concern} | ${p.description}`)
    .join('\n');

  const prompt = `You are a skincare expert. The user has skin type "${skinType}" and main concern "${concern}".
From the following product catalog, recommend the 3 best products. Return ONLY valid JSON with this shape:
{ "recommendations": [ { "id": <productId>, "reason": "<short reason>" } ] }

Catalog:
${catalogText}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [] };

  // הצמדת פרטי המוצר המלאים
  const full = parsed.recommendations.map((r) => {
    const product = catalog.find((p) => p.id === r.id);
    return { product, reason: r.reason };
  }).filter((r) => r.product);

  return { skinType, concern, recommendations: full };
}

module.exports = { getRecommendationsFromAI };
