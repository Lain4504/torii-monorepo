#!/usr/bin/env node
const path = require('node:path');
const { createRequire } = require('node:module');

const serverReq = createRequire(path.join(__dirname, '..', 'apps', 'server', 'package.json'));

serverReq('dotenv').config({ path: path.join(__dirname, '..', '.env') });
serverReq('ts-node/register/transpile-only');

const { PrismaPg } = serverReq('@prisma/adapter-pg');
const { PrismaClient } = serverReq(path.join(__dirname, '..', 'apps', 'server', 'generated', 'prisma', 'client.ts'));

function parseArgs() {
  const out = { codes: [] };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--codes') {
      out.codes = argv[++i].split(',').map((x) => x.trim()).filter(Boolean);
    } else if (a === '--help') {
      console.log('Usage: node scripts/smoke_jlpt_exam_questions.js --codes CODE1,CODE2');
      process.exit(0);
    }
  }
  return out;
}

async function main() {
  const { codes } = parseArgs();
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const templates = codes.length
    ? await prisma.jlptMockExamTemplate.findMany({
        where: { code: { in: codes } },
        include: {
          level: true,
          sections: {
            orderBy: { orderIndex: 'asc' },
            include: { templateQuestions: true },
          },
        },
      })
    : await prisma.jlptMockExamTemplate.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          level: true,
          sections: {
            orderBy: { orderIndex: 'asc' },
            include: { templateQuestions: true },
          },
        },
      });

  console.log(
    JSON.stringify(
      templates.map((t) => ({
        id: t.id,
        code: t.code,
        level: t.level.code,
        status: t.status,
        sections: t.sections.map((s) => ({
          order: s.orderIndex,
          code: s.code,
          title: s.title,
          durationMinutes: s.durationMinutes,
          isListening: s.isListening,
          questionCount: s.templateQuestions.length,
        })),
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

