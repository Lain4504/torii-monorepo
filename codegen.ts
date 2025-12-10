import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'apps/server/apps/gateway/schema.gql',
  documents: ['packages/data-access/src/graphql/**/*.graphql'],
  generates: {
    'packages/data-access/generated/graphql.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;

