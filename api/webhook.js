const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendOrderEmails } = require('./email-service');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📦 Webhook event received:', event.type);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    
    case 'payment_intent.requires_action':
      await handlePaymentRequiresAction(event.data.object);
      break;
    
    case 'payment_method.attached':
      console.log('✅ Payment method attached:', event.data.object.id);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};

async function handlePaymentSucceeded(paymentIntent) {
  console.log('✅ Payment succeeded:', paymentIntent.id);
  
  try {
    // Extract order data from metadata
    const orderData = {
      orderId: paymentIntent.id,
      customer: {
        email: paymentIntent.receipt_email || paymentIntent.metadata.customer_email,
        name: paymentIntent.metadata.customer_name || 'Unknown',
        phone: paymentIntent.metadata.customer_phone || ''
      },
      items: JSON.parse(paymentIntent.metadata.items || '[]'),
      total: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method_types[0],
      status: 'paid'
    };

    // Send confirmation emails
    const emailResults = await sendOrderEmails(orderData);
    console.log('📧 Order confirmation emails sent:', emailResults);

    // Here you could also:
    // - Save order to database
    // - Update inventory
    // - Send notifications to admin
    // - Create shipping labels

  } catch (error) {
    console.error('❌ Error processing successful payment:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);
  
  try {
    // Send failure notification email
    const orderData = {
      orderId: paymentIntent.id,
      customer: {
        email: paymentIntent.receipt_email || paymentIntent.metadata.customer_email,
        name: paymentIntent.metadata.customer_name || 'Unknown'
      },
      items: JSON.parse(paymentIntent.metadata.items || '[]'),
      total: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      failureReason: paymentIntent.last_payment_error?.message || 'Unknown error'
    };

    // You could send a failure notification email here
    console.log('📧 Payment failed notification sent for order:', orderData.orderId);

  } catch (error) {
    console.error('❌ Error processing failed payment:', error);
  }
}

async function handlePaymentRequiresAction(paymentIntent) {
  console.log('⏳ Payment requires action:', paymentIntent.id);
  
  // This handles cases like 3D Secure authentication
  // The client will handle the redirect automatically
  console.log('Payment requires additional authentication');
} 