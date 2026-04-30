import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Summary ---');
  const [tenants, users, products, orders] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  console.log(`Total Tenants: ${tenants}`);
  console.log(`Total Users: ${users}`);
  console.log(`Total Products: ${products}`);
  console.log(`Total Orders: ${orders}`);

  console.log('\n--- Tenant Data Distribution ---');
  const tenantData = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          users: true,
          products: true,
          orders: true,
          categories: true,
        }
      }
    }
  });

  tenantData.forEach(t => {
    console.log(`Tenant: ${t.name} (${t.id})`);
    console.log(`  Users: ${t._count.users}`);
    console.log(`  Products: ${t._count.products}`);
    console.log(`  Orders: ${t._count.orders}`);
    console.log(`  Categories: ${t._count.categories}`);
  });

  console.log('\n--- Image File Audit ---');
  const productImages = await prisma.product.findMany({
    where: { image: { not: null } },
    select: { image: true }
  });

  const categoryImages = await prisma.category.findMany({
    where: { image: { not: null } },
    select: { image: true }
  });

  const activeImages = new Set([
     ...productImages.map(p => p.image).filter(Boolean),
     ...categoryImages.map(c => c.image).filter(Boolean)
  ]);

  console.log(`Active unique image paths in DB: ${activeImages.size}`);

  const uploadsDir = '/home/usermetin/projects/PostRestoran/apps/api/uploads';
  
  function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      if (fs.statSync(fullPath).isDirectory()) {
         arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else {
         arrayOfFiles.push(fullPath);
      }
    });

    return arrayOfFiles;
  }

  const allFiles = getAllFiles(uploadsDir);
  console.log(`Total files in uploads: ${allFiles.length}`);

  let unusedCount = 0;
  allFiles.forEach(absolutePath => {
    // Determine relative path as stored in DB (usually /uploads/...)
    // The DB might store '/uploads/post-restoran-demo/products/xxx.webp'
    // or 'uploads/post-restoran-demo/products/xxx.webp'
    const relativePath = absolutePath.split('apps/api')[1];
    if (relativePath) {
        const pathWithSlash = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
        const pathWithoutLeadingSlash = pathWithSlash.substring(1);
        
        if (!activeImages.has(pathWithSlash) && !activeImages.has(pathWithoutLeadingSlash)) {
          unusedCount++;
        }
    }
  });

  console.log(`Unused/Orphaned files: ${unusedCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
