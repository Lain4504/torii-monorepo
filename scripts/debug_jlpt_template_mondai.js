const path = require('node:path')
const { createRequire } = require('node:module')

const serverReq = createRequire(
  path.join(__dirname, '..', 'apps', 'server', 'package.json'),
)

serverReq('dotenv').config({ path: path.join(__dirname, '..', '.env') })
serverReq('ts-node/register/transpile-only')

const { PrismaPg } = serverReq('@prisma/adapter-pg')
const { PrismaClient } = serverReq(
  path.join(__dirname, '..', 'apps', 'server', 'generated', 'prisma', 'client.ts'),
)

async function main() {
  const templateId = process.argv[2]
  if (!templateId) {
    throw new Error('Usage: node scripts/debug_jlpt_template_mondai.js <templateId>')
  }

  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  const t = await prisma.jlptMockExamTemplate.findUnique({
    where: { id: templateId },
    include: {
      level: true,
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          mondai: {
            orderBy: { orderIndex: 'asc' },
            select: { id: true, code: true, titleVi: true, titleJa: true, orderIndex: true },
          },
          templateQuestions: {
            select: { id: true, mondaiId: true },
          },
        },
      },
    },
  })

  if (!t) throw new Error(`Template not found: ${templateId}`)

  console.log(
    JSON.stringify(
      t.sections.map((s) => ({
        sectionCode: s.code,
        orderIndex: s.orderIndex,
        durationMinutes: s.durationMinutes,
        isListening: s.isListening,
        mondai: s.mondai.map((m) => ({
          code: m.code,
          titleVi: m.titleVi,
          titleJa: m.titleJa,
          orderIndex: m.orderIndex,
          count: s.templateQuestions.filter((q) => q.mondaiId === m.id).length,
        })),
      })),
      null,
      2,
    ),
  )

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

