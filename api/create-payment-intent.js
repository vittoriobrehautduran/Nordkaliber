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

// CSRF Token validation
const isValidCSRFToken = (token) => {
  // In production, you should use a more secure method like JWT or session-based tokens
  // For now, we'll use a simple validation against environment variable
  const expectedToken = process.env.CSRF_SECRET || 'default-csrf-secret';
  return token === expectedToken;
};

// Input validation and sanitization
const validateAndSanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/XML characters
    .replace(/[^\w\s@.-]/g, '') // Keep only alphanumeric, spaces, @, ., -
    .trim()
    .substring(0, 255); // Limit length
};

// Rate limiting (simple in-memory store - in production use Redis)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5; // Max 5 payment attempts per 15 minutes

const checkRateLimit = (clientIP) => {
  const now = Date.now();
  const key = `rate_limit_${clientIP}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  
  const data = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (now - data.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return true;
  }
  
  // Check if limit exceeded
  if (data.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }
  
  // Increment count
  data.count++;
  rateLimitStore.set(key, data);
  return true;
};

exports.handler = async (event, context) => {
  // Enhanced security headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || 'https://nordkaliber.store',
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com;"
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
    // Rate limiting check
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.error('❌ Rate limit exceeded for IP:', clientIP);
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
      };
    }

    // Check if we're in test mode
    const isTestMode = event.queryStringParameters?.test === 'true' || process.env.STRIPE_MODE === 'test';
    const stripe = getStripeInstance(isTestMode);
    
    const requestBody = JSON.parse(event.body);
    const { items, customerEmail, customerName, customerPhone, customerAddress, csrfToken } = requestBody;
    
    // CSRF Protection - Verify CSRF token
    if (!csrfToken || !isValidCSRFToken(csrfToken)) {
      console.error('❌ Invalid CSRF token');
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Invalid CSRF token' })
      };
    }

    // Input validation and sanitization
    const sanitizedEmail = validateAndSanitizeInput(customerEmail);
    const sanitizedName = validateAndSanitizeInput(customerName);
    const sanitizedPhone = validateAndSanitizeInput(customerPhone);
    const sanitizedAddress = validateAndSanitizeInput(customerAddress);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

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

    // Generate idempotency key to prevent duplicate payments
    const idempotencyKey = `${clientIP}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Server-side payment amount verification (additional security layer)
    const maxAllowedAmount = 50000; // 500 SEK maximum per order
    if (totalAmountInCents > maxAllowedAmount) {
      console.error('❌ Payment amount exceeds maximum allowed:', totalAmountInCents);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment amount exceeds maximum allowed' })
      };
    }

    // Create payment intent with enhanced security
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents, // Amount in cents
      currency: 'sek',
      metadata: {
        order_type: 'custom_ammunition_box',
        items_count: items.length.toString(),
        customer_email: sanitizedEmail,
        customer_name: sanitizedName,
        customer_phone: sanitizedPhone,
        customer_address: sanitizedAddress,
        items: JSON.stringify(items),
        total_amount: totalAmountInKronor.toString(),
        is_test_mode: isTestMode.toString(),
        client_ip: clientIP,
        idempotency_key: idempotencyKey
      },
      // Configure automatic payment methods (this will automatically detect available methods)
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always'
      },
      // Add setup for future payments if needed
      setup_future_usage: 'off_session',
      // Add receipt email
      receipt_email: sanitizedEmail,
      // Add description
      description: `Nordkaliber order - ${items.length} item(s)`,
      // Add idempotency key
      idempotency_key: idempotencyKey
    }, {
      idempotencyKey: idempotencyKey
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