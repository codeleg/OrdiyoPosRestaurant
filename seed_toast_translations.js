const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const translations = [
        // Staff Success
        { key: 'staff.toast_create_success', tr: 'Yeni personel başarıyla oluşturuldu.', en: 'New staff member created successfully.' },
        { key: 'staff.toast_update_success', tr: 'Personel bilgileri güncellendi.', en: 'Staff information updated successfully.' },
        { key: 'staff.toast_error', tr: 'Personel işlemi sırasında bir hata oluştu.', en: 'An error occurred during staff operation.' },

        // Product Success
        { key: 'menu.toast_create_success', tr: 'Ürün başarıyla menüye eklendi.', en: 'Product added to menu successfully.' },
        { key: 'menu.toast_update_success', tr: 'Ürün bilgileri güncellendi.', en: 'Product information updated successfully.' },
        { key: 'menu.toast_error', tr: 'Ürün işlemi sırasında bir hata oluştu.', en: 'An error occurred during product operation.' },

        // Table Success
        { key: 'tables.toast_create_success', tr: 'Yeni masa başarıyla oluşturuldu.', en: 'New table created successfully.' },
        { key: 'tables.toast_update_success', tr: 'Masa durumu güncellendi.', en: 'Table status updated successfully.' },
        { key: 'tables.toast_error', tr: 'Masa işlemi sırasında bir hata oluştu.', en: 'An error occurred during table operation.' },

        // Zone Success
        { key: 'zones.toast_create_success', tr: 'Yeni bölge başarıyla oluşturuldu.', en: 'New zone created successfully.' },
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

    console.log('Toast translations seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
