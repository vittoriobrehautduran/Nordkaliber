// Standard Vercel serverless function
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get Stripe publishable key from environment
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('STRIPE_PUBLISHABLE_KEY not found in environment variables');
    return res.status(500).json({ 
      error: 'Stripe configuration not found',
      details: 'Publishable key not configured'
    });
  }

  res.json({
    publishableKey: publishableKey
  });
} 