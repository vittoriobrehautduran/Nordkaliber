// Keep Vercel functions warm for better Stripe payment performance
// Run this script periodically to prevent cold starts

const https = require('https');

const VERCEL_URL = process.env.VERCEL_URL || 'https://your-app.vercel.app';

function pingHealthEndpoint() {
    return new Promise((resolve, reject) => {
        const req = https.get(`${VERCEL_URL}/api/vercel-health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log(`✅ Function warmed: ${response.message}`);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Failed to warm function:', error.message);
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Keep functions warm every 5 minutes
async function keepWarm() {
    try {
        await pingHealthEndpoint();
    } catch (error) {
        console.error('Failed to keep function warm:', error.message);
    }
}

// Run immediately
keepWarm();

// Then every 5 minutes
setInterval(keepWarm, 5 * 60 * 1000);

console.log('🔥 Vercel function warmer started');
console.log('📡 Pinging:', VERCEL_URL);
console.log('⏰ Interval: Every 5 minutes'); 