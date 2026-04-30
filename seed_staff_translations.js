const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const translations = [
        // Staff Page
        { key: 'staff.add_staff', tr: 'Yeni Personel Ekle', en: 'Add New Staff' },
        { key: 'staff.role_waiter', tr: 'Garson', en: 'Waiter' },
        { key: 'staff.role_kitchen', tr: 'Mutfak', en: 'Chef' },
        { key: 'staff.role_cashier', tr: 'Kasiyer', en: 'Cashier' },
        { key: 'staff.role_manager', tr: 'Müdür', en: 'Manager' },
        { key: 'staff.role_owner', tr: 'Restoran Sahibi', en: 'Owner' },
        { key: 'staff.status_active', tr: 'Aktif', en: 'Active' },
        { key: 'staff.status_off_duty', tr: 'Mesai Dışı', en: 'Off-duty' },
        { key: 'staff.current_shift', tr: 'Mevcut Vardiya', en: 'Current Shift' },
        { key: 'staff.shift_morning', tr: 'Sabah', en: 'Morning' },
        { key: 'staff.shift_evening', tr: 'Akşam', en: 'Evening' },
        { key: 'staff.shift_full_day', tr: 'Tam Gün', en: 'Full Day' },
        { key: 'staff.shift_full', tr: 'Tam', en: 'Full' },
        { key: 'staff.set_off_duty', tr: 'Mesaiyi Bitir', en: 'Set Off-duty' },
        { key: 'staff.set_active', tr: 'Mesaiye Başlat', en: 'Set Active' },

        // Modal
        { key: 'modal.add_staff.title', tr: 'Yeni Personel Kaydı', en: 'Add New Staff' },
        { key: 'modal.add_staff.full_name', tr: 'Ad Soyad', en: 'Full Name' },
        { key: 'modal.add_staff.full_name_placeholder', tr: 'Örn. Ahmet Yılmaz', en: 'e.g. John Doe' },
        { key: 'modal.add_staff.email', tr: 'E-posta Adresi', en: 'Email Address' },
        { key: 'modal.add_staff.email_placeholder', tr: 'ahmet@example.com', en: 'john@example.com' },
        { key: 'modal.add_staff.password', tr: 'Giriş Şifresi', en: 'Initial Password' },
        { key: 'modal.add_staff.role', tr: 'Pozisyon', en: 'Role' },
        { key: 'modal.add_staff.shift', tr: 'Vardiya', en: 'Shift' },
        { key: 'modal.add_staff.save', tr: 'PERSONELİ OLUŞTUR', en: 'CREATE STAFF' },
        { key: 'common.cancel', tr: 'İptal', en: 'Cancel' },
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

    console.log('Translations seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
