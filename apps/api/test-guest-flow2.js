const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function test() {
    try {
        console.log("0. Finding valid tenant, table, and product...");
        const table = await prisma.table.findFirst({
            where: { isDeleted: false },
            include: { zone: { select: { tenantId: true } } }
        });

        if (!table) {
            console.log("No table found");
            return;
        }

        const tenantId = table.zone.tenantId;
        const product = await prisma.product.findFirst({
            where: { tenantId, isDeleted: false }
        });

        if (!product) {
            console.log("No product found for tenant", tenantId);
            return;
        }

        console.log(`Using Tenant: ${tenantId}, Table: ${table.id}, Product: ${product.id}`);

        console.log("1. Init Session...");
        const initRes = await fetch('http://localhost:3001/api/v1/guest/session/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantId: tenantId,
                tableId: table.id,
                fingerprint: 'test-fingerprint'
            })
        });

        const initBody = await initRes.json();
        console.log("Init session response:", initRes.status, initBody);

        if (!initBody.sessionToken) return;

        console.log("2. Checkout...");
        const checkoutRes = await fetch('http://localhost:3001/api/v1/guest/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${initBody.sessionToken}`,
                'x-idempotency-key': 'test-123'
            },
            body: JSON.stringify({
                items: [{ catalogItemId: product.id, quantity: 1, note: "Test note" }]
            })
        });

        const checkoutBody = await checkoutRes.json();
        console.log("Checkout response:", checkoutRes.status, checkoutBody);

        if (checkoutRes.status === 201 || checkoutRes.status === 200) {
            console.log("3. Simulate Callback...");
            const callbackRes = await fetch('http://localhost:3001/api/v1/guest/checkout/callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: checkoutBody.token })
            });
            const callbackBody = await callbackRes.json();
            console.log("Callback response:", callbackRes.status, callbackBody);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
