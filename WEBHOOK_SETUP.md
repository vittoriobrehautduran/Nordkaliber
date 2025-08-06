# Stripe Webhook Setup Guide

## 🔗 What is a Webhook?

A webhook is a way for Stripe to notify your backend when events happen (like successful payments, failed payments, etc.). It's like Stripe sending a message to your server saying "Hey, someone just paid!"

## 📋 Webhook Setup Steps

### 1. Go to Stripe Dashboard
- Log into your [Stripe Dashboard](https://dashboard.stripe.com)
- Navigate to **Developers** → **Webhooks**

### 2. Add Endpoint
- Click **"Add endpoint"**
- Enter your webhook URL:
  - **Development**: `http://localhost:3000/api/webhook`
  - **Production**: `https://yourdomain.com/api/webhook`
- Click **"Select events"**

### 3. Select Events
Choose these events for your e-commerce site:
- ✅ `checkout.session.completed` - When payment is successful
- ✅ `payment_intent.payment_failed` - When payment fails
- ✅ `customer.subscription.created` - If you add subscriptions later
- ✅ `customer.subscription.updated` - If you add subscriptions later
- ✅ `customer.subscription.deleted` - If you add subscriptions later

### 4. Get Webhook Secret
- After creating the webhook, click on it
- Find the **"Signing secret"** section
- Click **"Reveal"** to see your webhook secret
- Copy this secret to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## 🔧 Environment Variables

Your `.env` file should look like this:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://yourdomain.com
```

## 🆔 Do You Need Product IDs?

**Short answer: No, for your current setup.**

### Why No Product IDs?
Your current implementation uses **dynamic pricing** where:
- Base price: 650 SEK
- Special requests: +200 SEK each
- Initials: +100 SEK

Since prices vary based on user selections, we create products dynamically in the checkout session.

### When You WOULD Need Product IDs:
- If you had fixed products with set prices
- If you wanted to track inventory
- If you wanted to use Stripe's product catalog

### Current Implementation:
```javascript
// In backend.js - we create products dynamically
price_data: {
    currency: 'sek',
    product_data: {
        name: 'Nordkaliber Ammunitionlåda',
        description: description.join(', '),
        images: ['https://yourdomain.com/images/product-black-box.png'],
    },
    unit_amount: item.price * 100, // Dynamic price
},
```

## 🧪 Testing Webhooks

### 1. Local Testing with Stripe CLI
```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to localhost:3000/api/webhook
```

### 2. Test Events
In Stripe Dashboard → Webhooks → Your webhook → **"Send test webhook"**

### 3. Check Your Backend Logs
When a webhook is received, you should see:
```
Payment successful for session: cs_test_...
Processing successful payment for session: cs_test_...
```

## 🔍 Webhook Troubleshooting

### Common Issues:

1. **Webhook not receiving events**
   - Check your webhook URL is correct
   - Ensure your server is running
   - Verify webhook secret in `.env`

2. **"Invalid signature" errors**
   - Double-check your `STRIPE_WEBHOOK_SECRET`
   - Make sure you're using the correct secret for your environment

3. **Webhook timeout**
   - Your webhook handler should respond quickly
   - Move heavy processing to background jobs

### Testing Your Webhook:
```bash
# Start your server
npm run dev

# In another terminal, test the webhook endpoint
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 🚀 Production Deployment

### For Production:
1. **Update webhook URL** to your production domain
2. **Use live keys** instead of test keys
3. **Set up SSL** (HTTPS required for webhooks)
4. **Update CORS origins** in your `.env`

### Example Production `.env`:
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

## 📊 Webhook Events Explained

### `checkout.session.completed`
- **When**: Customer successfully completes payment
- **What to do**: 
  - Save order to database
  - Send confirmation email
  - Update inventory
  - Notify fulfillment team

### `payment_intent.payment_failed`
- **When**: Payment fails (insufficient funds, card declined, etc.)
- **What to do**:
  - Send failure notification to customer
  - Log the failure
  - Update order status

## 🔐 Security Best Practices

1. **Always verify webhook signatures**
2. **Use HTTPS in production**
3. **Keep webhook secrets secure**
4. **Implement idempotency** (handle duplicate events)
5. **Log all webhook events** for debugging

## 📞 Need Help?

If you're having issues with webhooks:
1. Check Stripe Dashboard → Webhooks → Event logs
2. Look at your server logs
3. Test with Stripe CLI
4. Verify your webhook secret

Your webhook setup is crucial for order processing, so make sure it's working correctly before going live! 