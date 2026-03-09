const { PrismaClient } = require('@prisma/generated');
const prisma = new PrismaClient();
async function run() {
  const e = await prisma.enrollment.findMany();
  console.log(e);
}
run();
