const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  console.log('🔍 [DIAGNOSTIC] Checking users for tenant: post-restoran-demo');
  
  const users = await prisma.user.findMany({
    where: { 
      tenantId: 'post-restoran-demo'
    },
    select: {
      id: true,
      username: true,
      email: true,
      isActive: true,
      role: true
    }
  });

  console.log(`📊 Found ${users.length} users in this tenant:`);
  users.forEach(u => {
    console.log(`- ID: ${u.id} | User: [${u.username}] | Active: ${u.isActive} | Role: ${u.role}`);
  });

  const exactMatch = await prisma.user.findFirst({
    where: { username: 'yilmaz', tenantId: 'post-restoran-demo' }
  });
  console.log(`🎯 Exact match for 'yilmaz': ${exactMatch ? 'FOUND ✔' : 'NOT FOUND ❌'}`);

  const caseInsensitiveMatch = await prisma.user.findFirst({
    where: { 
        username: { equals: 'yilmaz', mode: 'insensitive' },
        tenantId: 'post-restoran-demo' 
    }
  });
  console.log(`💡 Case-insensitive match for 'yilmaz': ${caseInsensitiveMatch ? 'FOUND ✔ (' + caseInsensitiveMatch.username + ')' : 'NOT FOUND ❌'}`);

  await prisma.$disconnect();
}

diagnose();
