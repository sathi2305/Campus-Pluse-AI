import { GoogleGenAI, Type } from '@google/genai';
import OpenAI from 'openai';
import { classifyLocal, classifyWithOpenAI } from './classifier.service.js';
import { analyzeSentimentLocal, analyzeWithOpenAI } from './sentiment.service.js';
import { generateSummaryLocal, generateWithOpenAI } from './summary.service.js';

let geminiClient = null;
const getGeminiClient = () => {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } catch (err) {
      geminiClient = null;
    }
  }
  return geminiClient;
};

let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    try {
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } catch (err) {
      openaiClient = null;
    }
  }
  return openaiClient;
};

export const getAIMode = () => {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'local';
};

export const getAIModeLabel = () => {
  if (process.env.GEMINI_API_KEY) return 'Gemini Intelligence';
  if (process.env.OPENAI_API_KEY) return 'OpenAI Intelligence';
  return 'Local Intelligence';
};

export const normalizeUrgency = (val, fallback = 'Medium') => {
  if (!val) return fallback;
  const s = String(val).trim().toLowerCase();
  if (s === 'high' || s === 'critical' || s === 'urgent') return 'High';
  if (s === 'low') return 'Low';
  if (s === 'medium' || s === 'normal') return 'Medium';
  return fallback;
};

const analyzeWithGemini = async (title, description, location, urgency, impact) => {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze this campus incident report:
Title: ${title}
Description: ${description}
Location: ${JSON.stringify(location || {})}
Reported Urgency Hint: ${urgency || 'None'}
Reported Impact: ${impact}

Task 1: Classify into one of these categories:
Internet, Electricity, Water, Cleanliness, Infrastructure, Hostel, Food, Security, Transport, Academic, Laboratory, Library, Administration, Other

Task 2: Classify responsible department:
IT, Hostel, Electrical, Maintenance, Transport, Food Services, Security, Academic, Library, Administration

Task 3: Categorization & Triage Urgency Assessment:
Assign an urgency level strictly as 'Low', 'Medium', or 'High' based on:
- 'High': Immediate health/safety hazard, complete utility shutdown (no water, power outage, internet blackout), active leak/flooding, contaminated water/food, or widespread disruption.
- 'Medium': Significant degradation affecting daily activities, partial failure (broken fan, low water pressure, delayed transport), requiring prompt attention within standard operating hours.
- 'Low': Minor cosmetic issues, non-blocking glitches, routine maintenance, single-person minor inconvenience, or general inquiries.

Task 4: Provide subcategory, severity (1-10), sentiment ('Negative', 'Neutral', 'Positive'), sentimentScore (-1.0 to 1.0), 1-sentence action summary, and 3-6 keywords.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            department: { type: Type.STRING },
            urgency: {
              type: Type.STRING,
              description: "AI evaluated urgency level strictly one of: 'Low', 'Medium', or 'High'"
            },
            severity: { type: Type.INTEGER },
            sentiment: { type: Type.STRING },
            sentimentScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidence: { type: Type.NUMBER }
          },
          required: ['category', 'department', 'urgency', 'severity', 'sentiment', 'sentimentScore', 'summary', 'keywords']
        }
      }
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      if (parsed.urgency) {
        parsed.urgency = normalizeUrgency(parsed.urgency, 'Medium');
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Gemini analysis fallback to local:', e.message);
  }
  return null;
};

const estimateSeverity = (title, desc, urgency, impact) => {
  const text = `${title} ${desc}`.toLowerCase();
  let severity = 5;
  if (text.includes('no water') || text.includes('power outage') || text.includes('no internet') || text.includes('critical') || text.includes('emergency')) severity=9;
  else if (text.includes('leak') || text.includes('broken') || text.includes('not working') || text.includes('stopped')) severity=7;
  else if (text.includes('slow') || text.includes('low pressure') || text.includes('dirty')) severity=4;
  const normUrg = normalizeUrgency(urgency, 'Medium');
  if (normUrg === 'High' || urgency==='Critical' || urgency==='Urgent') severity = Math.max(severity, 8);
  else if (normUrg === 'Low') severity = Math.min(severity, 5);
  if (impact==='Entire campus') severity = Math.max(severity,8);
  else if (impact==='Multiple departments' || impact==='Department') severity = Math.max(severity,6);
  return Math.min(10, severity);
};

