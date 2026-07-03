import { analyzeSentimentWithGemini } from './geminiProvider.js';
import { analyzeSentimentWithHuggingFace } from './huggingfaceProvider.js';
import { SENTIMENT_LABELS, EMOTIONS } from '../../utils/constants.js';

/**
 * Single entry point the rest of the backend calls. Swapping AI_PROVIDER in
 * .env (or passing an explicit `provider` override) changes which model runs
 * without any change to feedbackController.js or aiController.js.
 *
 * @param {{ title: string, description: string }} feedback
 * @param {string} [providerOverride]
 * @returns {Promise<{sentiment, confidenceScore, emotion, keywords, summary, provider, rawResponse}>}
 */
export const analyzeFeedback = async ({ title, description }, providerOverride) => {
  const text = `${title}\n\n${description}`.trim();
  const provider = providerOverride || process.env.AI_PROVIDER || 'gemini';

  let result;
  try {
    result = provider === 'huggingface'
      ? await analyzeSentimentWithHuggingFace(text)
      : await analyzeSentimentWithGemini(text);
  } catch (primaryError) {
    console.error(`AI provider "${provider}" failed:`, primaryError.message);
    // Best-effort fallback to the other provider so a single API outage
    // doesn't block feedback submission entirely.
    const fallback = provider === 'huggingface' ? 'gemini' : 'huggingface';
    try {
      result =
        fallback === 'huggingface'
          ? await analyzeSentimentWithHuggingFace(text)
          : await analyzeSentimentWithGemini(text);
    } catch (fallbackError) {
      console.error(`Fallback AI provider "${fallback}" also failed:`, fallbackError.message);
      // Last resort: neutral placeholder so the feedback still saves cleanly.
      result = {
        sentiment: 'neutral',
        confidenceScore: 0,
        emotion: 'concerned',
        keywords: [],
        summary: 'AI analysis unavailable at submission time.',
        provider: 'gemini',
        rawResponse: { error: 'both providers failed' },
      };
    }
  }

  // Defensive normalization in case a model returns an unexpected value
  if (!SENTIMENT_LABELS.includes(result.sentiment)) result.sentiment = 'neutral';
  if (!EMOTIONS.includes(result.emotion)) result.emotion = 'concerned';
  result.confidenceScore = Math.max(0, Math.min(1, Number(result.confidenceScore) || 0));

  return result;
};
