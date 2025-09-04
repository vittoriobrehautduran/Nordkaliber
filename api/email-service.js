const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Function to send order confirmation email to customer
const sendCustomerConfirmation = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: orderData.customer.email,
      subject: `Order Confirmation - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4D3E;">Tack för din beställning!</h2>
          <p>Hej ${orderData.customer.name},</p>
          <p>Vi har mottagit din beställning och kommer att bearbeta den så snart som möjligt.</p>
          
          <h3 style="color: #1B4D3E;">Beställningsdetaljer:</h3>
          <p><strong>Beställningsnummer:</strong> ${orderData.orderId}</p>
          <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
          
          <h3 style="color: #1B4D3E;">Produkter:</h3>
          <ul>
            ${orderData.items.map(item => `
              <li>
                <strong>${item.name}</strong><br>
                Kaliber: ${item.caliber}<br>
                Färg: ${item.color}<br>
                Motiv: ${item.motif}<br>
                Antal: ${item.quantity}<br>
                Pris: ${item.price} SEK
              </li>
            `).join('')}
          </ul>
          
          <p><strong>Totalt: ${orderData.total} SEK</strong></p>
          
          <h3 style="color: #1B4D3E;">Leveransinformation:</h3>
          <p><strong>Namn:</strong> ${orderData.customer.name}</p>
          <p><strong>E-post:</strong> ${orderData.customer.email}</p>
          <p><strong>Telefon:</strong> ${orderData.customer.phone}</p>
          <p><strong>Adress:</strong> ${orderData.customer.address}</p>
          <p><strong>Postnummer:</strong> ${orderData.customer.zipCode}</p>
          <p><strong>Ort:</strong> ${orderData.customer.city}</p>
          
          <p>Vi kommer att skicka dig en leveransbekräftelse när din beställning skickas.</p>
          
          <p>Med vänliga hälsningar,<br>Nordkaliber Team</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Customer confirmation email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending customer confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Function to send order notification email to manager
const sendManagerNotification = async (orderData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${process.env.PRODUCTION_MANAGER_EMAIL}, vittorio.brehaut.duran@gmail.com`,
      subject: `Ny beställning - ${orderData.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4D3E;">Ny beställning mottagen!</h2>
          
          <h3 style="color: #1B4D3E;">Beställningsdetaljer:</h3>
          <p><strong>Beställningsnummer:</strong> ${orderData.orderId}</p>
          <p><strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')}</p>
          
          <h3 style="color: #1B4D3E;">Produkter:</h3>
          <ul>
            ${orderData.items.map(item => `
              <li>
                <strong>${item.name}</strong><br>
                Kaliber: ${item.caliber}<br>
                Färg: ${item.color}<br>
                Motiv: ${item.motif}<br>
                Antal: ${item.quantity}<br>
                Pris: ${item.price} SEK
              </li>
            `).join('')}
          </ul>
          
          <p><strong>Totalt: ${orderData.total} SEK</strong></p>
          
          <h3 style="color: #1B4D3E;">Kundinformation:</h3>
          <p><strong>Namn:</strong> ${orderData.customer.name}</p>
          <p><strong>E-post:</strong> ${orderData.customer.email}</p>
          <p><strong>Telefon:</strong> ${orderData.customer.phone}</p>
          <p><strong>Adress:</strong> ${orderData.customer.address}</p>
          <p><strong>Postnummer:</strong> ${orderData.customer.zipCode}</p>
          <p><strong>Ort:</strong> ${orderData.customer.city}</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Manager notification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending manager notification email:', error);
    return { success: false, error: error.message };
  }
};

// Main function to send all order emails
const sendOrderEmails = async (orderData) => {
  try {
    console.log('📧 Starting email sending process for order:', orderData.orderId);
    
    // Send emails in parallel
    const [customerResult, managerResult] = await Promise.all([
      sendCustomerConfirmation(orderData),
      sendManagerNotification(orderData)
    ]);
    
    return {
      customer: customerResult,
      manager: managerResult,
      success: customerResult.success && managerResult.success
    };
  } catch (error) {
    console.error('❌ Error in sendOrderEmails:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendOrderEmails,
  sendCustomerConfirmation,
  sendManagerNotification
};
