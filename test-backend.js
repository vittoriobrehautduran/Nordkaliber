const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testBackend() {
    console.log('🧪 Testing Nordkaliber Backend...\n');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);
        console.log('   Environment:', healthData.environment);
        console.log('   Timestamp:', healthData.timestamp);

        // Test config endpoint
        console.log('\n2. Testing config endpoint...');
        const configResponse = await fetch(`${BASE_URL}/api/config`);
        const configData = await configResponse.json();
        console.log('✅ Config loaded');
        console.log('   Stripe configured:', !!configData.publishableKey);

        // Test checkout session creation (without Stripe keys)
        console.log('\n3. Testing checkout session creation...');
        const testItems = [
            {
                caliber: '6.5x55',
                primary: 'black',
                secondary: 'gold',
                initials: 'JS',
                price: 850,
                specialRequests: {
                    caliber: 'Custom caliber request'
                }
            }
        ];

        const checkoutResponse = await fetch(`${BASE_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: testItems,
                customerEmail: 'test@example.com'
            }),
        });

        if (checkoutResponse.status === 500) {
            console.log('⚠️  Checkout endpoint responded with error (expected without Stripe keys)');
            console.log('   This is normal if Stripe keys are not configured');
        } else {
            const checkoutData = await checkoutResponse.json();
            console.log('✅ Checkout session created:', checkoutData.sessionId ? 'Yes' : 'No');
        }

        console.log('\n🎉 Backend tests completed!');
        console.log('\n📝 Next steps:');
        console.log('1. Set up your Stripe account');
        console.log('2. Add your Stripe keys to .env file');
        console.log('3. Test the full checkout flow');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running with: npm run dev');
    }
}

// Run tests
testBackend(); 