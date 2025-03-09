import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed initial config data
  const configData = [
    { configKey: 'access_token', configValue: '' },
    { configKey: 'api_key', configValue: '' },
    { configKey: 'app_id', configValue: '' },
    { configKey: 'client_id', configValue: process.env.HUBSPOT_CLIENT_ID || '' },
    { configKey: 'client_secret', configValue: process.env.HUBSPOT_CLIENT_SECRET || '' },
    { configKey: 'install_url', configValue: '' },
    { configKey: 'redirect_url', configValue: process.env.HUBSPOT_REDIRECT_URL || 'http://localhost:3000/api/hubspot/install' },
    { configKey: 'refresh_token', configValue: '' },
  ];

  console.log('Seeding config data...');
  
  for (const config of configData) {
    await prisma.config.upsert({
      where: { configKey: config.configKey },
      update: { configValue: config.configValue },
      create: config,
    });
  }

  // Seed sample login credential
  await prisma.loginCredential.upsert({
    where: { contactId: 13001 },
    update: {
      email: 'demo@example.com',
      password: 'password123'
    },
    create: {
      contactId: 13001,
      email: 'demo@example.com',
      password: 'password123',
      insertDate: new Date()
    }
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });