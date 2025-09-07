# Google Analytics Setup Guide for Nordkaliber

## Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Create Account"
3. Enter your account name (e.g., "Nordkaliber")
4. Choose your data sharing settings
5. Click "Next"

## Step 2: Create a Property

1. Enter property name: "Nordkaliber Store"
2. Select your country: Sweden
3. Choose your currency: SEK
4. Select your industry: Sports & Recreation
5. Choose your business size
6. Click "Create"

## Step 3: Get Your Measurement ID

1. After creating the property, you'll see a "Data Streams" section
2. Click "Add stream" → "Web"
3. Enter your website URL: `https://nordkaliber.store`
4. Enter stream name: "Nordkaliber Website"
5. Click "Create stream"
6. Copy your **Measurement ID** (starts with "G-")

## Step 4: Update Your Website

### Option A: Direct Code Implementation (Recommended for Static Sites)

1. Open all HTML files: `index.html`, `designpage.html`, `checkout.html`, `success.html`
2. Find the Google Analytics section in each file
3. Replace `GA_MEASUREMENT_ID` with your actual Measurement ID

**Example:**
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX', {
        page_title: 'Nordkaliber - Premium Jaktutrustning',
        page_location: window.location.href
    });
</script>
```

### Option B: Environment Variable (For Dynamic Sites)

If you want to use environment variables (more secure but requires server-side processing):

1. **For Netlify**: Add environment variable in Netlify dashboard
   - Go to Site Settings → Environment Variables
   - Add `GA_MEASUREMENT_ID` with your Measurement ID

2. **Update the code** to use environment variable:
```html
<script>
    const GA_MEASUREMENT_ID = '{{GA_MEASUREMENT_ID}}' || 'G-XXXXXXXXXX';
    // ... rest of the code
</script>
```

**Recommendation**: For your static site setup with Netlify, **Option A (Direct Code)** is simpler and more reliable.

## Step 5: Deploy and Test

1. Deploy your updated website to Netlify
2. Visit your website
3. Check Google Analytics Real-time reports to see if data is coming in

## What's Being Tracked

The implementation includes comprehensive tracking across all pages:

### Homepage (index.html)
- **User Engagement**: Button clicks, form submissions, scroll depth
- **Video Interactions**: Play, pause, modal open/close
- **Navigation**: Section clicks, scroll to top
- **Scroll Depth**: 25%, 50%, 75%, 90%, 100% milestones

### Design Page (designpage.html)
- **Design Flow**: Each step in the design process
- **Product Configuration**: Caliber, colors, design selections
- **E-commerce**: Add to cart, checkout initiation
- **User Journey**: Step-by-step design process tracking

### Checkout Page (checkout.html)
- **Checkout Process**: Each step in the payment flow
- **Payment Events**: Payment attempts, successes, errors
- **E-commerce**: Purchase tracking with amounts and currency
- **Error Tracking**: Payment failures and error types

### Success Page (success.html)
- **Order Completion**: Successful purchase tracking
- **Conversion Tracking**: Order completion events
- **Revenue Tracking**: Total amounts and transaction IDs
- **Success Actions**: User actions on success page

### Events Structure
- **Category**: engagement, navigation, video, design_flow, ecommerce, conversion
- **Action**: click, scroll, video_interaction, form_submit, design_step, checkout_step, purchase
- **Label**: Specific element or action description
- **Value**: Numeric value (step numbers, amounts, counts)
- **Currency**: SEK for all monetary values

## Viewing Your Data

1. Go to Google Analytics
2. Select your property
3. Use these reports:

### **Demographics & Geography**
- **Reports → Demographics**: Age groups, interests (not gender)
- **Reports → Geo → Location**: Countries, cities, regions
- **Reports → Tech → Browser & OS**: Device and browser data
- **Reports → Tech → Mobile**: Mobile vs desktop usage

### **E-commerce & Conversions**
- **Reports → Monetization → E-commerce purchases**: Revenue, conversion rates
- **Reports → Engagement → Events**: All tracked interactions
- **Reports → Life cycle → Acquisition**: Traffic sources
- **Reports → Life cycle → Engagement**: User behavior patterns

### **Custom Reports You Can Create**
- **Checkout Funnel**: Homepage → Design → Checkout → Success
- **Geographic Performance**: Sales by country/region
- **Device Performance**: Mobile vs desktop conversions
- **Traffic Source Analysis**: Which sources convert best

## 📊 **What Data You'll Actually See**

### ✅ **Available Demographics**
- **Age Groups**: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
- **Interests**: Sports & Recreation, Outdoor Activities, etc.
- **Geography**: Country, region, city (with enough data)
- **Device Types**: Mobile, desktop, tablet
- **Browser & OS**: Chrome, Safari, Firefox, etc.

### ❌ **Not Available**
- **Gender**: Google Analytics 4 doesn't collect gender data
- **Personal Information**: Names, emails, phone numbers
- **Individual User Tracking**: All data is aggregated and anonymous

### ✅ **Checkout & Conversion Data**
- **Conversion Rates**: By page, by traffic source, by device
- **Revenue**: Total sales, average order value, by geography
- **Funnel Analysis**: Where users drop off in the process
- **Payment Methods**: Success/failure rates
- **Geographic Performance**: Which countries/regions convert best

## Privacy Considerations

- The implementation respects user privacy
- No personal data is collected beyond what's necessary
- All tracking is anonymous
- Consider adding a cookie consent banner if required by GDPR

## 👥 **Adding Multiple Users to Analytics**

### **Step 1: Add Users to Google Analytics**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Click **Admin** (gear icon) in the bottom left
4. Under **Property**, click **Property Access Management**
5. Click **+** (Add users)
6. Enter the email address of the person you want to add
7. Select their role:
   - **Viewer**: Can view reports only
   - **Analyst**: Can view reports and create custom reports
   - **Editor**: Can view, edit, and manage most settings
   - **Administrator**: Full access to everything

### **Step 2: User Roles Explained**

- **Viewer** (Recommended for most users):
  - View all reports and data
  - Cannot make changes
  - Perfect for business partners, team members

- **Analyst** (For data analysis):
  - Everything Viewer can do
  - Create custom reports and dashboards
  - Export data

- **Editor** (For marketing team):
  - Everything Analyst can do
  - Modify goals and conversions
  - Manage audiences

- **Administrator** (For you):
  - Full control over everything
  - Add/remove users
  - Change settings

### **Step 3: Account-Level Access (Optional)**

If you want users to see multiple properties:
1. Go to **Admin** → **Account Access Management**
2. Add users at the account level
3. They'll see all properties under your account

### **Step 4: Share Specific Reports**

You can also share specific reports without giving full access:
1. Open any report in Google Analytics
2. Click **Share** button
3. Choose **Share link** or **Export** options

## Troubleshooting

If data isn't appearing:
1. Check that your Measurement ID is correct
2. Wait 24-48 hours for data to appear in reports
3. Use Google Analytics DebugView for real-time testing
4. Check browser console for any JavaScript errors

### **User Access Issues**
- Users need to accept the invitation email
- Make sure they're using the correct Google account
- Check that their role has the permissions they need