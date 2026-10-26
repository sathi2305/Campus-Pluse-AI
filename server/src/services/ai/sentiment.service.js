export const analyzeSentimentLocal = (text) => {
  const t = (text || '').toLowerCase();
  if (/urgent|fire|hazard|danger|outage|smoke|spark|severe|leak|burst/i.test(t)) {
    return { sentiment: 'Negative', score: -0.7 };
  }
  if (/resolved|fixed|repaired|thanks|good|clear/i.test(t)) {
    return { sentiment: 'Positive', score: 0.8 };
  }
  return { sentiment: 'Neutral', score: -0.1 };
};

export const analyzeWithOpenAI = async (text, client, model) => {
  return analyzeSentimentLocal(text);
};
