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

  if (event.httpMethod !== 'GET') {
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
    
    const { payment_intent } = event.queryStringParameters;
    
    if (!payment_intent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment intent ID is required' })
      };
    }

    console.log('🔍 Fetching payment details:', {
      mode: isTestMode ? 'test' : 'live',
      paymentIntentId: payment_intent
    });

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
    
    console.log('✅ Payment Intent retrieved:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      mode: isTestMode ? 'test' : 'live'
    });

    // Convert amount from cents to main currency unit
    const amountInKronor = paymentIntent.amount / 100;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        amountInKronor: amountInKronor,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        mode: isTestMode ? 'test' : 'live',
        isTestMode: isTestMode,
        customerEmail: paymentIntent.receipt_email,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata
      })
    };
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};
