import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Simple rate limiter (in-memory, for demo purposes)
// TODO: Replace with Redis-based rate limiter for production use
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RESET_TIME = 60 * 1000; // 1 minute

function checkRateLimit(userId: string = 'default'): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RESET_TIME });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Helper function for AI calls with error handling
async function callGemini(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return `Error: Unable to process request. ${error.message}`;
  }
}

// Create the MCP server
const server = new FastMCP({
  name: 'ai-learning-support',
  version: '1.0.0',
});

// Sensei Agent Tools
server.addTool({
  name: 'sensei_grammar_check',
  description: 'Check grammar in Japanese text',
  parameters: z.object({
    text: z.string(),
  }),
  execute: async ({ text }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Check the grammar of this Japanese text: "${text}". Provide corrections, explanations for any errors, and suggest improvements. Respond in a helpful, educational format.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'sensei_translate',
  description: 'Translate text between Japanese and English',
  parameters: z.object({
    text: z.string(),
    from: z.enum(['ja', 'en']),
    to: z.enum(['ja', 'en']),
  }),
  execute: async ({ text, from, to }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Translate the following text from ${from === 'ja' ? 'Japanese' : 'English'} to ${to === 'ja' ? 'Japanese' : 'English'}: "${text}". Provide an accurate translation and, if applicable, note any cultural or contextual considerations.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'sensei_create_flashcard',
  description: 'Create a flashcard for vocabulary learning',
  parameters: z.object({
    word: z.string(),
    meaning: z.string(),
    example: z.string().optional(),
  }),
  execute: async ({ word, meaning, example }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Create a comprehensive flashcard for Japanese vocabulary learning. Word: "${word}", Meaning: "${meaning}"${example ? `, Example: "${example}"` : ''}. Include pronunciation (romaji and hiragana/katakana if needed), part of speech, additional context, and mnemonic hints. Format as a structured flashcard.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'sensei_generate_drill',
  description: 'Generate practice drills for grammar or vocabulary',
  parameters: z.object({
    drillType: z.enum(['grammar', 'vocabulary', 'kanji', 'particles']),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
    topic: z.string().optional(),
  }),
  execute: async ({ drillType, level, topic }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Generate ${drillType} practice drills for JLPT ${level} level${topic ? ` focusing on the topic: "${topic}"` : ''}. Include 5-7 exercises such as fill-in-the-gaps, sentence building, or multiple-choice questions. Provide answers and explanations.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'sensei_simulate_conversation',
  description: 'Simulate a Japanese conversation for practice',
  parameters: z.object({
    topic: z.string(),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  }),
  execute: async ({ topic, level }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Create a simulated Japanese conversation about "${topic}" at JLPT ${level} level. Include 6-8 dialogue exchanges, with natural Japanese responses, romaji pronunciation, English translations, and suggestions for alternative responses. Make it interactive and educational.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'sensei_recommend_resources',
  description: 'Recommend learning resources for a specific concept',
  parameters: z.object({
    concept: z.string(),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  }),
  execute: async ({ concept, level }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Recommend learning resources for the Japanese language concept "${concept}" at JLPT ${level} level. Include textbooks, online resources, videos, practice websites, and study tips. Explain why each resource is helpful.`;
    return await callGemini(prompt);
  },
});

// Assessment Agent Tools
server.addTool({
  name: 'assessment_generate_jlpt_test',
  description: 'Generate a JLPT-style test',
  parameters: z.object({
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
    type: z.enum(['vocabulary', 'grammar', 'reading', 'listening']),
    questionCount: z.number().min(1).max(50),
  }),
  execute: async ({ level, type, questionCount }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Generate ${questionCount} JLPT ${level} level ${type} questions. For vocabulary: provide word, options, correct answer. For grammar: provide sentence with blank, options. For reading: provide passage and questions. For listening: describe audio content and questions. Format as JSON with questions array, each having question text, options array, correct answer index.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'assessment_evaluate_test',
  description: 'Evaluate answers for a JLPT-style test',
  parameters: z.object({
    testId: z.string(),
    answers: z.record(z.string()),
  }),
  execute: async ({ testId, answers }) => {
    if (!checkRateLimit()) {
      return 'Rate limit exceeded. Please try again later.';
    }
    const prompt = `Evaluate the following test answers for test ID ${testId}. Answers: ${JSON.stringify(answers)}. Provide a score percentage, detailed feedback on each answer, overall performance analysis, and suggestions for improvement.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'assessment_get_benchmark',
  description: 'Get progress benchmark for a user at a specific JLPT level',
  parameters: z.object({
    userId: z.string(),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  }),
  execute: async ({ userId, level }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Provide a progress benchmark for user ${userId} at JLPT ${level} level. Compare their performance against passing thresholds, identify skill gaps (vocabulary, grammar, reading, listening), and provide readiness assessment with percentage estimates.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'assessment_schedule_test',
  description: 'Schedule a practice test for a user',
  parameters: z.object({
    userId: z.string(),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
    date: z.string(),
  }),
  execute: async ({ userId, level, date }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Schedule a JLPT ${level} practice test for user ${userId} on ${date}. Provide a confirmation message, test preparation recommendations, study tips for the remaining time, and what to expect on test day.`;
    return await callGemini(prompt);
  },
});

// Analytics Agent Tools
server.addTool({
  name: 'analytics_track_progress',
  description: 'Track user learning progress',
  parameters: z.object({
    userId: z.string(),
    activity: z.string(),
    score: z.number().optional(),
  }),
  execute: async ({ userId, activity, score }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Track learning progress for user ${userId}. Activity: ${activity}${score !== undefined ? `, Score: ${score}` : ''}. Analyze the activity, update progress metrics, identify strengths/weaknesses, and provide insights for continued learning.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'analytics_suggest_path',
  description: 'Suggest personalized study path',
  parameters: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Suggest a personalized study path for Japanese learning for user ${userId}. Based on typical learner progress, recommend next steps, focus areas, resources, and a timeline. Make it adaptive and encouraging.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'analytics_identify_weaknesses',
  description: 'Identify learning weaknesses from user performance data',
  parameters: z.object({
    userId: z.string(),
  }),
  execute: async ({ userId }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Analyze learning patterns for user ${userId} and identify weaknesses. Look for recurring error patterns in grammar, vocabulary, kanji, particles, verb conjugations, etc. Provide specific areas needing improvement with actionable recommendations.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'analytics_predict_readiness',
  description: 'Predict JLPT exam readiness based on performance trends',
  parameters: z.object({
    userId: z.string(),
    level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  }),
  execute: async ({ userId, level }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Predict JLPT ${level} exam readiness for user ${userId}. Based on typical learning progress patterns, estimate score predictions, identify strong/weak areas, calculate readiness percentage, and recommend when they should take the exam. Include confidence level in predictions.`;
    return await callGemini(prompt);
  },
});

server.addTool({
  name: 'analytics_generate_report',
  description: 'Generate a comprehensive progress report',
  parameters: z.object({
    userId: z.string(),
    reportType: z.enum(['daily', 'weekly', 'monthly', 'overall']),
  }),
  execute: async ({ userId, reportType }) => {
    if (!checkRateLimit(userId)) {
      return 'Error: Rate limit exceeded. Please try again later.';
    }
    const prompt = `Generate a ${reportType} progress report for user ${userId}. Include: study time statistics, completed activities, test scores, skill progression (vocabulary, grammar, kanji, reading, listening), achievements unlocked, comparison with goals, areas of improvement, and motivational insights. Format as a comprehensive, visual-friendly report.`;
    return await callGemini(prompt);
  },
});

// Start the server
server.start({
  transportType: "stdio",
});
