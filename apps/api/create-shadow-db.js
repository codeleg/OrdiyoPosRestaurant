const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:postgres@localhost:5432/postgres'
        }
    }
});

async function fix() {
    console.log('Creating pos_db_shadow...');
    try {
        // DROP DATABASE IF EXISTS isn't standard in all PG versions without force, but let's just create it
        await prisma.$executeRawUnsafe('CREATE DATABASE pos_db_shadow;');
        console.log('Success.');
    } catch (err) {
        console.error('Error (might already exist):', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
