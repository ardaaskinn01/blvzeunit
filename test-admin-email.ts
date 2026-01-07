// Test için mock order objesi
// Bu dosyayı çalıştırarak admin e-postasını test edebilirsiniz

import { EmailService } from './netlify/functions/services/email';

const mockOrder = {
    id: 'test-order-12345678',
    created_at: new Date().toISOString(),
    total_amount: 100,
    currency: 'TRY',
    payment_status: 'paid',
    contact_info: {
        email: 'test@example.com',
        phone: '+90 555 123 4567'
    },
    shipping_address: {
        full_name: 'Test Kullanıcı',
        address: 'Test Mahallesi, Test Sokak No:1',
        city: 'İstanbul',
        country: 'Türkiye'
    },
    items: [
        {
            product_name: 'Test Ürün',
            size: 'M',
            quantity: 1,
            price: 100
        }
    ]
};

async function testAdminEmail() {
    console.log('🧪 Testing admin email notification...');

    const emailService = new EmailService();
    const result = await emailService.sendAdminOrderNotification(mockOrder);

    if (result) {
        console.log('✅ Test başarılı! E-posta gönderildi:', result.data?.id);
    } else {
        console.log('❌ Test başarısız! E-posta gönderilemedi.');
    }
}

testAdminEmail();
