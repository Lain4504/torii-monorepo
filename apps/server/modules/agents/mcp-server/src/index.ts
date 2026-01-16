import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Register Handlebars helpers
Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});
Handlebars.registerHelper('json', function(obj: any) {
  return JSON.stringify(obj, null, 2);
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const app = express();
const PORT = process.env.FASTMCP_PORT || 3333;

app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'torii-sensei-brain', version: '1.0.0' });
});

function loadPromptTemplate(templatePath: string): HandlebarsTemplateDelegate {
  const fullPath = join(__dirname, '../assets/prompts', templatePath);
  const templateContent = readFileSync(fullPath, 'utf-8');
  return Handlebars.compile(templateContent);
}

async function callGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}

function cleanJsonResponse(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned.trim());
}

app.post('/api/sensei/check-grammar', async (req, res) => {
  try {
    const { text, userContext } = req.body;
    const template = loadPromptTemplate('sensei/grammar-check.md');
    const prompt = template({ text, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2. Translation
 */
app.post('/api/sensei/translate', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, userContext } = req.body;
    const template = loadPromptTemplate('sensei/translation.md');
    const prompt = template({ text, sourceLanguage, targetLanguage, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 3. Flashcard Creation
 */
app.post('/api/sensei/create-flashcard', async (req, res) => {
  try {
    const { topic, difficulty = 'intermediate', userContext } = req.body;
    const template = loadPromptTemplate('sensei/flashcard-creation.md');
    const prompt = template({ topic, difficulty, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 4. Practice Drill
 */
app.post('/api/sensei/generate-drill', async (req, res) => {
  try {
    const { type, topic, difficulty = 'N4', count = 5, userContext } = req.body;
    const template = loadPromptTemplate('sensei/practice-drill.md');
    const prompt = template({ type, topic, difficulty, count, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 5. Conversation Simulation
 */
app.post('/api/sensei/simulate-conversation', async (req, res) => {
  try {
    const { scenario, difficulty = 'intermediate', turns = 4, userContext } = req.body;
    const template = loadPromptTemplate('sensei/conversation-simulation.md');
    const prompt = template({ scenario, difficulty, turns, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 6. Resource Recommendation
 */
app.post('/api/sensei/recommend-resources', async (req, res) => {
  try {
    const { topic, resourceType = 'all', userContext } = req.body;
    const template = loadPromptTemplate('sensei/resource-recommendation.md');
    const prompt = template({ topic, resourceType, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 7. JLPT Test Generation
 */
app.post('/api/assessment/generate-test', async (req, res) => {
  try {
    const { level, section, questionCount = 10, userContext } = req.body;
    const template = loadPromptTemplate('assessment/jlpt-test-generation.md');
    const prompt = template({ level, section, questionCount, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 8. Test Evaluation
 */
app.post('/api/assessment/evaluate-test', async (req, res) => {
  try {
    const { testId, userAnswers, userContext } = req.body;
    const template = loadPromptTemplate('assessment/test-evaluation.md');
    const prompt = template({ testId, userAnswers, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 9. Progress Benchmark
 */
app.post('/api/assessment/progress-benchmark', async (req, res) => {
  try {
    const { userId, currentLevel, userContext } = req.body;
    const template = loadPromptTemplate('assessment/progress-benchmark.md');
    const prompt = template({ userId, currentLevel, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 10. Test Scheduling
 */
app.post('/api/assessment/schedule-test', async (req, res) => {
  try {
    const { userId, targetLevel, studySchedule, userContext } = req.body;
    const template = loadPromptTemplate('assessment/test-scheduling.md');
    const prompt = template({ userId, targetLevel, studySchedule, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 11. Progress Tracking
 */
app.post('/api/analytics/track-progress', async (req, res) => {
  try {
    const { userId, timeframe, userContext } = req.body;
    const template = loadPromptTemplate('analytics/progress-tracking.md');
    const prompt = template({ userId, timeframe, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 12. Study Path Suggestion
 */
app.post('/api/analytics/suggest-study-path', async (req, res) => {
  try {
    const { userId, currentLevel, targetLevel, userContext } = req.body;
    const template = loadPromptTemplate('analytics/study-path-suggestion.md');
    const prompt = template({ userId, currentLevel, targetLevel, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 13. Weakness Identification
 */
app.post('/api/analytics/identify-weaknesses', async (req, res) => {
  try {
    const { userId, recentPerformance, userContext } = req.body;
    const template = loadPromptTemplate('analytics/weakness-identification.md');
    const prompt = template({ userId, recentPerformance, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 14. Readiness Prediction
 */
app.post('/api/analytics/predict-readiness', async (req, res) => {
  try {
    const { userId, targetTest, userContext } = req.body;
    const template = loadPromptTemplate('analytics/readiness-prediction.md');
    const prompt = template({ userId, targetTest, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 15. Report Generation
 */
app.post('/api/analytics/generate-report', async (req, res) => {
  try {
    const { userId, reportType, period, userContext } = req.body;
    const template = loadPromptTemplate('analytics/report-generation.md');
    const prompt = template({ userId, reportType, period, userContext: userContext || {}, timestamp: new Date().toISOString() });
    const response = await callGemini(prompt);
    res.json(cleanJsonResponse(response));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 Torii FastMCP Server Started Successfully');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🧠 Agents: Sensei (6) + Assessment (4) + Analytics (5)`);
  console.log(`⚡ Total Endpoints: 15`);
  console.log('');
  console.log('📋 SENSEI AGENT:');
  console.log('   1. POST /api/sensei/check-grammar');
  console.log('   2. POST /api/sensei/translate');
  console.log('   3. POST /api/sensei/create-flashcard');
  console.log('   4. POST /api/sensei/generate-drill');
  console.log('   5. POST /api/sensei/simulate-conversation');
  console.log('   6. POST /api/sensei/recommend-resources');
  console.log('');
  console.log('📋 ASSESSMENT AGENT:');
  console.log('   7. POST /api/assessment/generate-test');
  console.log('   8. POST /api/assessment/evaluate-test');
  console.log('   9. POST /api/assessment/progress-benchmark');
  console.log('   10. POST /api/assessment/schedule-test');
  console.log('');
  console.log('📋 ANALYTICS AGENT:');
  console.log('   11. POST /api/analytics/track-progress');
  console.log('   12. POST /api/analytics/suggest-study-path');
  console.log('   13. POST /api/analytics/identify-weaknesses');
  console.log('   14. POST /api/analytics/predict-readiness');
  console.log('   15. POST /api/analytics/generate-report');
  console.log('');
  console.log('⚠️  Gemini API is ONLY called from this server');
  console.log('═══════════════════════════════════════════════════════════');
});
