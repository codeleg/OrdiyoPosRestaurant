const axios = require('axios');

async function testTableCreation() {
    const baseUrl = 'http://localhost:3001/api/v1';

    try {
        // 1. Login to get token and tenantId
        const loginRes = await axios.post(`${baseUrl}/auth/login`, {
            email: 'admin@test.com', // Seed verisinde bu kullanıcı var mı kontrol etmeliyim
            password: 'password123'
        });

        const token = loginRes.data.accessToken;
        const tenantId = loginRes.data.user.tenantId;

        console.log('Logged in. Token:', token.substring(0, 10) + '...');
        console.log('Tenant ID:', tenantId);

        // 2. Try to create a table
        console.log('Attempting to create table...');
        const tableRes = await axios.post(`${baseUrl}/tables`, {
            number: 'DEBUG-' + Date.now(),
            capacity: 4,
            zoneId: '' // Testing the empty string case
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-tenant-id': tenantId
            }
        });

        console.log('Table created successfully:', tableRes.data);
    } catch (error) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

testTableCreation();
