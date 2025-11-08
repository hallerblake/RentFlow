import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function addPasswordColumnAndSetPassword() {
  try {
    console.log('Adding password column to production User table...');
    console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

    // Step 1: Add password column
    console.log('\n1. Adding password column...');
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT`
    );
    console.log('✅ Password column added (or already exists)');

    // Step 2: Verify column was added
    console.log('\n2. Verifying password column exists...');
    const columns = await prisma.$queryRaw<any[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'password'
    `;

    if (columns.length > 0) {
      console.log('✅ Password column confirmed in database');
    } else {
      console.log('❌ Password column not found!');
      return;
    }

    // Step 3: Set password for the user
    console.log('\n3. Setting password for haller.blake@gmail.com...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const result = await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "password" = $1 WHERE "email" = $2`,
      hashedPassword,
      'haller.blake@gmail.com'
    );

    console.log(`✅ Password updated for user (${result} row(s) affected)`);

    // Step 4: Verify the password was set
    console.log('\n4. Verifying password was set...');
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT email, role, LENGTH(password) as password_length FROM "User" WHERE email = $1`,
      'haller.blake@gmail.com'
    );

    if (users && users.length > 0) {
      console.log('✅ User verification:');
      console.log('   - Email:', users[0].email);
      console.log('   - Role:', users[0].role);
      console.log('   - Password length:', users[0].password_length);
    }

    console.log('\n✅ ALL DONE! Password column added and password set successfully.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPasswordColumnAndSetPassword();
