import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function setPassword() {
  const email = 'haller.blake@gmail.com';
  const password = 'password123';

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user with password (user should already exist)
  const user = await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  console.log('Password set for:', user.email);
  console.log('Role:', user.role);
}

setPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
