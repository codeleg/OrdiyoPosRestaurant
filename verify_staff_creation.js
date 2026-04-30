const axios = require('axios');

async function test() {
    try {
        const response = await axios.post('http://localhost:3001/api/v1/staff', {
            email: 'test_staff_' + Math.random().toString(36).substring(7) + '@example.com',
            fullName: 'Test Staff',
            password: 'password123',
            role: 'WAITER',
            shift: 'Morning'
        }, {
            headers: {
                'x-tenant-id': 'default' // Mock tenant ID for now
            }
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
    }
}

test();
