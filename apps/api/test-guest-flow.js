const fetch = require('node-fetch');

async function test() {
    try {
        console.log("1. Init Session...");
        const initRes = await fetch('http://localhost:3001/api/v1/guest/session/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantId: 'post-restoran-demo',
                tableId: '00000000-0000-0000-0000-000000000000', // A valid UUID format just in case
                fingerprint: 'test-fingerprint'
            })
        });

        const initBody = await initRes.json();
        console.log("Init session response:", initRes.status, initBody);

        if (!initBody.sessionToken) return;

        console.log("2. Fetch Menu...");
        const menuRes = await fetch('http://localhost:3001/api/v1/guest/menu', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${initBody.sessionToken}` }
        });
        const menuBody = await menuRes.json();
        console.log("Menu response:", menuRes.status, menuBody.categories?.[0]?.items?.[0] ? "Has items" : "No items");

        let itemId = null;
        if (menuBody.categories?.[0]?.items?.[0]) {
            itemId = menuBody.categories[0].items[0].id;
        }

        if (!itemId) {
            console.log("No menu items to test with!");
            return;
        }

        console.log("3. Checkout...");
        const checkoutRes = await fetch('http://localhost:3001/api/v1/guest/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${initBody.sessionToken}`,
                'x-idempotency-key': 'test-123'
            },
            body: JSON.stringify({
                items: [{ catalogItemId: itemId, quantity: 1, note: "Test string" }]
            })
        });

        const checkoutBody = await checkoutRes.json();
        console.log("Checkout response:", checkoutRes.status, checkoutBody);

    } catch (e) {
        console.error(e);
    }
}

test();
