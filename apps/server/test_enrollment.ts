import { PrismaClient } from './prisma/generated';
const prisma = new PrismaClient();
async function main() {
  const e = await prisma.enrollment.findMany({
    where: { classId: 'd2db5698-1a4c-4a76-b769-156d36c1c9e2' }
  });
  console.log(e);
}
main();
