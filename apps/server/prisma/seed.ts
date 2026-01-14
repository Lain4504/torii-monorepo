import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Get default admin credentials from environment variables
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@torii.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const adminDisplayName = process.env.DEFAULT_ADMIN_DISPLAY_NAME || 'System Administrator';
    const adminFullName = process.env.DEFAULT_ADMIN_FULL_NAME || 'System Administrator';

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
        where: {
            email: adminEmail,
        },
    });

    if (existingAdmin) {
        console.log('✅ Default admin user already exists. Skipping seed.');
        return;
    }

    // Create default admin user
    const hashedPassword = await argon2.hash(adminPassword);

    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            displayName: adminDisplayName,
            fullName: adminFullName,
            role: 'ADMIN',
            emailVerified: true,
            active: true,
        },
    });

    console.log('✅ Created default admin user:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Role: ADMIN');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('');
    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:');
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
