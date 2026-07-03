import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const PROMPT = (text) => `
You are a sentiment analysis engine for a government citizen feedback platform.
Analyze the following citizen feedback and respond with ONLY a valid JSON object
(no markdown fences, no commentary) matching exactly this shape:

{
  "sentiment": "positive" | "negative" | "neutral",
  "confidenceScore": number between 0 and 1,
  "emotion": "happy" | "angry" | "sad" | "concerned" | "satisfied",
  "keywords": string[] (3-6 important keywords/phrases from the text),
  "summary": string (one concise sentence summarizing the feedback)
}

Feedback text:
"""
${text}
"""
`;

/**
 * Calls Gemini and returns a normalized analysis object.
 * @param {string} text - combined feedback title + description
 */
export const analyzeSentimentWithGemini = async (text) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent(PROMPT(text));
  const raw = result.response.text().trim();

  // Strip accidental markdown code fences if the model adds them anyway
  const cleaned = raw.replace(/^```json\s*|```$/g, '').trim();

  const parsed = JSON.parse(cleaned);

  return {
    sentiment: parsed.sentiment,
    confidenceScore: parsed.confidenceScore,
    emotion: parsed.emotion,
    keywords: parsed.keywords || [],
    summary: parsed.summary || '',
    provider: 'gemini',
    rawResponse: parsed,
  };
};
