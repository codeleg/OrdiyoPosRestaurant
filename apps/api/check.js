const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ where: { username: 'melis' }, include: { tenant: true } });
  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));
  const devices = await prisma.device.findMany();
  console.log('--- DEVICES ---');
  console.log(JSON.stringify(devices, null, 2));
}
run().catch(console.error).finally(() => prisma.());
