import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: 'admin@torii.com',
    },
  });

  if (existingAdmin) {
    console.log('✅ Default admin user already exists. Skipping seed.');
    return;
  }

  // Create default admin user
  const hashedPassword = await argon2.hash('admin123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@torii.com',
      password: hashedPassword,
      displayName: 'System Administrator',
      fullName: 'System Administrator',
      role: 'ADMIN',
      emailVerified: true,
      active: true,
    },
  });

  console.log('✅ Created default admin user:');
  console.log('   Email: admin@torii.com');
  console.log('   Password: admin123');
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
