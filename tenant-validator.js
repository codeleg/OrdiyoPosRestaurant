const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('--- Multi-Tenant Diagnostic Start ---');

        // 1. Ensure two tenants exist
        let tenant1 = await prisma.tenant.findUnique({ where: { id: 'mock-tenant' } });
        if (!tenant1) {
            console.log('Creating Tenant 1...');
            tenant1 = await prisma.tenant.create({
                data: { id: 'mock-tenant', name: 'Original Mock Restaurant' }
            });
        }

        let tenant2 = await prisma.tenant.findUnique({ where: { id: 'tenant-beta' } });
        if (!tenant2) {
            console.log('Creating Tenant 2...');
            tenant2 = await prisma.tenant.create({
                data: { id: 'tenant-beta', name: 'Beta Test Restaurant' }
            });
        }

        console.log(`Verified Tenants: ${tenant1.id}, ${tenant2.id}`);

        // 2. Inject Outbox Events for both
        console.log('Injecting concurrent outbox events...');

        const event1 = await prisma.outboxEvent.create({
            data: {
                tenantId: tenant1.id,
                type: 'order.updated',
                payload: { test: 'isolation-check-1', timestamp: new Date().toISOString() },
                status: 'PENDING'
            }
        });

        const event2 = await prisma.outboxEvent.create({
            data: {
                tenantId: tenant2.id,
                type: 'order.updated',
                payload: { test: 'isolation-check-2', timestamp: new Date().toISOString() },
                status: 'PENDING'
            }
        });

        console.log(`Created Event 1: ${event1.id} (Tenant: ${event1.tenantId})`);
        console.log(`Created Event 2: ${event2.id} (Tenant: ${event2.tenantId})`);

        console.log('--- Diagnostic Setup Complete ---');
        console.log('Monitor logs for SUCCESSFUL relay of these UUIDs.');

    } catch (e) {
        console.error('DIAGNOSTIC ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

run();
