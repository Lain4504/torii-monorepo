
import { PrismaClient } from '../generated/prisma';

async function main() {
  const prisma = new PrismaClient();
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: { select: { title: true } },
        module: { select: { title: true } },
        lesson: { select: { title: true } },
      }
    });

    console.log('--- ASSIGNMENTS IN DB ---');
    console.log(JSON.stringify(assignments.map(a => ({
      id: a.id,
      title: a.title,
      status: a.status,
      courseId: a.courseId,
      courseTitle: (a as any).course?.title,
      moduleId: a.moduleId,
      lessonId: a.lessonId,
      createdBy: a.createdBy
    })), null, 2));

    const enrollments = await prisma.enrollment.findMany({
        include: {
            user: { select: { email: true, id: true } },
            course: { select: { title: true } }
        }
    });
    console.log('\n--- ENROLLMENTS IN DB ---');
    console.log(JSON.stringify(enrollments.map(e => ({
        id: e.id,
        userId: e.userId,
        userEmail: e.user.email,
        courseId: e.courseId,
        courseTitle: e.course.title,
        status: e.completionStatus
    })), null, 2));

    const users = await prisma.user.findMany({
        select: { id: true, email: true, roles: true, permissions: true }
    });
    console.log('\n--- USERS IN DB ---');
    console.log(JSON.stringify(users, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
