const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ where: { username: 'melis' }, include: { tenant: true } });
  console.log('--- USERS (melis) ---');
  console.log(JSON.stringify(users, null, 2));
  
  const allUsers = await prisma.user.findMany({ select: { username: true, tenantId: true } });
  console.log('--- ALL USERNAMES ---');
  console.log(allUsers);

  const devices = await prisma.device.findMany();
  console.log('--- ALL DEVICES ---');
  console.log(JSON.stringify(devices, null, 2));
}
run().catch(console.error).finally(() => prisma.$disconnect());
