// Create fake order and send confirmation email
// This endpoint is for testing purposes and creates a mock order

import nodemailer from 'nodemailer';

// Email configuration using environment variables
function createTransporter() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'nordkaliber@gmail.com',
        pass: process.env.EMAIL_PASSWORD // App password required for Gmail
      }
    });
    
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    throw error;
  }
}

// Generate a fake order ID
function generateOrderId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NK-${timestamp.slice(-6)}-${random}`;
}

// Create fake order data
function createFakeOrderData(customerEmail, customerName) {
  const orderId = generateOrderId();
  const currentDate = new Date();
  
  return {
    orderId: orderId,
    orderDate: currentDate.toLocaleDateString('sv-SE'),
    orderTime: currentDate.toLocaleTimeString('sv-SE'),
    customer: {
      email: customerEmail,
      name: customerName || 'Test Kunde',
      firstName: customerName ? customerName.split(' ')[0] : 'Test',
      lastName: customerName ? customerName.split(' ').slice(1).join(' ') : 'Kunde'
    },
    items: [
      {
        name: 'Ammunitionsetui - Motiv 8',
        caliber: '.308 Winchester',
        primaryColor: 'Svart',
        secondaryColor: 'Guld',
        initials: 'T.K.',
        price: 950,
        quantity: 1
      },
      {
        name: 'Ammunitionsetui - Black Blaze',
        caliber: '.223 Remington',
        primaryColor: 'Svart',
        secondaryColor: 'Orange',
        initials: '',
        price: 850,
        quantity: 1
      }
    ],
    total: 1800,
    shipping: 0,
    grandTotal: 1800,
    status: 'Bekräftad',
    estimatedDelivery: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')
  };
}

// Send confirmation email
async function sendConfirmationEmail(orderData) {
  try {
    const transporter = createTransporter();
    
    const itemsList = orderData.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.caliber}</td>
        <td>${item.primaryColor}/${item.secondaryColor}</td>
        <td>${item.initials || '-'}</td>
        <td>${item.price} kr</td>
        <td>${item.quantity}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orderbekräftelse - Nordkaliber</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #1B4D3E, #2E7D32); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 { 
            margin: 0; 
            font-size: 2.5em; 
            font-weight: 700; 
            letter-spacing: 2px;
          }
          .header h2 { 
            margin: 10px 0 0 0; 
            font-size: 1.3em; 
            font-weight: 300;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
            background: white; 
          }
          .order-details { 
            background: #f8f9fa; 
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 8px; 
            border-left: 4px solid #1B4D3E;
          }
          .order-details h3 { 
            margin: 0 0 20px 0; 
            color: #1B4D3E; 
            font-size: 1.4em;
          }
          .order-info { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 20px;
          }
          .order-info div { 
            padding: 10px; 
            background: white; 
            border-radius: 5px; 
            border: 1px solid #e0e0e0;
          }
          .order-info strong { 
            color: #1B4D3E; 
            display: block; 
            margin-bottom: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          th, td { 
            padding: 15px 12px; 
            text-align: left; 
            border-bottom: 1px solid #e0e0e0; 
          }
          th { 
            background: #1B4D3E; 
            color: white; 
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 0.5px;
          }
          tr:nth-child(even) { 
            background-color: #f8f9fa; 
          }
          .total-section { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            text-align: right;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 5px 0;
          }
          .grand-total { 
            font-size: 1.4em; 
            font-weight: 700; 
            color: #1B4D3E; 
            border-top: 2px solid #1B4D3E; 
            padding-top: 15px; 
            margin-top: 15px;
          }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            background: #f8f9fa; 
            color: #666; 
            border-top: 1px solid #e0e0e0;
          }
          .contact-info { 
            margin: 20px 0; 
            padding: 20px; 
            background: #e8f5e8; 
            border-radius: 8px; 
            border: 1px solid #c8e6c9;
          }
          .contact-info h4 { 
            margin: 0 0 15px 0; 
            color: #1B4D3E; 
          }
          .contact-info p { 
            margin: 5px 0; 
            color: #2E7D32;
          }
          .status-badge { 
            display: inline-block; 
            background: #4CAF50; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-size: 0.9em; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          @media (max-width: 600px) {
            .order-info { 
              grid-template-columns: 1fr; 
            }
            th, td { 
              padding: 10px 8px; 
              font-size: 0.9em; 
            }
            .header h1 { 
              font-size: 2em; 
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NORDKALIBER</h1>
            <h2>Tack för din beställning!</h2>
          </div>
          
          <div class="content">
            <p>Hej ${orderData.customer.firstName} ${orderData.customer.lastName},</p>
            
            <p>Tack för din beställning hos Nordkaliber! Vi har mottagit din order och kommer att börja tillverka dina ammunitionlådor så snart som möjligt.</p>
            
            <div class="order-details">
              <h3>📋 Orderdetaljer</h3>
              <div class="order-info">
                <div>
                  <strong>Ordernummer</strong>
                  <span>${orderData.orderId}</span>
                </div>
                <div>
                  <strong>Orderdatum</strong>
                  <span>${orderData.orderDate}</span>
                </div>
                <div>
                  <strong>Status</strong>
                  <span class="status-badge">${orderData.status}</span>
                </div>
                <div>
                  <strong>Beräknad leverans</strong>
                  <span>${orderData.estimatedDelivery}</span>
                </div>
              </div>
            </div>
            
            <h3>🛍️ Beställda produkter</h3>
            <table>
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Kaliber</th>
                  <th>Färger</th>
                  <th>Initialer</th>
                  <th>Pris</th>
                  <th>Antal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <span>Delsumma:</span>
                <span>${orderData.total} kr</span>
              </div>
              <div class="total-row">
                <span>Frakt:</span>
                <span>${orderData.shipping} kr</span>
              </div>
              <div class="total-row grand-total">
                <span>Totalt att betala:</span>
                <span>${orderData.grandTotal} kr</span>
              </div>
            </div>
            
            <div class="contact-info">
              <h4>📞 Kontaktinformation</h4>
              <p><strong>Email:</strong> nordkaliber@gmail.com</p>
              <p><strong>Telefon:</strong> +46 70 XXX XX XX</p>
              <p><strong>Adress:</strong> Sverige</p>
            </div>
            
            <p><strong>Viktig information:</strong></p>
            <ul>
              <li>Din order kommer att bearbetas inom 1-2 arbetsdagar</li>
              <li>Tillverkningstiden är cirka 2-3 veckor</li>
              <li>Du kommer att få ett mail när din order skickas</li>
              <li>Frakt sker med Postnord eller liknande leverantör</li>
            </ul>
            
            <p>Tack för att du valt Nordkaliber!</p>
            
            <p>Med vänliga hälsningar,<br>
            <strong>Nordkaliber Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2024 Nordkaliber. Alla rättigheter förbehållna.</p>
            <p>Detta är en automatisk bekräftelse. Svara inte på detta mail.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Nordkaliber" <${process.env.EMAIL_USER || 'nordkaliber@gmail.com'}>`,
      to: orderData.customer.email,
      subject: `Orderbekräftelse - ${orderData.orderId} - Nordkaliber`,
      html: htmlContent,
      text: `
        Tack för din beställning hos Nordkaliber!
        
        Ordernummer: ${orderData.orderId}
        Orderdatum: ${orderData.orderDate}
        Status: ${orderData.status}
        
        Beställda produkter:
        ${orderData.items.map(item => 
          `- ${item.name}: ${item.caliber}, ${item.primaryColor}/${item.secondaryColor}, ${item.initials || 'Inga initialer'}, ${item.price} kr`
        ).join('\n')}
        
        Totalt: ${orderData.grandTotal} kr
        
        Beräknad leverans: ${orderData.estimatedDelivery}
        
        Kontakt: nordkaliber@gmail.com
        
        Tack för att du valt Nordkaliber!
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent successfully:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
}

// Main handler function
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST to create a fake order.' 
    });
  }

  try {
    console.log('🎯 Creating fake order...');
    
    // Get customer email from request body
    const { customerEmail, customerName } = req.body;
    
    if (!customerEmail) {
      return res.status(400).json({ 
        error: 'Customer email is required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    // Create fake order data
    const orderData = createFakeOrderData(customerEmail, customerName);
    
    console.log('📦 Fake order created:', {
      orderId: orderData.orderId,
      customerEmail: orderData.customer.email,
      totalItems: orderData.items.length,
      totalAmount: orderData.grandTotal
    });
    
    // Send confirmation email
    const emailResult = await sendConfirmationEmail(orderData);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Fake order created and confirmation email sent successfully',
      order: {
        orderId: orderData.orderId,
        orderDate: orderData.orderDate,
        customerEmail: orderData.customer.email,
        customerName: orderData.customer.name,
        totalItems: orderData.items.length,
        totalAmount: orderData.grandTotal,
        status: orderData.status,
        estimatedDelivery: orderData.estimatedDelivery
      },
      email: {
        messageId: emailResult.messageId,
        sentTo: orderData.customer.email
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating fake order:', error);
    
    res.status(500).json({
      error: 'Failed to create fake order',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 