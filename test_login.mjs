
async function test() {
    console.log('Testing login...');
    try {
        const response = await fetch('http://127.0.0.1:3001/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tenantId: 'mock-tenant',
                email: 'admin@postrestoran.com',
                password: 'admin123'
            })
        });
        console.log('Status:', response.status);
        console.log('Body:', await response.text());
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
