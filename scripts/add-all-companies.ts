import { prisma } from '../lib/prisma';

async function addAllCompaniesToUser() {
  const email = 'haller.blake@gmail.com';

  try {
    console.log('Adding all companies to user:', email);

    // Get user
    const users = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
      email
    );

    if (!users || users.length === 0) {
      console.error('User not found');
      return;
    }

    const userId = users[0].id;

    // Get all companies
    const companies = await prisma.$queryRaw<any[]>`
      SELECT id, name FROM "Company" ORDER BY name
    `;

    console.log(`Found ${companies.length} companies`);

    // Delete existing assignments for this user
    await prisma.$queryRawUnsafe(
      `DELETE FROM "UserCompany" WHERE "userId" = $1`,
      userId
    );

    console.log('Cleared existing company assignments');

    // Add all companies to user
    for (const company of companies) {
      await prisma.$queryRawUnsafe(
        `INSERT INTO "UserCompany" ("id", "userId", "companyId", "createdAt")
         VALUES (gen_random_uuid(), $1, $2, NOW())`,
        userId,
        company.id
      );
      console.log(`✓ Added: ${company.name}`);
    }

    console.log(`\n✅ Successfully added all ${companies.length} companies to ${email}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAllCompaniesToUser();
