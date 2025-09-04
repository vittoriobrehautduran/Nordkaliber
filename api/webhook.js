const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
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

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Check if webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Webhook secret not configured' })
      };
    }

    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('❌ Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);
    console.error('❌ Request signature:', sig ? 'Present' : 'Missing');
    return {
      statusCode: 400,
      headers,
      body: `Webhook Error: ${err.message}`
    };
  }

  console.log('📦 Webhook event received:', stripeEvent.type);

  // Handle the event
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded':
      console.log('💰 Processing payment success for:', stripeEvent.data.object.id);
      await handlePaymentSucceeded(stripeEvent.data.object);
      break;
    
    case 'payment_intent.payment_failed':
      console.log('❌ Processing payment failure for:', stripeEvent.data.object.id);
      await handlePaymentRequiresAction(stripeEvent.data.object);
      break;
    
    case 'payment_intent.requires_action':
      console.log('⏳ Payment requires action for:', stripeEvent.data.object.id);
      await handlePaymentRequiresAction(stripeEvent.data.object);
      break;
    
    case 'payment_intent.created':
      console.log('📝 Payment intent created:', stripeEvent.data.object.id);
      // Log the payment intent details for debugging
      console.log('📊 Payment intent details:', {
        id: stripeEvent.data.object.id,
        amount: stripeEvent.data.object.amount,
        currency: stripeEvent.data.object.currency,
        status: stripeEvent.data.object.status,
        payment_method_types: stripeEvent.data.object.payment_method_types
      });
      break;
    
    case 'payment_method.attached':
      console.log('✅ Payment method attached:', stripeEvent.data.object.id);
      break;
    
    case 'checkout.session.completed':
      console.log('🛒 Checkout session completed:', stripeEvent.data.object.id);
      await handleCheckoutSessionCompleted(stripeEvent.data.object);
      break;
    
    default:
      console.log(`📋 Unhandled event type: ${stripeEvent.type} for object:`, stripeEvent.data.object.id);
  }

  // Return a 200 response to acknowledge receipt of the event
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ received: true })
  };
};

async function handlePaymentSucceeded(paymentIntent) {
  console.log('✅ Payment succeeded:', paymentIntent.id);
  console.log('💰 Payment amount:', paymentIntent.amount, paymentIntent.currency);
  console.log('🏦 Payment method:', paymentIntent.payment_method_types);
  
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
      total: paymentIntent.amount / 100, // Convert back to SEK from cents
      currency: paymentIntent.currency,
      paymentMethod: paymentIntent.payment_method_types[0],
      status: 'paid'
    };

    console.log('📦 Order data prepared:', {
      orderId: orderData.orderId,
      customerEmail: orderData.customer.email,
      total: orderData.total,
      itemsCount: orderData.items.length
    });

    // Log order data for manual email processing
    console.log('📧 Order data for manual email processing:', orderData);

    // Log successful payment processing
    console.log('🎉 Payment processing completed successfully for order:', paymentIntent.id);

    // Here you could also:
    // - Save order to database
    // - Update inventory
    // - Send notifications to admin
    // - Create shipping labels

  } catch (error) {
    console.error('❌ Error processing successful payment:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
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
  console.log('🔐 Next action:', paymentIntent.next_action);
  
  // This handles cases like 3D Secure authentication or BankID redirects
  // The client will handle the redirect automatically
  if (paymentIntent.next_action && paymentIntent.next_action.type === 'redirect_to_url') {
    console.log('🔄 Redirect URL:', paymentIntent.next_action.redirect_to_url.url);
  }
  
  console.log('✅ Payment requires action handled - client will process redirect');
}

async function handleCheckoutSessionCompleted(session) {
  console.log('🛒 Checkout session completed:', session.id);
  console.log('💰 Session amount:', session.amount_total, session.currency);
  
  try {
    // Extract order data from session
    const orderData = {
      orderId: session.id,
      customer: {
        email: session.customer_details?.email || session.customer_email,
        name: session.customer_details?.name || 'Unknown',
        phone: session.customer_details?.phone || ''
      },
      items: session.line_items?.data || [],
      total: session.amount_total / 100, // Convert back to SEK from cents
      currency: session.currency,
      paymentMethod: session.payment_method_types[0],
      status: 'paid'
    };

    console.log('📦 Checkout session order data:', {
      orderId: orderData.orderId,
      customerEmail: orderData.customer.email,
      total: orderData.total
    });

    // Log order data for manual email processing
    console.log('📧 Checkout session order data for manual email processing:', orderData);

  } catch (error) {
    console.error('❌ Error processing checkout session:', error);
  }
} 