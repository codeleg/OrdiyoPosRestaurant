const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const translations = [
        { key: 'tables.add_table', tr: 'Masa Ekle', en: 'Add Table' },
        { key: 'tables.add_zone', tr: 'Bölge Ekle', en: 'Add Zone' },
        { key: 'modal.add_table.title', tr: 'Yeni Masa Kaydı', en: 'Add New Table' },
        { key: 'modal.add_table.number', tr: 'Masa Numarası', en: 'Table Number' },
        { key: 'modal.add_table.capacity', tr: 'Kapasite', en: 'Capacity' },
        { key: 'modal.add_table.zone', tr: 'Bölge', en: 'Zone / Area' },
        { key: 'modal.add_table.select_zone', tr: 'Bölge Seçiniz', en: 'Select Zone' },
        { key: 'modal.add_table.save', tr: 'MASAYI OLUŞTUR', en: 'CREATE TABLE' },
        { key: 'modal.add_zone.title', tr: 'Yeni Bölge Kaydı', en: 'Add New Zone' },
        { key: 'modal.add_zone.name', tr: 'Bölge Adı', en: 'Zone Name' },
        { key: 'modal.add_zone.placeholder', tr: 'Örn. Bahçe, VIP, Teras', en: 'e.g. Garden, VIP, Terrace' },
        { key: 'modal.add_zone.save', tr: 'BÖLGEYİ OLUŞTUR', en: 'CREATE ZONE' },
    ];

    for (const t of translations) {
        // Turkish
        await prisma.translation.upsert({
            where: { key_languageCode: { key: t.key, languageCode: 'tr' } },
            update: { value: t.tr },
            create: { key: t.key, value: t.tr, languageCode: 'tr' },
        });
        // English
        await prisma.translation.upsert({
            where: { key_languageCode: { key: t.key, languageCode: 'en' } },
            update: { value: t.en },
            create: { key: t.key, value: t.en, languageCode: 'en' },
        });
    }

    console.log('Table management translations seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
