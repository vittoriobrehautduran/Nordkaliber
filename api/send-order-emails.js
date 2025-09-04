exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Parse the order data from the request body
    const orderData = JSON.parse(event.body);
    
    console.log('📧 Production order email service called:', {
      orderId: orderData.orderId,
      customerEmail: orderData.customer?.email,
      itemCount: orderData.items?.length
    });

    // Log order data for manual email processing
    console.log('📋 Order data for manual email processing:', orderData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Order data logged for manual email processing',
        orderId: orderData.orderId
      })
    };
  } catch (error) {
    console.error('❌ Error in production order email service:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process order email request',
        details: error.message
      })
    };
  }
};
