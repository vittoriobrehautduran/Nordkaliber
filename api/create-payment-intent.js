// Initialize Stripe with appropriate key based on mode
const getStripeInstance = (isTestMode) => {
  const secretKey = isTestMode ? 
    process.env.STRIPE_SECRET_KEY_TEST : 
    process.env.STRIPE_SECRET_KEY;
  
  return require('stripe')(secretKey, {
    apiVersion: '2025-07-30.basil',
    timeout: 30000,
    maxNetworkRetries: 3
  });
};

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
    // Check if we're in test mode
    const isTestMode = event.queryStringParameters?.test === 'true' || process.env.STRIPE_MODE === 'test';
    const stripe = getStripeInstance(isTestMode);
    
    const { items, customerEmail, customerName, customerPhone, customerAddress } = JSON.parse(event.body);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid items data' })
      };
    }

    // Calculate total amount and convert to cents (Stripe expects smallest currency unit)
    let totalAmountInKronor = items.reduce((sum, item) => {
        let itemPrice = item.price || 0;
        // Add 200 SEK for special requests
        if (item.specialRequest && item.specialRequest.trim()) {
            itemPrice += 200;
        }
        return sum + itemPrice;
    }, 0);
    const totalAmountInCents = Math.round(totalAmountInKronor * 100); // Convert SEK to cents

    console.log('💰 Payment Intent creation:', {
      mode: isTestMode ? 'test' : 'live',
      totalInKronor: totalAmountInKronor,
      totalInCents: totalAmountInCents,
      items: items.map(item => ({ name: item.caliber, price: item.price })),
      rawItems: items
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
        items: JSON.stringify(items),
        total_amount: totalAmountInKronor.toString(),
        is_test_mode: isTestMode.toString()
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
      mode: isTestMode ? 'test' : 'live',
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
        paymentIntentId: paymentIntent.id,
        mode: isTestMode ? 'test' : 'live',
        isTestMode: isTestMode
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