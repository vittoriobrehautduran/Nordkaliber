const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-07-30.basil',
    timeout: 30000, // 30 second timeout for Vercel
    maxNetworkRetries: 3
});

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/', limiter);

// CORS configuration - Allow all origins in development
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        platform: 'vercel'
    });
});

// Vercel-specific health check for keeping functions warm
app.get('/vercel-health', (req, res) => {
    res.json({ 
        status: 'WARM',
        timestamp: new Date().toISOString(),
        message: 'Function is warm and ready for Stripe payments'
    });
});

// Get Stripe publishable key
app.get('/config', (req, res) => {
    console.log('DEBUG: STRIPE_PUBLISHABLE_KEY =', process.env.STRIPE_PUBLISHABLE_KEY);
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// Stripe configuration endpoint for checkout page
app.get('/stripe-config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// Create Payment Intent for Payment Element
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, customerEmail } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items data' });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount, // Amount in cents
            currency: 'sek',
            metadata: {
                order_type: 'custom_ammunition_box',
                items_count: items.length.toString(),
                customer_email: customerEmail
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent',
            details: error.message
        });
    }
});

// Create Stripe checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, customerEmail } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items data' });
        }

        // Transform cart items to Stripe line items
        const lineItems = items.map(item => {
            const description = [
                `Kaliber: ${item.caliber || 'Standard'}`,
                `Primär färg: ${item.primaryColor || 'Standard'}`,
                `Sekundär färg: ${item.secondaryColor || 'Standard'}`
            ];

            if (item.initials) {
                description.push(`Initialer: ${item.initials}`);
            }

            // Add special requests to description
            if (item.specialRequests) {
                Object.entries(item.specialRequests).forEach(([key, value]) => {
                    if (value && value.trim()) {
                        description.push(`${key.charAt(0).toUpperCase() + key.slice(1)} specialförfrågan: ${value}`);
                    }
                });
            }

            return {
                price_data: {
                    currency: 'sek',
                    product_data: {
                        name: 'Nordkaliber Ammunition Box',
                        description: description.join(', '),
                        images: ['https://nordkaliber.vercel.app/images/product-black-box.png']
                    },
                    unit_amount: item.price * 100, // Convert to cents
                },
                quantity: 1,
            };
        });

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'paypal', 'klarna', 'swish'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/design/design.html`,
            customer_email: customerEmail,
            metadata: {
                order_type: 'custom_ammunition_box',
                items_count: items.length.toString()
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message
        });
    }
});

// Stripe webhook endpoint
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful for session:', session.id);
            await handleSuccessfulPayment(session);
            break;
            
        case 'payment_intent.payment_failed':
            const paymentIntent = event.data.object;
            console.log('Payment failed for payment intent:', paymentIntent.id);
            await handleFailedPayment(paymentIntent);
            break;
            
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
    try {
        console.log('Processing successful payment for session:', session.id);
        
        // Log order details
        console.log('Customer email:', session.customer_email);
        console.log('Amount total:', session.amount_total);
        console.log('Currency:', session.currency);
        console.log('Metadata:', session.metadata);
        
        // TODO: Add your order processing logic here
        // - Save order to database
        // - Send confirmation email
        // - Update inventory
        // - Notify fulfillment team
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
    try {
        console.log('Processing failed payment for payment intent:', paymentIntent.id);
        
        // TODO: Add your failed payment handling logic here
        // - Send failure notification to customer
        // - Log the failure
        // - Update order status
        
    } catch (error) {
        console.error('Error handling failed payment:', error);
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app; 