Create a comprehensive flashcard for Japanese vocabulary learning. Word: "{{word}}", Meaning: "{{meaning}}"{{#if example}}, Example: "{{example}}"{{/if}}.

User Context:
- Enrolled Courses: {{#each enrolledCourses}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- JLPT Levels: {{#each jlptLevels}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- AI Metadata: {{#each aiMetadata}}{{json this}}{{/each}}

Personalize the flashcard based on the user's enrolled courses and JLPT levels. Use the AI metadata for additional context if available.

Include pronunciation (romaji and hiragana/katakana if needed), part of speech, additional context, and mnemonic hints. Return the result as a JSON object with the following structure: { "word": "string", "meaning": "string", "example": "string (optional)", "pronunciation": "string (optional)", "partOfSpeech": "string (optional)", "mnemonic": "string (optional)" }