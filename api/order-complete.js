const { sendOrderEmails } = require('./email-service');

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
    const orderData = req.body;

    if (!orderData || !orderData.customer || !orderData.items) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    console.log('📦 Processing order completion:', orderData.orderId);

    // Send emails
    const emailResults = await sendOrderEmails(orderData);

    // Log the results
    console.log('📧 Email results:', emailResults);

    // Return success response
    res.json({
      success: true,
      orderId: orderData.orderId,
      emailsSent: emailResults,
      message: 'Order processed successfully'
    });

  } catch (error) {
    console.error('❌ Error processing order completion:', error);
    res.status(500).json({ 
      error: 'Failed to process order completion',
      details: error.message
    });
  }
}; 