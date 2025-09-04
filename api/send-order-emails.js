// Import the email functions
const { sendOrderEmails } = require('./email-service');

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

    // Send the emails
    const result = await sendOrderEmails(orderData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Order confirmation emails sent successfully',
        details: result
      })
    };
  } catch (error) {
    console.error('❌ Error in production order email service:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send order confirmation emails',
        details: error.message
      })
    };
  }
};
