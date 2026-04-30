
async function test() {
    console.log('Testing categories retrieval with tenant header...');
    try {
        const response = await fetch('http://127.0.0.1:3001/api/v1/catalog/categories', {
            headers: {
                'x-tenant-id': 'mock-tenant'
            }
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Categories count:', data.length);
        if (data.length > 0) {
            console.log('First Category:', data[0].name);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
