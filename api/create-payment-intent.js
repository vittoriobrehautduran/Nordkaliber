const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
    timeout: 30000,
    maxNetworkRetries: 3
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, customerEmail, customerName, customerPhone, customerAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid items data' });
    }

    // Calculate total amount and convert to cents (Stripe expects smallest currency unit)
    const totalAmountInKronor = items.reduce((sum, item) => sum + item.price, 0);
    const totalAmountInCents = Math.round(totalAmountInKronor * 100); // Convert SEK to cents

    console.log('💰 Amount calculation:', {
      totalInKronor: totalAmountInKronor,
      totalInCents: totalAmountInCents,
      items: items.map(item => ({ name: item.caliber, price: item.price }))
    });

    // Create payment intent with Swedish payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents, // Amount in cents
      currency: 'sek',
      metadata: {
        order_type: 'custom_ammunition_box',
        items_count: items.length.toString(),
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: JSON.stringify(items)
      },
      // Configure automatic payment methods (this will automatically detect available methods)
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      // Add setup for future payments if needed
      setup_future_usage: 'off_session',
      // Add receipt email
      receipt_email: customerEmail,
      // Add description
      description: `Nordkaliber order - ${items.length} item(s)`,
    });

    console.log('✅ Payment Intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.message
    });
  }
}; 