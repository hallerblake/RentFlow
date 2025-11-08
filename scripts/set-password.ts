import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function setPassword() {
  const email = 'haller.blake@gmail.com';
  const password = 'password123';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update or create user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email,
      name: 'Blake Haller',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Password set for:', user.email);
  console.log('Role:', user.role);
}

setPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
