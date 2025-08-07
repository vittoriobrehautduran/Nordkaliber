# Stripe Payment Setup Guide for Nordkaliber

## Issues Fixed

1. **Missing BankID Integration** - Added proper Swedish payment methods
2. **Incomplete Payment Processing** - Added webhook handling for successful payments
3. **No Payment Status Tracking** - Added proper payment verification
4. **Missing Customer Data** - Enhanced payment intent with customer information

## Environment Variables Required

Add these to your `.env` file or Vercel environment variables:

```bash
# Stripe Keys
STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook endpoint secret

# Email Configuration (if using email service)
EMAIL_SERVICE_KEY=your_email_service_key
```

## Stripe Dashboard Configuration

### 1. Enable Swedish Payment Methods

1. Go to your Stripe Dashboard
2. Navigate to **Settings > Payment methods**
3. Enable these payment methods for Sweden:
   - **Cards** (Visa, Mastercard, etc.)
   - **Klarna** (Pay later, Pay now, Slice it)
   - **Sofort** (German bank transfers)
   - **iDEAL** (Dutch bank transfers)
   - **Bancontact** (Belgian bank transfers)
   - **EPS** (Austrian bank transfers)
   - **Giropay** (German bank transfers)
   - **P24** (Polish bank transfers)

### 2. Configure Webhooks

1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.vercel.app/api/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
   - `payment_method.attached`
5. Copy the webhook signing secret to your environment variables

### 3. Set Up BankID (Optional but Recommended)

For proper Swedish BankID integration:

1. Contact Stripe support to enable BankID for your account
2. BankID will appear as a payment method option
3. Customers can authenticate with their BankID

## Testing the Integration

### 1. Test Card Numbers

Use these test cards for testing:

```bash
# Successful payment
4242 4242 4242 4242

# Requires authentication
4000 0025 0000 3155

# Declined payment
4000 0000 0000 0002
```

### 2. Test Klarna

1. Use test email: `test@example.com`
2. Use Swedish postal code: `12345`
3. Klarna will redirect to their test environment

## Payment Flow

### Before (Broken):
1. Customer fills form
2. Shows "order verification"
3. No actual payment processing
4. No BankID redirect
5. Money doesn't leave account

### After (Fixed):
1. Customer fills form
2. Stripe creates payment intent
3. Customer selects payment method (Card/Klarna/BankID)
4. If BankID: Redirects to BankID authentication
5. If Klarna: Redirects to Klarna
6. Payment processed through Stripe
7. Webhook confirms successful payment
8. Order confirmation emails sent
9. Money actually charged

## Troubleshooting

### Payment Not Processing

1. **Check Stripe Dashboard**: Look for failed payment intents
2. **Check Webhooks**: Ensure webhook endpoint is working
3. **Check Environment Variables**: Verify all keys are set correctly
4. **Check Console Logs**: Look for error messages in browser console

### BankID Not Appearing

1. **Contact Stripe Support**: Request BankID activation
2. **Check Account Settings**: Ensure Swedish payment methods are enabled
3. **Test with Different Browser**: Some payment methods are browser-specific

### Webhook Not Working

1. **Check Endpoint URL**: Ensure it's accessible
2. **Check Webhook Secret**: Verify it matches your environment variable
3. **Check Vercel Logs**: Look for webhook processing errors

## Monitoring

### Stripe Dashboard
- Monitor payments in **Payments** section
- Check webhook delivery in **Developers > Webhooks**
- Review failed payments and their reasons

### Vercel Logs
- Check function logs for payment processing
- Monitor webhook endpoint performance
- Look for any error messages

## Security Notes

1. **Never expose secret keys** in client-side code
2. **Always verify webhook signatures** (already implemented)
3. **Use HTTPS** for all payment endpoints
4. **Validate all input data** before processing payments

## Next Steps

1. **Set up environment variables** in Vercel
2. **Configure webhook endpoint** in Stripe Dashboard
3. **Test with test cards** first
4. **Enable live mode** when ready for production
5. **Monitor payments** and webhook delivery

## Support

If you continue to have issues:

1. Check Stripe Dashboard for detailed error messages
2. Review Vercel function logs
3. Test with Stripe's test mode first
4. Contact Stripe support for BankID activation 