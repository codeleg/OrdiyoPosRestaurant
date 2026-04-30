const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: { name: true, image: true, tenantId: true }
    });
    console.log("LAST 5 ENTIRES:");
    console.log(JSON.stringify(products.slice(-5), null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
