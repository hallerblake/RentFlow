import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create companies
  const companies = [
    { name: 'Sherman Haller', email: 'info@shermanhaller.com', phone: '555-0100' },
    { name: 'Haller Properties', email: 'info@hallerproperties.com', phone: '555-0200' },
    { name: 'MR3 Properties', email: 'info@mr3properties.com', phone: '555-0300' },
    { name: 'Permian Rentals', email: 'info@permianrentals.com', phone: '555-0400' },
  ];

  console.log('Creating companies...');
  const createdCompanies = await Promise.all(
    companies.map((company) =>
      prisma.company.create({
        data: company,
      })
    )
  );
  console.log(`✅ Created ${createdCompanies.length} companies`);

  // Create super admin user
  console.log('Creating super admin user...');
  const superAdmin = await prisma.user.create({
    data: {
      clerkId: 'placeholder_clerk_id', // Will be updated after Clerk setup
      email: 'haller.blake@gmail.com',
      firstName: 'Blake',
      lastName: 'Haller',
      role: 'SUPER_ADMIN',
      companyId: null, // Super admin has access to all companies
    },
  });
  console.log(`✅ Created super admin: ${superAdmin.email}`);

  // Create sample properties for each company
  console.log('Creating sample properties...');
  const properties = [];
  for (const company of createdCompanies) {
    const companyProperties = await Promise.all([
      prisma.property.create({
        data: {
          companyId: company.id,
          name: `${company.name} - Main Street Property`,
          address: '123 Main St',
          city: 'Midland',
          state: 'TX',
          zipCode: '79701',
          type: 'SINGLE_FAMILY',
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 1500,
          rentAmount: 1200,
          depositAmount: 1200,
          status: 'OCCUPIED',
          description: 'Beautiful single family home in prime location',
        },
      }),
      prisma.property.create({
        data: {
          companyId: company.id,
          name: `${company.name} - Oak Avenue Duplex`,
          address: '456 Oak Ave',
          city: 'Odessa',
          state: 'TX',
          zipCode: '79762',
          type: 'MULTI_FAMILY',
          bedrooms: 2,
          bathrooms: 1.5,
          squareFeet: 1000,
          rentAmount: 950,
          depositAmount: 950,
          status: 'VACANT',
          description: 'Cozy duplex with modern amenities',
        },
      }),
      prisma.property.create({
        data: {
          companyId: company.id,
          name: `${company.name} - Downtown Apartment`,
          address: '789 Commerce St',
          city: 'Midland',
          state: 'TX',
          zipCode: '79701',
          type: 'APARTMENT',
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 750,
          rentAmount: 850,
          depositAmount: 850,
          status: 'OCCUPIED',
          description: 'Downtown apartment with easy access to amenities',
        },
      }),
    ]);
    properties.push(...companyProperties);
  }
  console.log(`✅ Created ${properties.length} properties`);

  // Create sample tenants and leases
  console.log('Creating sample tenants and leases...');
  let tenantCount = 0;
  let leaseCount = 0;

  for (const property of properties) {
    if (property.status === 'OCCUPIED') {
      const tenant = await prisma.tenant.create({
        data: {
          companyId: property.companyId,
          propertyId: property.id,
          firstName: `Tenant`,
          lastName: `${tenantCount + 1}`,
          email: `tenant${tenantCount + 1}@example.com`,
          phone: `555-${(1000 + tenantCount).toString()}`,
          leaseStartDate: new Date('2024-01-01'),
          leaseEndDate: new Date('2025-01-01'),
          rentAmount: property.rentAmount,
          depositPaid: property.depositAmount,
          isActive: true,
          notes: 'Good tenant, pays on time',
        },
      });
      tenantCount++;

      const lease = await prisma.lease.create({
        data: {
          propertyId: property.id,
          tenantId: tenant.id,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2025-01-01'),
          rentAmount: property.rentAmount,
          deposit: property.depositAmount || 0,
          status: 'ACTIVE',
        },
      });
      leaseCount++;

      // Create sample payments for this tenant
      const currentMonth = new Date();
      const payment = await prisma.payment.create({
        data: {
          companyId: property.companyId,
          leaseId: lease.id,
          tenantId: tenant.id,
          propertyId: property.id,
          amount: property.rentAmount,
          dueDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
          status: 'PAID',
          paidDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 3),
          paymentMethod: 'ach',
          paymentType: 'RENT',
        },
      });

      // Create upcoming payment
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      await prisma.payment.create({
        data: {
          companyId: property.companyId,
          leaseId: lease.id,
          tenantId: tenant.id,
          propertyId: property.id,
          amount: property.rentAmount,
          dueDate: nextMonth,
          status: 'PENDING',
          paymentType: 'RENT',
        },
      });
    }
  }
  console.log(`✅ Created ${tenantCount} tenants and ${leaseCount} leases`);

  // Create sample maintenance requests
  console.log('Creating sample maintenance requests...');
  const maintenanceRequests = [];
  for (const property of properties.slice(0, 4)) {
    const tenant = await prisma.tenant.findFirst({
      where: { propertyId: property.id },
    });

    const request = await prisma.maintenanceRequest.create({
      data: {
        companyId: property.companyId,
        propertyId: property.id,
        tenantId: tenant?.id,
        title: 'Leaky faucet',
        description: 'Kitchen faucet is dripping and needs repair',
        priority: 'MEDIUM',
        status: 'REQUESTED',
        estimatedCost: 150,
      },
    });
    maintenanceRequests.push(request);
  }
  console.log(`✅ Created ${maintenanceRequests.length} maintenance requests`);

  // Create SMS templates
  console.log('Creating SMS templates...');
  const templates = [
    {
      name: 'Payment Due Reminder',
      templateType: 'payment_due',
      message: 'Hi {tenant_name}, this is a reminder that your rent payment of ${amount} is due on {due_date}. Thank you!',
      isActive: true,
      daysBefore: 3,
    },
    {
      name: 'Payment Overdue',
      templateType: 'payment_overdue',
      message: 'Hi {tenant_name}, your rent payment of ${amount} was due on {due_date} and is now overdue. Please contact us immediately.',
      isActive: true,
      daysBefore: 0,
    },
    {
      name: 'Maintenance Update',
      templateType: 'maintenance_update',
      message: 'Hi {tenant_name}, your maintenance request "{title}" has been updated to: {status}.',
      isActive: true,
    },
    {
      name: 'Lease Renewal',
      templateType: 'lease_renewal',
      message: 'Hi {tenant_name}, your lease is expiring on {end_date}. Please contact us to discuss renewal options.',
      isActive: true,
      daysBefore: 60,
    },
  ];

  await Promise.all(
    templates.map((template) =>
      prisma.smsTemplate.create({
        data: template,
      })
    )
  );
  console.log(`✅ Created ${templates.length} SMS templates`);

  console.log('🎉 Seeding complete!');
  console.log(`
  Summary:
  - Companies: ${createdCompanies.length}
  - Properties: ${properties.length}
  - Tenants: ${tenantCount}
  - Leases: ${leaseCount}
  - Maintenance Requests: ${maintenanceRequests.length}
  - SMS Templates: ${templates.length}
  - Super Admin: ${superAdmin.email}
  `);
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
