const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:postgres@localhost:5432/template1'
        }
    }
});

async function fix() {
    console.log('Fixing collation version for template1...');
    try {
        await prisma.$executeRawUnsafe('ALTER DATABASE template1 REFRESH COLLATION VERSION;');
        console.log('Success.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
