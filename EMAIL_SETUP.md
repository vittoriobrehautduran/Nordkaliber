# Email Setup Guide for Nordkaliber

## Required Environment Variables

To enable email functionality, you need to add the following environment variables to your Vercel project:

### 1. Email Configuration
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 2. Production Manager Email
```
PRODUCTION_MANAGER_EMAIL=production@nordkaliber.store
```

## Setup Instructions

### Step 1: Gmail Setup (Recommended)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the generated password
4. Use your Gmail address and the app password in the environment variables

### Step 2: Vercel Environment Variables
1. Go to your Vercel dashboard
2. Select your Nordkaliber project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: Your Gmail app password
   - `PRODUCTION_MANAGER_EMAIL`: Email for production notifications

### Step 3: Deploy
After adding the environment variables, redeploy your project:
```bash
git add .
git commit -m "Add email functionality"
git push origin main
```

## Email Features

### Customer Confirmation Email
- ✅ Automatically sent when order is completed
- ✅ Contains order details, customer info, and delivery address
- ✅ Professional HTML template with Nordkaliber branding

### Production Manager Notification
- ✅ Sent for every order
- ✅ **Special highlighting** for orders with special requests
- ✅ Contains all order details and customer information
- ✅ Different subject lines for normal vs. special request orders

## Email Templates

### Customer Email Features:
- Order confirmation with order number
- Complete product details
- Delivery address
- Professional Nordkaliber branding
- Next steps information

### Production Manager Email Features:
- Order details with customer information
- Product specifications
- **Special request highlighting** (if applicable)
- Delivery address
- Priority indicators for special requests

## Testing

To test the email functionality:
1. Complete a test order through the website
2. Check that customer receives confirmation email
3. Check that production manager receives notification
4. Test with special requests to see priority highlighting

## Troubleshooting

### Common Issues:
1. **Emails not sending**: Check environment variables are set correctly
2. **Gmail blocking**: Make sure to use App Password, not regular password
3. **Production manager not receiving**: Verify email address is correct

### Logs:
Check Vercel function logs for email sending status and any errors. 