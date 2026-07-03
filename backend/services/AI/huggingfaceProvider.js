// Fallback AI provider using HuggingFace's hosted Inference API. Kept to the
// same output shape as the Gemini provider so aiService.js can swap between
// them via the AI_PROVIDER env var without touching any calling code.
//
// Uses a sentiment model for the core label + a zero-shot classifier for
// emotion, plus a lightweight local keyword extractor (HuggingFace's free
// tier doesn't reliably offer a single all-in-one endpoint for this).

const HF_API_URL = 'https://api-inference.huggingface.co/models';
const SENTIMENT_MODEL = 'distilbert-base-uncased-finetuned-sst-2-english';
const ZERO_SHOT_MODEL = 'facebook/bart-large-mnli';

const EMOTIONS = ['happy', 'angry', 'sad', 'concerned', 'satisfied'];

const hfRequest = async (model, body) => {
  const res = await fetch(`${HF_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HuggingFace API error (${res.status}): ${errText}`);
  }
  return res.json();
};

// Very small stopword-based keyword extractor - good enough as a fallback
// when not using Gemini's language-model-driven extraction.
const extractKeywords = (text, max = 6) => {
  const stopwords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'of',
    'to', 'in', 'on', 'for', 'with', 'this', 'that', 'it', 'as', 'be', 'i',
    'we', 'you', 'they', 'not', 'so', 'very', 'has', 'have', 'had',
  ]);
  const freq = {};
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w))
    .forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
};

export const analyzeSentimentWithHuggingFace = async (text) => {
  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error('HUGGINGFACE_API_KEY is not configured');
  }

  const [sentimentResult, emotionResult] = await Promise.all([
    hfRequest(SENTIMENT_MODEL, { inputs: text }),
    hfRequest(ZERO_SHOT_MODEL, { inputs: text, parameters: { candidate_labels: EMOTIONS } }),
  ]);

  const topSentiment = sentimentResult?.[0]?.sort((a, b) => b.score - a.score)?.[0] || {
    label: 'NEUTRAL',
    score: 0.5,
  };
  const sentiment = topSentiment.label.toLowerCase().includes('pos')
    ? 'positive'
    : topSentiment.label.toLowerCase().includes('neg')
      ? 'negative'
      : 'neutral';

  const emotion = emotionResult?.labels?.[0] || 'concerned';

  return {
    sentiment,
    confidenceScore: Number(topSentiment.score?.toFixed(2)) || 0.5,
    emotion,
    keywords: extractKeywords(text),
    summary: text.length > 140 ? `${text.slice(0, 137)}...` : text,
    provider: 'huggingface',
    rawResponse: { sentimentResult, emotionResult },
  };
};
