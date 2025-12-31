#!/usr/bin/env node
/**
 * Manual Test Script for AI Learning Support Service
 * Tests all three agents: Sensei, Assessment, and Analytics
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Helper function to display results nicely
function displayResult(title, result) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 ${title}`);
  console.log('='.repeat(80));
  
  if (Array.isArray(result.content)) {
    result.content.forEach(item => {
      if (item.type === 'text') {
        console.log(item.text);
      }
    });
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
}

async function runTests() {
  console.log('🚀 Starting AI Service Manual Tests...\n');
  
  try {
    // Create transport and client
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', 'apps/server/modules/cortex/src/fastmcp/server.ts'],
    });

    const client = new Client({
      name: 'ai-test-client',
      version: '1.0.0',
    }, {
      capabilities: {},
    });

    console.log('⏳ Connecting to FastMCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!\n');

    // ========================================================================
    // SENSEI AGENT TESTS
    // ========================================================================
    console.log('\n' + '█'.repeat(80));
    console.log('   🎓 TESTING SENSEI AGENT');
    console.log('█'.repeat(80));

    // Test 1: Grammar Check - Invalid Grammar
    try {
      console.log('\n🔍 Test 1: Grammar Check (Invalid Grammar)');
      const grammarResult = await client.callTool({
        name: 'sensei_grammar_check',
        arguments: {
          text: '私は昨日学校に行きましたです。',
        },
      });
      displayResult('Grammar Check Result', grammarResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 2: Grammar Check - Valid Grammar
    try {
      console.log('\n🔍 Test 2: Grammar Check (Valid Grammar)');
      const grammarResult2 = await client.callTool({
        name: 'sensei_grammar_check',
        arguments: {
          text: '私は学生です。',
        },
      });
      displayResult('Grammar Check Result', grammarResult2);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 3: Translation EN to JA
    try {
      console.log('\n🌐 Test 3: Translation (EN → JA)');
      const translationResult = await client.callTool({
        name: 'sensei_translate',
        arguments: {
          text: 'Hello, how are you today?',
          from: 'en',
          to: 'ja',
        },
      });
      displayResult('Translation Result', translationResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 4: Translation JA to EN
    try {
      console.log('\n🌐 Test 4: Translation (JA → EN)');
      const translationResult2 = await client.callTool({
        name: 'sensei_translate',
        arguments: {
          text: 'おはようございます。お元気ですか？',
          from: 'ja',
          to: 'en',
        },
      });
      displayResult('Translation Result', translationResult2);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 5: Create Flashcard
    try {
      console.log('\n📇 Test 5: Create Flashcard');
      const flashcardResult = await client.callTool({
        name: 'sensei_create_flashcard',
        arguments: {
          word: '食べる',
          meaning: 'to eat',
          example: '私は朝ご飯を食べます。',
        },
      });
      displayResult('Flashcard Creation Result', flashcardResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // ========================================================================
    // ASSESSMENT AGENT TESTS
    // ========================================================================
    console.log('\n\n' + '█'.repeat(80));
    console.log('   📝 TESTING ASSESSMENT AGENT');
    console.log('█'.repeat(80));

    // Test 6: Generate JLPT N5 Vocabulary Test
    try {
      console.log('\n📋 Test 6: Generate JLPT N5 Vocabulary Test');
      const testGenResult = await client.callTool({
        name: 'assessment_generate_jlpt_test',
        arguments: {
          level: 'N5',
          type: 'vocabulary',
          questionCount: 3,
        },
      });
      displayResult('Test Generation Result', testGenResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 7: Generate JLPT N4 Grammar Test
    try {
      console.log('\n📋 Test 7: Generate JLPT N4 Grammar Test');
      const testGenResult2 = await client.callTool({
        name: 'assessment_generate_jlpt_test',
        arguments: {
          level: 'N4',
          type: 'grammar',
          questionCount: 5,
        },
      });
      displayResult('Test Generation Result', testGenResult2);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 8: Evaluate Test Answers
    try {
      console.log('\n✅ Test 8: Evaluate Test Answers');
      const evalResult = await client.callTool({
        name: 'assessment_evaluate_test',
        arguments: {
          testId: 'jlpt-n5-vocab-test-001',
          answers: {
            q1: 'B',
            q2: 'A',
            q3: 'C',
            q4: 'D',
            q5: 'A',
          },
        },
      });
      displayResult('Test Evaluation Result', evalResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // ========================================================================
    // ANALYTICS AGENT TESTS
    // ========================================================================
    console.log('\n\n' + '█'.repeat(80));
    console.log('   📊 TESTING ANALYTICS AGENT');
    console.log('█'.repeat(80));

    // Test 9: Track Progress
    try {
      console.log('\n📈 Test 9: Track Learning Progress');
      const trackResult = await client.callTool({
        name: 'analytics_track_progress',
        arguments: {
          userId: 'test-user-001',
          activity: 'completed_n5_vocabulary_test',
          score: 85,
        },
      });
      displayResult('Progress Tracking Result', trackResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // Test 10: Suggest Study Path
    try {
      console.log('\n🎯 Test 10: Suggest Personalized Study Path');
      const suggestResult = await client.callTool({
        name: 'analytics_suggest_path',
        arguments: {
          userId: 'test-user-001',
        },
      });
      displayResult('Study Path Suggestion Result', suggestResult);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }

    // ========================================================================
    // RATE LIMIT TEST (Optional)
    // ========================================================================
    console.log('\n\n' + '█'.repeat(80));
    console.log('   ⚡ TESTING RATE LIMITING');
    console.log('█'.repeat(80));

    console.log('\n⏰ Test 11: Rate Limit Check (11 rapid requests)');
    console.log('This will trigger rate limiting...\n');
    
    let successCount = 0;
    let rateLimitHit = false;

    for (let i = 1; i <= 11; i++) {
      try {
        const rateLimitTest = await client.callTool({
          name: 'sensei_translate',
          arguments: {
            text: `Test ${i}`,
            from: 'en',
            to: 'ja',
          },
        });
        
        if (Array.isArray(rateLimitTest.content)) {
          const text = rateLimitTest.content[0]?.text || '';
          if (text.includes('Rate limit exceeded')) {
            console.log(`   Request ${i}: ⛔ Rate limited`);
            rateLimitHit = true;
            break;
          }
        }
        
        successCount++;
        console.log(`   Request ${i}: ✅ Success`);
      } catch (error) {
        console.log(`   Request ${i}: ❌ Error - ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Rate Limit Results:`);
    console.log(`   Successful requests: ${successCount}`);
    console.log(`   Rate limit triggered: ${rateLimitHit ? 'Yes ✅' : 'No ❌'}`);

    // Close connection
    await client.close();
    
    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n\n' + '█'.repeat(80));
    console.log('   ✨ TEST SUMMARY');
    console.log('█'.repeat(80));
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Tests Run:');
    console.log('   • Sensei Agent: Grammar Check (2), Translation (2), Flashcard (1)');
    console.log('   • Assessment Agent: Generate Tests (2), Evaluate (1)');
    console.log('   • Analytics Agent: Track Progress (1), Suggest Path (1)');
    console.log('   • Rate Limiting: Rapid Fire Test (1)');
    console.log('\n🎉 Testing session complete!\n');

  } catch (error) {
    console.error('\n❌ Fatal error during testing:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);
