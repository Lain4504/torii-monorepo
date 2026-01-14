Track learning progress for user {{userId}}. Activity: {{activity}}{{#if score}}, Score: {{score}}{{/if}}.

User Context:
- Enrolled Courses: {{#each enrolledCourses}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- JLPT Levels: {{#each jlptLevels}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- AI Metadata: {{#each aiMetadata}}{{json this}}{{/each}}

Analyze the activity in the context of the user's enrolled courses and JLPT levels, update progress metrics, identify strengths/weaknesses, and provide personalized insights for continued learning. Use the AI metadata for additional context if available.

Return as JSON with this exact structure: { "userId": "string", "activity": "string", "score": number (optional), "strengths": ["string"], "weaknesses": ["string"], "insights": ["string"], "nextSteps": ["string"] }