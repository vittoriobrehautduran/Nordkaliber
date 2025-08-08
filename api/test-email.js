// Import nodemailer with better error handling
let nodemailer;
try {
  nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded successfully in test-email');
} catch (error) {
  console.error('❌ Failed to load nodemailer in test-email:', error);
  nodemailer = null;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing email configuration...');
    
    // Check environment variables
    const emailUser = process.env.EMAIL_USER || 'nordkaliber@gmail.com';
    const emailPassword = process.env.EMAIL_PASSWORD;
    const productionEmail = process.env.PRODUCTION_MANAGER_EMAIL || 'nordkaliber@gmail.com';
    
    console.log('📧 Environment check:', {
      emailUser,
      hasPassword: !!emailPassword,
      productionEmail
    });

    if (!emailPassword) {
      return res.status(400).json({
        error: 'Email password not configured',
        message: 'EMAIL_PASSWORD environment variable is required',
        config: {
          emailUser,
          productionEmail
        }
      });
    }

    // Create transporter with error handling
    if (!nodemailer) {
      return res.status(500).json({
        error: 'Nodemailer not available',
        message: 'Failed to load nodemailer module',
        config: {
          emailUser,
          hasPassword: !!emailPassword,
          productionEmail
        }
      });
    }

    if (typeof nodemailer.createTransport !== 'function') {
      return res.status(500).json({
        error: 'Invalid nodemailer',
        message: 'createTransport is not a function. Available methods: ' + Object.keys(nodemailer).join(', '),
        config: {
          emailUser,
          hasPassword: !!emailPassword,
          productionEmail
        }
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword
      }
    });

    // Test email content
    const testMailOptions = {
      from: emailUser,
      to: productionEmail,
      subject: '🧪 Email Test - Nordkaliber',
      html: `
        <h2>Email Test Successful!</h2>
        <p>This is a test email to verify that the email configuration is working correctly.</p>
        <p><strong>From:</strong> ${emailUser}</p>
        <p><strong>To:</strong> ${productionEmail}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('sv-SE')}</p>
        <hr>
        <p><em>If you receive this email, the email service is properly configured!</em></p>
      `
    };

    // Send test email
    await transporter.sendMail(testMailOptions);
    
    console.log('✅ Test email sent successfully');
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      config: {
        emailUser,
        productionEmail,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Email test failed:', error);
    
    res.status(500).json({
      error: 'Email test failed',
      message: error.message,
      code: error.code,
      command: error.command,
      config: {
        emailUser: process.env.EMAIL_USER || 'nordkaliber@gmail.com',
        hasPassword: !!process.env.EMAIL_PASSWORD,
        productionEmail: process.env.PRODUCTION_MANAGER_EMAIL || 'nordkaliber@gmail.com'
      }
    });
  }
}; 