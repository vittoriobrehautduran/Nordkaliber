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

// Function to send contact form email
const sendContactEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to the same email address
      subject: `Kontaktformulär - ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4D3E;">Nytt meddelande från kontaktformuläret</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1B4D3E; margin-top: 0;">Kontaktinformation:</h3>
            <p><strong>Namn:</strong> ${contactData.name}</p>
            <p><strong>E-post:</strong> ${contactData.email}</p>
            <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1B4D3E; margin-top: 0;">Meddelande:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            <p>Detta meddelande skickades från Nordkaliber kontaktformulär.</p>
            <p>Du kan svara direkt på detta e-postmeddelande för att kontakta ${contactData.name}.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact email:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  console.log('Contact form handler called:', {
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
    const contactData = JSON.parse(event.body);
    console.log('Parsed contact data:', contactData);

    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['name', 'email', 'message']
        })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Send the contact email
    console.log('Attempting to send contact email...');
    const result = await sendContactEmail(contactData);
    console.log('Email sent successfully:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Meddelandet har skickats! Vi återkommer så snart som möjligt.',
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('Contact form error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Ett fel uppstod när meddelandet skulle skickas. Försök igen senare.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};