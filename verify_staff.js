const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBvc3RyZXN0b3Jhbi5jb20iLCJzdWIiOiI1ODQ4YTVjYy0zMTkxLTQlNzgtODU0Mi0xZTJhMjI4N2JjOGIiLCJyb2xlIjoiT1dORVIiLCJ0ZW5hbnRJZCI6Im1vY2stdGVuYW50IiwiaWF0IjoxNzcxMTEwMTI3LCJleHAiOjE3NzExMTM3Mjd9.E___IVpcQL9B364Cli2p1M3QlbVAn_9wOBP232N-FNQ";

console.log("Testing /api/v1/staff with token...");

fetch('http://localhost:3001/api/v1/staff', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
    .then(async res => {
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    })
    .catch(err => console.error(err));
