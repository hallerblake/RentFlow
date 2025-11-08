import { prisma } from '../lib/prisma';

async function testProductionDb() {
  try {
    console.log('Testing production database...');

    // Test 1: Check if password column exists by querying
    console.log('\n1. Checking password column with raw SQL...');
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, name, password, role FROM "User" WHERE email = $1 LIMIT 1`,
      'haller.blake@gmail.com'
    );

    if (users && users.length > 0) {
      const user = users[0];
      console.log('✅ User found:');
      console.log('   - Email:', user.email);
      console.log('   - Name:', user.name);
      console.log('   - Role:', user.role);
      console.log('   - Has password:', !!user.password);
      console.log('   - Password length:', user.password ? user.password.length : 0);

      if (user.password && user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log('   - Password is properly hashed ✅');
      } else {
        console.log('   - WARNING: Password doesn\'t look like a bcrypt hash ⚠️');
      }
    } else {
      console.log('❌ User not found');
    }

    // Test 2: Check database schema
    console.log('\n2. Checking User table columns...');
    const columns = await prisma.$queryRaw<any[]>`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;

    console.log('User table columns:');
    columns.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductionDb();
