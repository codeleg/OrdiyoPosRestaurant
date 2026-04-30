
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('--- BRANDING UPDATE (COMMONJS) ---');

    try {
        // Update all tenant names
        const result = await prisma.tenant.updateMany({
            data: { name: 'Ordiyo' }
        });
        console.log(`Updated ${result.count} tenants.`);

        // Determine if fullName exists and update
        const users = await prisma.user.updateMany({
            where: { fullName: { contains: 'PostRestoran' } },
            data: { fullName: 'Ordiyo Admin' }
        });
        console.log(`Updated ${users.count} users.`);
    } catch (err) {
        console.error('Error updating branding:', err.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
