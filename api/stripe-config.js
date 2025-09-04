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

  try {
    // Check if we're in test mode (via query parameter or environment)
    const isTestMode = event.queryStringParameters?.test === 'true' || process.env.STRIPE_MODE === 'test';
    
    // Get appropriate Stripe keys based on mode
    const publishableKey = isTestMode ? 
      process.env.STRIPE_PUBLISHABLE_KEY_TEST : 
      process.env.STRIPE_PUBLISHABLE_KEY;
    
    const secretKey = isTestMode ? 
      process.env.STRIPE_SECRET_KEY_TEST : 
      process.env.STRIPE_SECRET_KEY;
    
    console.log('🔑 Stripe configuration:', {
      mode: isTestMode ? 'test' : 'live',
      hasPublishableKey: !!publishableKey,
      hasSecretKey: !!secretKey
    });
    
    if (!publishableKey) {
      const keyType = isTestMode ? 'STRIPE_PUBLISHABLE_KEY_TEST' : 'STRIPE_PUBLISHABLE_KEY';
      console.error(`${keyType} not found in environment variables`);
      console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Stripe configuration not found',
          details: `${keyType} not configured`,
          mode: isTestMode ? 'test' : 'live',
          availableKeys: Object.keys(process.env).filter(key => key.includes('STRIPE')),
          debug: {
            isTestMode,
            requestedKey: keyType,
            hasTestKey: !!process.env.STRIPE_PUBLISHABLE_KEY_TEST,
            hasLiveKey: !!process.env.STRIPE_PUBLISHABLE_KEY
          }
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        publishableKey: publishableKey,
        mode: isTestMode ? 'test' : 'live',
        isTestMode: isTestMode
      })
    };
  } catch (error) {
    console.error('Error in stripe-config:', error);
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