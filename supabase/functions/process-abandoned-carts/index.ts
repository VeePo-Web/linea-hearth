import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email timing configuration
const EMAIL_1_DELAY_HOURS = 1; // 1 hour after abandonment
const EMAIL_2_DELAY_HOURS = 24; // 24 hours after abandonment
const EMAIL_3_DELAY_HOURS = 72; // 72 hours after abandonment (with discount)

interface CartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

interface AbandonedCart {
  id: string;
  email: string;
  cart_items: CartItem[];
  cart_total: number;
  recovery_token: string;
  status: string;
  discount_code: string | null;
  created_at: string;
  email_1_sent_at: string | null;
  email_2_sent_at: string | null;
  email_3_sent_at: string | null;
}

// Generate a unique discount code
function generateDiscountCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LINEA15-';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Email sending function (stubbed - requires RESEND_API_KEY)
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  resendApiKey?: string
): Promise<boolean> {
  if (!resendApiKey) {
    console.log(`[STUB] Would send email to ${to}: ${subject}`);
    console.log(`[STUB] Email content preview: ${html.substring(0, 200)}...`);
    return true; // Pretend success for testing
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LINEA <noreply@linea.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Email templates using premium editorial tone
function getEmail1Html(cart: AbandonedCart, recoveryUrl: string): string {
  const itemsHtml = cart.cart_items.map(item => `
    <tr>
      <td style="padding: 16px 0; border-bottom: 1px solid #e8e8e8;">
        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 100px; object-fit: cover;" />
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #e8e8e8; vertical-align: top;">
        <p style="margin: 0 0 4px; font-size: 14px; color: #1a1a1a;">${item.name}</p>
        <p style="margin: 0; font-size: 12px; color: #666;">Size: ${item.size || 'One Size'}</p>
      </td>
      <td style="padding: 16px 0; border-bottom: 1px solid #e8e8e8; text-align: right; vertical-align: top;">
        <p style="margin: 0; font-size: 14px; color: #1a1a1a;">${item.priceFormatted}</p>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Selection Awaits | LINEA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: #ffffff; color: #1a1a1a;">
      <div style="max-width: 560px; margin: 0 auto; padding: 0 20px;">
        
        <!-- Header -->
        <div style="padding: 40px 0 32px; text-align: center; border-bottom: 1px solid #e8e8e8;">
          <p style="margin: 0; font-size: 18px; letter-spacing: 0.3em; font-weight: 300;">LINEA</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 48px 0;">
          <h1 style="margin: 0 0 12px; font-size: 24px; font-weight: 300; text-align: center; letter-spacing: 0.05em;">
            Your selection is waiting
          </h1>
          <p style="margin: 0 0 40px; font-size: 14px; color: #666; text-align: center; line-height: 1.6;">
            You left a few items in your cart. We're holding them for you.
          </p>
          
          <!-- Items -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
            ${itemsHtml}
          </table>
          
          <!-- Total -->
          <div style="padding: 16px 0; border-top: 1px solid #1a1a1a; text-align: right;">
            <p style="margin: 0; font-size: 16px; color: #1a1a1a;">
              Total: <strong>€${cart.cart_total.toLocaleString()}</strong>
            </p>
          </div>
          
          <!-- CTA -->
          <div style="padding: 32px 0; text-align: center;">
            <a href="${recoveryUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 40px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
              Complete Your Order
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px 0; border-top: 1px solid #e8e8e8; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #999; line-height: 1.8;">
            You received this email because you left items in your cart at LINEA.<br/>
            <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getEmail2Html(cart: AbandonedCart, recoveryUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Still Interested? | LINEA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: #ffffff; color: #1a1a1a;">
      <div style="max-width: 560px; margin: 0 auto; padding: 0 20px;">
        
        <!-- Header -->
        <div style="padding: 40px 0 32px; text-align: center; border-bottom: 1px solid #e8e8e8;">
          <p style="margin: 0; font-size: 18px; letter-spacing: 0.3em; font-weight: 300;">LINEA</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 48px 0; text-align: center;">
          <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 300; letter-spacing: 0.05em;">
            Still interested?
          </h1>
          <p style="margin: 0 0 32px; font-size: 14px; color: #666; line-height: 1.6;">
            Your ${cart.cart_items.length} item${cart.cart_items.length > 1 ? 's are' : ' is'} waiting. Complete your order before they sell out.
          </p>
          
          <!-- Summary -->
          <div style="padding: 24px; border: 1px solid #e8e8e8; margin-bottom: 32px;">
            <p style="margin: 0 0 8px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.1em;">
              Your Cart
            </p>
            <p style="margin: 0; font-size: 24px; font-weight: 300; color: #1a1a1a;">
              €${cart.cart_total.toLocaleString()}
            </p>
          </div>
          
          <!-- CTA -->
          <a href="${recoveryUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 40px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
            Complete Your Order
          </a>
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px 0; border-top: 1px solid #e8e8e8; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #999; line-height: 1.8;">
            You received this email because you left items in your cart at LINEA.<br/>
            <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getEmail3Html(cart: AbandonedCart, recoveryUrl: string, discountCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>15% Off Your Order | LINEA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: #ffffff; color: #1a1a1a;">
      <div style="max-width: 560px; margin: 0 auto; padding: 0 20px;">
        
        <!-- Header -->
        <div style="padding: 40px 0 32px; text-align: center; border-bottom: 1px solid #e8e8e8;">
          <p style="margin: 0; font-size: 18px; letter-spacing: 0.3em; font-weight: 300;">LINEA</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 48px 0; text-align: center;">
          <p style="margin: 0 0 16px; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.2em;">
            Exclusive Offer
          </p>
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 300; letter-spacing: 0.02em;">
            15% off your order
          </h1>
          <p style="margin: 0 0 40px; font-size: 14px; color: #666; line-height: 1.6;">
            Use the code below to complete your purchase.
          </p>
          
          <!-- Discount Code -->
          <div style="padding: 24px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.2em;">
              Your Code
            </p>
            <p style="margin: 0; font-size: 20px; letter-spacing: 0.15em; font-weight: 500; color: #1a1a1a;">
              ${discountCode}
            </p>
          </div>
          
          <!-- Price -->
          <div style="margin-bottom: 32px;">
            <p style="margin: 0 0 4px; font-size: 14px; color: #999; text-decoration: line-through;">
              €${cart.cart_total.toLocaleString()}
            </p>
            <p style="margin: 0; font-size: 28px; font-weight: 300; color: #1a1a1a;">
              €${(cart.cart_total * 0.85).toLocaleString()}
            </p>
          </div>
          
          <!-- CTA -->
          <a href="${recoveryUrl}" style="display: inline-block; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 40px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">
            Claim 15% Off
          </a>
          
          <p style="margin: 24px 0 0; font-size: 12px; color: #999;">
            Offer expires in 24 hours
          </p>
        </div>
        
        <!-- Footer -->
        <div style="padding: 32px 0; border-top: 1px solid #e8e8e8; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #999; line-height: 1.8;">
            You received this email because you left items in your cart at LINEA.<br/>
            <a href="#" style="color: #999; text-decoration: underline;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY'); // Optional - emails are stubbed without it
    const siteUrl = Deno.env.get('SITE_URL') || 'https://linea-hearth.lovable.app';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const results = {
      email1Sent: 0,
      email2Sent: 0,
      email3Sent: 0,
      errors: 0,
    };

    // Fetch carts eligible for Email 1 (1 hour after creation, no email sent yet)
    const email1Threshold = new Date(now.getTime() - EMAIL_1_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email1Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'pending')
      .is('email_1_sent_at', null)
      .lt('created_at', email1Threshold.toISOString());

    for (const cart of email1Carts || []) {
      const recoveryUrl = `${siteUrl}/recover-cart?token=${cart.recovery_token}`;
      const html = getEmail1Html(cart as AbandonedCart, recoveryUrl);
      
      const sent = await sendEmail(
        cart.email,
        "Your selection is waiting | LINEA",
        html,
        resendApiKey
      );

      if (sent) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            email_1_sent_at: now.toISOString(),
            status: 'email_1_sent'
          })
          .eq('id', cart.id);
        results.email1Sent++;
      } else {
        results.errors++;
      }
    }

    // Fetch carts eligible for Email 2 (24 hours after creation, email 1 sent)
    const email2Threshold = new Date(now.getTime() - EMAIL_2_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email2Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'email_1_sent')
      .is('email_2_sent_at', null)
      .lt('created_at', email2Threshold.toISOString());

    for (const cart of email2Carts || []) {
      const recoveryUrl = `${siteUrl}/recover-cart?token=${cart.recovery_token}`;
      const html = getEmail2Html(cart as AbandonedCart, recoveryUrl);
      
      const sent = await sendEmail(
        cart.email,
        "Still interested? | LINEA",
        html,
        resendApiKey
      );

      if (sent) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            email_2_sent_at: now.toISOString(),
            status: 'email_2_sent'
          })
          .eq('id', cart.id);
        results.email2Sent++;
      } else {
        results.errors++;
      }
    }

    // Fetch carts eligible for Email 3 (72 hours after creation, email 2 sent)
    const email3Threshold = new Date(now.getTime() - EMAIL_3_DELAY_HOURS * 60 * 60 * 1000);
    const { data: email3Carts } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'email_2_sent')
      .is('email_3_sent_at', null)
      .lt('created_at', email3Threshold.toISOString());

    for (const cart of email3Carts || []) {
      // Generate discount code for this cart
      const discountCode = generateDiscountCode();
      
      const recoveryUrl = `${siteUrl}/recover-cart?token=${cart.recovery_token}`;
      const html = getEmail3Html(cart as AbandonedCart, recoveryUrl, discountCode);
      
      const sent = await sendEmail(
        cart.email,
        "15% off your order | LINEA",
        html,
        resendApiKey
      );

      if (sent) {
        await supabase
          .from('abandoned_carts')
          .update({ 
            email_3_sent_at: now.toISOString(),
            status: 'email_3_sent',
            discount_code: discountCode
          })
          .eq('id', cart.id);
        results.email3Sent++;
      } else {
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Abandoned cart processing complete',
        results,
        note: resendApiKey ? 'Emails sent via Resend' : 'Emails stubbed (RESEND_API_KEY not configured)'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error processing abandoned carts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
