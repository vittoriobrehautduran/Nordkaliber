const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
    timeout: 30000,
    maxNetworkRetries: 3
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
      const { items, customerEmail, customerName, customerPhone, customerAddress } = JSON.parse(event.body);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid items data' })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
      })
    };
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
      error: 'Failed to create payment intent',
      details: error.message
      })
    };
  }
}; 