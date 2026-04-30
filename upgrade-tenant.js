const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('--- Tenant Upgrade Start ---');
        const tenant = await prisma.tenant.update({
            where: { id: 'mock-tenant' },
            data: { planType: 'PRO' }
        });
        console.log(`SUCCESS: Tenant ${tenant.id} plan updated to ${tenant.planType}`);

        const users = await prisma.user.findMany({
            where: { tenantId: 'mock-tenant' }
        });
        console.log('--- Tenant Users ---');
        users.forEach(u => {
            console.log(`User: ${u.email} | Role: ${u.role}`);
        });
    } catch (e) {
        console.error('UPGRADE ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
