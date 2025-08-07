# Nordkaliber - E-commerce Backend with Stripe Integration

A complete e-commerce solution for Nordkaliber ammunition boxes with Stripe payment processing.

## Features

- 🛒 **Shopping Cart System** - Multi-step product customization
- 💳 **Stripe Payment Integration** - Secure payment processing
- 🚚 **Shipping Options** - Free shipping for Nordic countries
- 📧 **Order Management** - Webhook handling for order processing
- 🔒 **Security** - Rate limiting, CORS, and input validation
- 📱 **Responsive Design** - Mobile-friendly interface

## Tech Stack

- **Backend**: Node.js, Express.js
- **Payment**: Stripe
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vittoriobre/Nordkaliber.git
   cd Nordkaliber
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your Stripe keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api
   - Health check: http://localhost:3000/api/health

## Stripe Setup

### 1. Create a Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the Dashboard

### 2. Configure Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret to your `.env` file

### 3. Test Mode vs Live Mode
- Use test keys for development
- Switch to live keys for production
- Test with Stripe's test card numbers

## API Endpoints

### Health Check
```
GET /api/health
```

### Get Stripe Configuration
```
GET /api/config
```

### Create Checkout Session
```
POST /api/create-checkout-session
Content-Type: application/json

{
  "items": [
    {
      "caliber": "6.5x55",
      "primary": "black",
      "secondary": "gold",
      "initials": "JS",
      "price": 850,
      "specialRequests": {
        "caliber": "Custom caliber request",
        "primary": "Custom color request"
      }
    }
  ],
  "customerEmail": "customer@example.com"
}
```

### Webhook Handler
```
POST /api/webhook
```

## Product Configuration

### Available Options

**Calibers:**
- 6.5x55 Swedish Mauser
- .308 Winchester
- .30-06 Springfield
- .270 Winchester
- .243 Winchester
- 7mm Remington Magnum
- .300 Winchester Magnum
- .220 Swift

**Primary Colors:**
- Black
- White
- Gray
- Green

**Secondary Colors:**
- Gold
- Red
- Orange
- Black

**Pricing:**
- Base price: 650 SEK
- Special requests: +200 SEK each
- Initials: +100 SEK

## File Structure

```
nordkaliber/
├── backend.js            # Main Express server
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (create from env.example)
├── index.html            # Main landing page
├── design/design.html    # Product customization page
├── success.html          # Payment success page
├── images/               # Product images and videos
├── WEBHOOK_SETUP.md      # Webhook configuration guide
└── README.md            # This file
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running in Production Mode
```bash
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | Required |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Required |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost |

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Request body validation
- **Helmet**: Security headers
- **Webhook Verification**: Stripe signature verification

## Deployment

### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

### Vercel
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### DigitalOcean
1. Create droplet
2. Install Node.js
3. Set up PM2 for process management
4. Configure nginx reverse proxy

## Testing

### Test Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### Manual Testing
1. Add items to cart
2. Complete checkout flow
3. Verify webhook events
4. Check order processing

## Troubleshooting

### Common Issues

**Stripe not initialized**
- Check if publishable key is set
- Verify network connectivity
- Check browser console for errors

**Webhook not working**
- Verify webhook endpoint URL
- Check webhook secret in environment
- Ensure HTTPS in production

**CORS errors**
- Update `ALLOWED_ORIGINS` in environment
- Check frontend domain matches

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email: info@nordkaliber.se

---

**Note**: This is a development setup. For production, ensure proper security measures, SSL certificates, and database integration for order management.