const estimateAffected = (impact, title, desc) => {
  const map = { 'Only me':1, 'Few students':5, 'Class':40, 'Hostel block':120, 'Department':200, 'Multiple departments':350, 'Entire campus':800 };
  let base = map[impact] || 10;
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('hostel') && text.includes('block b')) base = Math.max(base, 200);
  if (text.includes('entire')) base = Math.max(base, 500);
  return base;
};

const deriveLocalUrgency = (severity, userUrgency, title, desc) => {
  if (userUrgency && (userUrgency === 'High' || userUrgency === 'Critical' || userUrgency === 'Urgent')) return 'High';
  if (userUrgency && userUrgency === 'Low') return 'Low';
  const text = `${title} ${desc}`.toLowerCase();
  if (severity >= 8 || text.includes('outage') || text.includes('emergency') || text.includes('hazard') || text.includes('danger') || text.includes('no water') || text.includes('no internet')) {
    return 'High';
  }
  if (severity <= 4 || text.includes('routine') || text.includes('minor') || text.includes('suggestion')) {
    return 'Low';
  }
  return 'Medium';
};

export const analyzeIssue = async ({ title, description, location, categoryHint, impact='Few students', urgency='Medium' }) => {
  const mode = getAIMode();
  let classification, sentiment, summary;
  let severity = estimateSeverity(title, description, urgency, impact);
  let keywords = [];
  let confidence = 0.85;

  if (mode === 'gemini') {
    const geminiRes = await analyzeWithGemini(title, description, location, urgency, impact);
    if (geminiRes) {
      const assignedUrgency = geminiRes.urgency ? normalizeUrgency(geminiRes.urgency) : deriveLocalUrgency(geminiRes.severity || severity, urgency, title, description);
      return {
        mode: 'gemini',
        category: categoryHint || geminiRes.category,
        subcategory: geminiRes.subcategory || 'General',
        department: geminiRes.department,
        severity: geminiRes.severity || severity,
        urgency: assignedUrgency,
        affectedUsers: estimateAffected(impact, title, description),
        sentiment: geminiRes.sentiment || 'Neutral',
        sentimentScore: geminiRes.sentimentScore !== undefined ? geminiRes.sentimentScore : -0.2,
        summary: geminiRes.summary,
        keywords: geminiRes.keywords || [],
        confidence: geminiRes.confidence || 0.95,
        entities: [location?.building, location?.block].filter(Boolean)
      };
    }
  }

  const openAi = getOpenAIClient();
  if (mode === 'openai' && openAi) {
    try {
      classification = await classifyWithOpenAI(title, description, openAi, process.env.AI_MODEL);
      sentiment = await analyzeWithOpenAI(`${title} ${description}`, openAi, process.env.AI_MODEL);
      summary = await generateWithOpenAI(title, description, openAi, process.env.AI_MODEL);
      confidence = classification.confidence || 0.9;
    } catch {
      classification = classifyLocal(title, description);
      sentiment = analyzeSentimentLocal(`${title} ${description}`);
      summary = generateSummaryLocal(title, description);
    }
  } else {
    classification = classifyLocal(title, description);
    sentiment = analyzeSentimentLocal(`${title} ${description}`);
    summary = generateSummaryLocal(title, description);
  }

  const assignedUrgency = classification.urgency ? normalizeUrgency(classification.urgency) : deriveLocalUrgency(severity, urgency, title, description);
  const affectedUsers = estimateAffected(impact, title, description);
  keywords = [...new Set(`${title} ${description}`.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w=>w.length>4).slice(0,8))];

  return {
    mode,
    category: categoryHint || classification.category,
    subcategory: classification.subcategory,
    department: classification.department,
    severity,
    urgency: assignedUrgency,
    affectedUsers,
    sentiment: sentiment.sentiment,
    sentimentScore: sentiment.score,
    summary,
    keywords,
    confidence: classification.confidence || confidence,
    entities: [location?.building, location?.block].filter(Boolean)
  };
};
