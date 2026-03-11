const { PrismaClient } = require('./apps/server/generated/prisma/index.js');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:postgres@localhost:5432/torii_dev?schema=public"
        }
    }
});

async function main() {
  console.log('802:', await prisma.courseOffering.findUnique({
    where: { id: '88888888-8888-8888-8888-888888888802' }
  }));
}
main().catch(console.error).finally(() => prisma.$disconnect());
