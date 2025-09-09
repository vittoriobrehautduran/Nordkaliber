const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Function to send newsletter subscription email
const sendNewsletterSubscription = async (subscriptionData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${process.env.EMAIL_USER}, vittorio.brehaut.duran@gmail.com`, // Send to both email addresses
      subject: `Ny nyhetsbrevsprenumeration - ${subscriptionData.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4D3E;">Ny nyhetsbrevsprenumeration</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1B4D3E; margin-top: 0;">Prenumerationsinformation:</h3>
            <p><strong>E-post:</strong> ${subscriptionData.email}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}</p>
            <p><strong>IP-adress:</strong> ${subscriptionData.ip || 'Okänd'}</p>
            <p><strong>User Agent:</strong> ${subscriptionData.userAgent || 'Okänd'}</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1B4D3E;"><strong>✅ Ny prenumeration mottagen!</strong></p>
            <p style="margin: 5px 0 0 0; color: #666;">Denna person vill få nyhetsbrev från Nordkaliber.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            <p>Detta meddelande skickades från Nordkaliber nyhetsbrevsprenumeration.</p>
            <p>Du kan lägga till ${subscriptionData.email} i din e-postmarknadsföringslista.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Newsletter subscription email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending newsletter subscription email:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  console.log('Newsletter handler called:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // Parse the request body
    const subscriptionData = JSON.parse(event.body);
    console.log('Parsed newsletter subscription data:', subscriptionData);

    // Validate required fields
    if (!subscriptionData.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'E-postadress krävs',
          required: ['email']
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscriptionData.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Ogiltig e-postformat' })
      };
    }

    // Add additional data from request
    subscriptionData.ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'Okänd';
    subscriptionData.userAgent = event.headers['user-agent'] || 'Okänd';

    // Send the newsletter subscription email
    console.log('Attempting to send newsletter subscription email...');
    const result = await sendNewsletterSubscription(subscriptionData);
    console.log('Newsletter subscription email sent successfully:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Tack för din prenumeration! Du kommer nu att få våra nyhetsbrev.',
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Ett fel uppstod när prenumerationen skulle registreras. Försök igen senare.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};