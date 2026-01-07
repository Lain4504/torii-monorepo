import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function checkCourses() {
    console.log('Checking all courses in database...\n');

    const allCourses = await prisma.course.findMany({
        select: {
            id: true,
            title: true,
            deletedAt: true,
            status: true,
        },
    });

    console.log(`Total courses in database: ${allCourses.length}`);
    console.log('\nCourse details:');
    allCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   ID: ${course.id}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   DeletedAt: ${course.deletedAt}`);
        console.log('');
    });

    const notDeletedCourses = allCourses.filter(c => c.deletedAt === null);
    console.log(`\nCourses with deletedAt = null: ${notDeletedCourses.length}`);

    const deletedCourses = allCourses.filter(c => c.deletedAt !== null);
    console.log(`Courses with deletedAt != null: ${deletedCourses.length}`);

    await prisma.$disconnect();
}

checkCourses().catch(console.error);
