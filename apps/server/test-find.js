const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({datasources: { db: { url: "postgresql://postgres:postgres@localhost:5432/torii_dev?schema=public" } }});

async function run() {
    const offering = await prisma.courseOffering.findUnique({
      where: { id: '88888888-8888-8888-8888-888888888802' },
      include: {
        classes: {
          include: {
            class: {
              include: {
                courseProfile: true,
              },
            },
          },
        },
      },
    });
    console.log(JSON.stringify(offering, null, 2));
}

run().finally(() => prisma.$disconnect());
