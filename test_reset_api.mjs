import fetch from 'node-fetch';

const API_URL = 'http://127.0.0.1:3001/api/v1';

async function performLogin(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: 'post-restoran-demo', email, password })
    });
    if (!res.ok) {
        console.error('Login failed:', await res.text());
        return null;
    }
    const data = await res.json();
    return data.access_token;
}

async function testResetEndpoint(token, body) {
    const res = await fetch(`${API_URL}/admin/reset-orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    // Catch 401s, 403s etc
    if (!res.ok) {
        const err = await res.json().catch(() => res.text());
        return { status: res.status, error: err };
    }

    return { status: res.status, data: await res.json() };
}

async function runTests() {
    console.log('--- TESTING TENANT SOFT RESET ---');

    try {
        console.log('\n[1] Getting WAITER token...');
        const waiterToken = await performLogin('waiter@demo.com', 'admin123');

        if (waiterToken) {
            console.log('\n[2] Testing with WAITER role (Should return 403 Forbidden)...');
            const res1 = await testResetEndpoint(waiterToken, { confirmText: 'RESET ORDERS' });
            console.log('Result:', res1);
        } else {
            console.log('Waiter login failed.');
        }

        console.log('\n[3] Getting OWNER token...');
        const ownerToken = await performLogin('admin@demo.com', 'admin123');
        if (!ownerToken) {
            throw new Error("Failed to get owner token");
        }

        console.log('\n[4] Testing OWNER with wrong confirm text (Should return 403)...');
        const res2 = await testResetEndpoint(ownerToken, { confirmText: 'WRONG TEXT' });
        console.log('Result:', res2);

        console.log('\n[5] Testing OWNER with correct confirm text (Will return 403 if ALLOW_TENANT_RESET is missing)...');
        const res3 = await testResetEndpoint(ownerToken, { confirmText: 'RESET ORDERS' });
        console.log('Result:', res3);

    } catch (e) {
        console.error('Test script Error:', e);
    }
}

runTests();
