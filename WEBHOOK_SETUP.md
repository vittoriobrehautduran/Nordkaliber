# Webhook Setup Guide - Fix Payment Processing Issues

## Current Problem
The client authenticated with BankID but the money didn't transfer because webhooks are failing. From Stripe Workbench, we can see:
- **"Event delivery: payment_intent.requires_action"** - 1 failed event
- **"Event delivery: payment_intent.created"** - 2 failed events  
- **"invalid_request_error"** - 6 errors on POST /v1/payment_intents

## Step-by-Step Webhook Setup

### 1. Configure Webhook Endpoint in Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Navigate to `https://dashboard.stripe.com/webhooks`
   - Or go to **Developers > Webhooks**

2. **Add Endpoint**
   - Click **"Add endpoint"**
   - Set endpoint URL: `https://nordkaliber.store/api/webhook`
   - **Important:** Make sure this URL is accessible and returns a 200 response

3. **Select Events**
   Select these specific events:
   ```
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ✅ payment_intent.requires_action
   ✅ payment_intent.created
   ✅ payment_method.attached
   ✅ checkout.session.completed
   ```

4. **Copy Webhook Secret**
   - After creating the endpoint, click on it
   - Click **"Reveal"** next to "Signing secret"
   - Copy the `whsec_...` secret

### 2. Set Environment Variables

Add this to your Vercel environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**How to add in Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add `STRIPE_WEBHOOK_SECRET` with the value from step 1
4. Redeploy your application

### 3. Test Webhook Endpoint

Test if your webhook endpoint is accessible:

```bash
curl -X POST https://nordkaliber.store/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

You should get a response (even if it's an error, it means the endpoint is reachable).

### 4. Verify Webhook Configuration

1. **Check Stripe Dashboard**
   - Go to **Developers > Webhooks**
   - Your endpoint should show as "Active"
   - Click on it to see delivery status

2. **Check Recent Deliveries**
   - Look for recent webhook attempts
   - Check if they're succeeding or failing
   - Look at the response codes (should be 200)

### 5. Monitor Webhook Logs

After setup, monitor these logs:

1. **Stripe Dashboard Logs**
   - Go to **Developers > Webhooks**
   - Click on your endpoint
   - Check "Recent deliveries" tab

2. **Vercel Function Logs**
   - Go to your Vercel dashboard
   - Navigate to **Functions > api/webhook**
   - Check the logs for any errors

## Common Issues and Solutions

### Issue 1: "Webhook signature verification failed"
**Solution:**
- Make sure `STRIPE_WEBHOOK_SECRET` is set correctly
- The secret should start with `whsec_`
- Redeploy your application after setting the environment variable

### Issue 2: "Endpoint not reachable"
**Solution:**
- Verify the URL `https://nordkaliber.store/api/webhook` is correct
- Make sure your Vercel deployment is live
- Check if there are any CORS issues

### Issue 3: "Event delivery failed"
**Solution:**
- Check Vercel function logs for errors
- Make sure the webhook function returns a 200 status
- Verify all required environment variables are set

### Issue 4: "Payment intent errors"
**Solution:**
- The webhook is now properly configured to handle all payment events
- Check the enhanced logging in the webhook function
- Monitor both Stripe dashboard and Vercel logs

## Testing the Fix

1. **Make a Test Payment**
   - Go to your checkout page
   - Complete a test payment with BankID
   - Monitor the webhook logs

2. **Check Payment Status**
   - The payment should now properly transfer money
   - Confirmation emails should be sent
   - Order should be marked as paid

3. **Verify in Stripe Dashboard**
   - Check **Payments** section
   - Payment should show as "Succeeded"
   - Webhook deliveries should show as successful

## Enhanced Logging

The updated webhook now includes:
- ✅ Detailed logging for all payment events
- ✅ Better error handling and debugging
- ✅ Proper amount conversion (cents to SEK)
- ✅ Comprehensive payment success processing
- ✅ Support for both payment intents and checkout sessions

## Next Steps

1. **Set up the webhook endpoint** in Stripe Dashboard
2. **Add the webhook secret** to Vercel environment variables
3. **Redeploy your application**
4. **Test with a real payment**
5. **Monitor the logs** to ensure everything works

Once this is set up, BankID payments should properly transfer money and send confirmation emails! 🎉 