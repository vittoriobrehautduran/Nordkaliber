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
    const orderData = JSON.parse(event.body);

    if (!orderData || !orderData.customer || !orderData.items) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid order data' })
      };
    }

    console.log('📦 Processing order completion:', orderData.orderId);

    // Log order data for manual processing
    console.log('📋 Order details:', {
      orderId: orderData.orderId,
      customer: orderData.customer,
      items: orderData.items,
      total: orderData.total
    });

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId: orderData.orderId,
        message: 'Order processed successfully - emails will be sent manually'
      })
    };

  } catch (error) {
    console.error('❌ Error processing order completion:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process order completion',
        details: error.message
      })
    };
  }
}; 