// Import nodemailer with better error handling
let nodemailer;
try {
  nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded successfully');
} catch (error) {
  console.error('❌ Failed to load nodemailer:', error);
  nodemailer = null;
}

// Email configuration - Create transporter inside functions to avoid initialization errors
function createTransporter() {
  try {
    if (!nodemailer) {
      throw new Error('Nodemailer is not available');
    }
    
    if (typeof nodemailer.createTransporter !== 'function') {
      console.error('❌ Nodemailer methods:', Object.keys(nodemailer));
      throw new Error('createTransporter is not a function. Available methods: ' + Object.keys(nodemailer).join(', '));
    }
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'nordkaliber@gmail.com',
        pass: process.env.EMAIL_PASSWORD // App password required for Gmail
      }
    });
    
    console.log('✅ Transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating transporter:', error);
    throw error;
  }
}

// Production manager email
const PRODUCTION_MANAGER_EMAIL = process.env.PRODUCTION_MANAGER_EMAIL || 'nordkaliber@gmail.com';

// Send customer confirmation email
async function sendCustomerConfirmationEmail(orderData) {
  try {
    console.log('📧 Attempting to send customer confirmation email...');
    console.log('📧 Email configuration:', {
      user: process.env.EMAIL_USER || 'nordkaliber@gmail.com',
      hasPassword: !!process.env.EMAIL_PASSWORD,
      to: orderData.customer.email
    });
    
    // Create transporter (this will handle nodemailer checks)
    const transporter = createTransporter();
    
    const { customer, items, total, orderId } = orderData;
    
    const itemsList = items.map(item => `
      <tr>
        <td>${item.caliber}</td>
        <td>${item.primaryColor}/${item.secondaryColor}</td>
        <td>${item.initials || '-'}</td>
        <td>${item.price} kr</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orderbekräftelse - Nordkaliber</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1B4D3E; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f2f2f2; }
          .total { font-weight: bold; font-size: 18px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NORDKALIBER</h1>
            <h2>Tack för din beställning!</h2>
          </div>
          
          <div class="content">
            <p>Hej ${customer.firstName} ${customer.lastName},</p>
            
            <p>Tack för din beställning hos Nordkaliber. Vi har mottagit din order och kommer att börja tillverka din ammunitionlåda så snart som möjligt.</p>
            
            <div class="order-details">
              <h3>Orderdetaljer</h3>
              <p><strong>Ordernummer:</strong> ${orderId}</p>
              <p><strong>Orderdatum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
              
              <h4>Produkter:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Kaliber</th>
                    <th>Färg</th>
                    <th>Initialer</th>
                    <th>Pris</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <p class="total">Totalt: ${total} kr</p>
            </div>
            
            <div class="order-details">
              <h3>Leveransadress</h3>
              <p>${customer.firstName} ${customer.lastName}</p>
              <p>${customer.address}</p>
              <p>${customer.postalCode} ${customer.city}</p>
              <p>${customer.country}</p>
            </div>
            
            <p>Vi kommer att meddela dig när din order är redo för leverans. Om du har några frågor, tveka inte att kontakta oss.</p>
            
            <p>Med vänliga hälsningar,<br>Nordkaliber Team</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Nordkaliber. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'nordkaliber@gmail.com',
      to: customer.email,
      subject: `Orderbekräftelse - ${orderId}`,
      html: htmlContent
    };

    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    await transporter.sendMail(mailOptions);
    console.log(`✅ Customer confirmation email sent to ${customer.email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending customer confirmation email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return false;
  }
}

// Send production manager notification
async function sendProductionManagerNotification(orderData) {
  try {
    // Create transporter (this will handle nodemailer checks)
    const transporter = createTransporter();
    
    const { customer, items, total, orderId } = orderData;
    
    // Check if there's a special request
    const hasSpecialRequest = items.some(item => 
      item.specialRequests && 
      Object.values(item.specialRequests).some(request => request && request.trim())
    );

    const itemsList = items.map(item => `
      <tr>
        <td>${item.caliber}</td>
        <td>${item.primaryColor}/${item.secondaryColor}</td>
        <td>${item.initials || '-'}</td>
        <td>${item.price} kr</td>
        <td>${item.specialRequests ? Object.entries(item.specialRequests).map(([key, value]) => value ? `${key}: ${value}` : '').filter(Boolean).join(', ') : '-'}</td>
      </tr>
    `).join('');

    const subject = hasSpecialRequest 
      ? `🚨 NY ORDER MED SPECIALFÖRFRÅGAN - ${orderId}`
      : `📦 NY ORDER - ${orderId}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ny Order - Nordkaliber</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: ${hasSpecialRequest ? '#ff4444' : '#1B4D3E'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .special-request { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f2f2f2; }
          .total { font-weight: bold; font-size: 18px; }
          .priority { color: #ff4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NORDKALIBER - PRODUKTION</h1>
            <h2>${hasSpecialRequest ? '🚨 NY ORDER MED SPECIALFÖRFRÅGAN' : '📦 NY ORDER'}</h2>
          </div>
          
          <div class="content">
            <p>Hej Produktionschef,</p>
            
            <p>En ny order har mottagits och väntar på tillverkning.</p>
            
            ${hasSpecialRequest ? '<p class="priority">⚠️ DENNA ORDER HAR SPECIALFÖRFRÅGOR SOM KRÄVER EXTRA UPMÄRKSAMHET!</p>' : ''}
            
            <div class="order-details">
              <h3>Orderdetaljer</h3>
              <p><strong>Ordernummer:</strong> ${orderId}</p>
              <p><strong>Orderdatum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
              <p><strong>Kund:</strong> ${customer.firstName} ${customer.lastName}</p>
              <p><strong>Email:</strong> ${customer.email}</p>
              <p><strong>Telefon:</strong> ${customer.phone || 'Ej angivet'}</p>
              
              <h4>Produkter:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Kaliber</th>
                    <th>Färg</th>
                    <th>Initialer</th>
                    <th>Pris</th>
                    <th>Specialförfrågor</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              
              <p class="total">Totalt: ${total} kr</p>
            </div>
            
            <div class="order-details">
              <h3>Leveransadress</h3>
              <p>${customer.firstName} ${customer.lastName}</p>
              <p>${customer.address}</p>
              <p>${customer.postalCode} ${customer.city}</p>
              <p>${customer.country}</p>
            </div>
            
            ${hasSpecialRequest ? `
            <div class="special-request">
              <h3>🚨 SPECIALFÖRFRÅGOR</h3>
              <p>Denna order innehåller specialförfrågor som kräver extra uppmärksamhet vid tillverkning.</p>
            </div>
            ` : ''}
            
            <p>Vänligen börja tillverkning så snart som möjligt.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'nordkaliber@gmail.com',
      to: PRODUCTION_MANAGER_EMAIL,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Production manager notification sent to ${PRODUCTION_MANAGER_EMAIL}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending production manager notification:', error);
    return false;
  }
}

// Main function to send all emails for an order
async function sendOrderEmails(orderData) {
  try {
    console.log('📧 Sending order emails...');
    
    // Send customer confirmation email
    const customerEmailSent = await sendCustomerConfirmationEmail(orderData);
    
    // Send production manager notification
    const productionEmailSent = await sendProductionManagerNotification(orderData);
    
    return {
      customerEmailSent,
      productionEmailSent
    };
  } catch (error) {
    console.error('❌ Error sending order emails:', error);
    return {
      customerEmailSent: false,
      productionEmailSent: false
    };
  }
}

module.exports = {
  sendCustomerConfirmationEmail,
  sendProductionManagerNotification,
  sendOrderEmails
}; 