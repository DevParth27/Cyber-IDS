import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  console.log('Starting database seed...');

  // Test users from login.txt
  const testUsers = [
    { email: 'user1@gmail.com', password: 'test1' },
    { email: 'user2@gmail.com', password: 'test2' },
    { email: 'user3@gmail.com', password: 'test3' }
  ];

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash
        }
      });

      console.log(`✓ Created user: ${user.email}`);
    } catch (error) {
      console.error(`✗ Error creating user ${userData.email}:`, error.message);
    }
  }

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
