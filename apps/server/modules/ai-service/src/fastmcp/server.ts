import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Simple rate limiter (in-memory, for demo purposes)
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

// Start the server
server.start({
  transportType: "stdio",
});
