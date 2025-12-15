import { defineConfig } from 'orval';

export default defineConfig({
    api: {
        input: 'http://localhost:8080/api/docs-json',
        output: {
            target: './src/rest/generated.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/rest/axios-client.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
