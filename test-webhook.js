const crypto = require('crypto');

// Simulate a Stripe webhook event
const testWebhook = () => {
    console.log('🧪 Testing Webhook Setup...\n');

    // Sample webhook payload (checkout.session.completed event)
    const payload = {
        id: 'evt_test_webhook',
        object: 'event',
        api_version: '2023-10-16',
        created: Math.floor(Date.now() / 1000),
        data: {
            object: {
                id: 'cs_test_session',
                object: 'checkout.session',
                amount_total: 85000, // 850 SEK in cents
                currency: 'sek',
                customer_email: 'test@example.com',
                metadata: {
                    order_type: 'custom_ammunition_box',
                    items_count: '1'
                },
                payment_status: 'paid',
                status: 'complete'
            }
        },
        livemode: false,
        pending_webhooks: 1,
        request: {
            id: 'req_test',
            idempotency_key: null
        },
        type: 'checkout.session.completed'
    };

    // Create a test signature (you'll need your actual webhook secret)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    
    const signedPayload = `${timestamp}.${payloadString}`;
    const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload, 'utf8')
        .digest('hex');

    console.log('📋 Webhook Test Data:');
    console.log('Event Type:', payload.type);
    console.log('Session ID:', payload.data.object.id);
    console.log('Amount:', payload.data.object.amount_total / 100, 'SEK');
    console.log('Customer Email:', payload.data.object.customer_email);
    console.log('Payment Status:', payload.data.object.payment_status);

    console.log('\n🔗 To test with your actual server:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Use Stripe CLI: stripe listen --forward-to localhost:3000/api/webhook');
    console.log('3. Or test manually with curl:');
    console.log(`   curl -X POST http://localhost:3000/api/webhook \\
     -H "Content-Type: application/json" \\
     -H "Stripe-Signature: t=${timestamp},v1=${signature}" \\
     -d '${payloadString}'`);

    console.log('\n📊 Expected Server Response:');
    console.log('- "Payment successful for session: cs_test_session"');
    console.log('- "Processing successful payment for session: cs_test_session"');
    console.log('- Order details logged');

    console.log('\n⚠️  Important Notes:');
    console.log('- Make sure your .env file has STRIPE_WEBHOOK_SECRET set');
    console.log('- Webhook URL should be: http://localhost:3000/api/webhook (development)');
    console.log('- For production, use HTTPS and your actual domain');
};

// Run the test
testWebhook(); 