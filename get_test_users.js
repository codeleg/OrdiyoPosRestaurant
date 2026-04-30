
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const owner = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        include: { tenant: true }
    });
    console.log('OWNER:', owner ? { email: owner.email, tenantId: owner.tenantId, tenantName: owner.tenant.name } : 'Not found');

    const waiter = await prisma.user.findFirst({
        where: { role: 'WAITER' },
        include: { tenant: true }
    });
    console.log('WAITER:', waiter ? { email: waiter.email, tenantId: waiter.tenantId, tenantName: waiter.tenant.name } : 'Not found');
}

main().catch(console.error).finally(() => prisma.$disconnect());
