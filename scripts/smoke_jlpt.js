#!/usr/bin/env node
const path = require('node:path');
const { createRequire } = require('node:module');

const serverReq = createRequire(
  path.join(__dirname, '..', 'apps', 'server', 'package.json'),
);

serverReq('dotenv').config({ path: path.join(__dirname, '..', '.env') });
serverReq('ts-node/register/transpile-only');

const { PrismaPg } = serverReq('@prisma/adapter-pg');
const { PrismaClient } = serverReq(
  path.join(__dirname, '..', 'apps', 'server', 'generated', 'prisma', 'client.ts'),
);

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL');
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const templates = await prisma.jlptMockExamTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { level: true, sections: true },
  });

  console.log(
    JSON.stringify(
      templates.map((t) => ({
        id: t.id,
        code: t.code,
        status: t.status,
        level: t.level.code,
        sections: t.sections.map((s) => ({ order: s.orderIndex, code: s.code })),
      })),
      null,
      2,
    ),
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

