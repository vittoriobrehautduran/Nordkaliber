# Fake Order API Setup Guide

## Overview
This API endpoint creates a fake order and sends a confirmation email to the user. It's designed for testing email functionality without creating real orders in the system.

## Files Created
- `api/create-fake-order.js` - The main API endpoint
- `test-fake-order.html` - Test page to test the API
- `FAKE_ORDER_SETUP.md` - This setup guide

## Environment Variables Required

### For Vercel Deployment
You need to set these environment variables in your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:

```
EMAIL_USER=nordkaliber@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### For Local Development
Create a `.env` file in your project root:

```env
EMAIL_USER=nordkaliber@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

## Gmail App Password Setup

Since Gmail requires 2FA for app passwords, you need to:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in the `EMAIL_PASSWORD` environment variable

## API Usage

### Endpoint
```
POST /api/create-fake-order
```

### Request Body
```json
{
  "customerEmail": "customer@example.com",
  "customerName": "Förnamn Efternamn"  // Optional
}
```

### Response
```json
{
  "success": true,
  "message": "Fake order created and confirmation email sent successfully",
  "order": {
    "orderId": "NK-123456-ABC123",
    "orderDate": "2024-01-15",
    "customerEmail": "customer@example.com",
    "customerName": "Förnamn Efternamn",
    "totalItems": 2,
    "totalAmount": 1800,
    "status": "Bekräftad",
    "estimatedDelivery": "2024-01-29"
  },
  "email": {
    "messageId": "message_id_from_gmail",
    "sentTo": "customer@example.com"
  }
}
```

## Testing

1. Deploy your API to Vercel
2. Open `test-fake-order.html` in your browser
3. Enter a test email address
4. Click "Skapa Fake Order & Skicka Mejl"
5. Check the email for the confirmation

## Fake Order Details

The API creates a fake order with:
- 2 ammunition cases (ammunitionsetui)
- Total value: 1800 kr
- Estimated delivery: 14 days from order date
- Professional Swedish email template

## Security Notes

- The API only accepts POST requests
- Email credentials are stored in environment variables
- No real orders are created in the system
- Input validation for email format
- Rate limiting should be implemented for production use

## Troubleshooting

### Common Issues

1. **Email not sending**: Check Gmail app password and 2FA settings
2. **Environment variables not loading**: Restart Vercel deployment after adding variables
3. **CORS issues**: Ensure proper CORS configuration in your API
4. **Nodemailer errors**: Check that nodemailer is properly installed

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages in the API response.

## Production Considerations

- Implement rate limiting
- Add authentication/authorization
- Log all fake order attempts
- Monitor email sending success rates
- Consider using a transactional email service (SendGrid, Mailgun, etc.)

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Verify environment variables are set correctly
3. Test with a simple email first
4. Ensure Gmail app password is current 