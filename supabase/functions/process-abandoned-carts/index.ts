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

// Email templates using "Last Briefing" narrative
function getEmail1Html(cart: AbandonedCart, recoveryUrl: string): string {
  const itemsHtml = cart.cart_items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 12px;" />
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666;">Size: ${item.size || 'One Size'} | Qty: ${item.quantity}</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">
        ${item.priceFormatted}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Mission Awaits | LINEA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: #0a0a0a; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; letter-spacing: 4px; margin: 0;">LINEA</h1>
        </div>
        
        <!-- Hero -->
        <div style="padding: 48px 32px; text-align: center; background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);">
          <h2 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0 0 16px;">SOLDIER, YOUR GEAR AWAITS</h2>
          <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0;">
            Your mission gear is still in the staging area. The battle doesn't wait.
          </p>
        </div>
        
        <!-- Cart Items -->
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #0a0a0a; text-align: right;">
            <strong style="font-size: 18px;">Total: €${cart.cart_total.toLocaleString()}</strong>
          </div>
        </div>
        
        <!-- CTA -->
        <div style="padding: 0 32px 48px; text-align: center;">
          <a href="${recoveryUrl}" style="display: inline-block; background: #0a0a0a; color: #ffffff; text-decoration: none; padding: 16px 48px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
            COMPLETE YOUR MISSION
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 24px 32px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            You received this email because you left items in your cart at LINEA.<br/>
            <a href="#" style="color: #666;">Unsubscribe</a>
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
      <title>The Clock is Ticking | LINEA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: #0a0a0a; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; letter-spacing: 4px; margin: 0;">LINEA</h1>
        </div>
        
        <!-- Hero -->
        <div style="padding: 48px 32px; text-align: center; background: #0a0a0a;">
          <h2 style="color: #ffffff; font-size: 28px; font-weight: 300; margin: 0 0 16px;">STILL STANDING BY?</h2>
          <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Your armor is waiting. The world needs warriors who are ready to stand.
          </p>
          <div style="color: #d4af37; font-size: 14px; letter-spacing: 1px;">
            "Put on the full armor of God" — Ephesians 6:11
          </div>
        </div>
        
        <!-- Quick Summary -->
        <div style="padding: 32px; text-align: center;">
          <p style="font-size: 16px; color: #333; margin: 0 0 8px;">
            <strong>${cart.cart_items.length} item${cart.cart_items.length > 1 ? 's' : ''}</strong> still in your cart
          </p>
          <p style="font-size: 24px; color: #0a0a0a; margin: 0;">
            €${cart.cart_total.toLocaleString()}
          </p>
        </div>
        
        <!-- CTA -->
        <div style="padding: 0 32px 48px; text-align: center;">
          <a href="${recoveryUrl}" style="display: inline-block; background: #0a0a0a; color: #ffffff; text-decoration: none; padding: 16px 48px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
            SUIT UP NOW
          </a>
        </div>
        
        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 24px 32px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            You received this email because you left items in your cart at LINEA.<br/>
            <a href="#" style="color: #666;">Unsubscribe</a>
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
      <title>Final Call + 15% Off | LINEA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: #0a0a0a; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 24px; font-weight: 300; letter-spacing: 4px; margin: 0;">LINEA</h1>
        </div>
        
        <!-- Hero with Discount -->
        <div style="padding: 48px 32px; text-align: center; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);">
          <div style="display: inline-block; background: #d4af37; color: #0a0a0a; padding: 8px 16px; font-size: 12px; letter-spacing: 2px; margin-bottom: 24px;">
            FINAL BRIEFING
          </div>
          <h2 style="color: #ffffff; font-size: 32px; font-weight: 300; margin: 0 0 16px;">15% OFF YOUR ORDER</h2>
          <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            This is your last call, soldier. Use code below before it expires.
          </p>
          <div style="background: #ffffff; color: #0a0a0a; padding: 16px 32px; display: inline-block; font-size: 20px; letter-spacing: 4px; font-weight: bold;">
            ${discountCode}
          </div>
        </div>
        
        <!-- Cart Summary -->
        <div style="padding: 32px; text-align: center;">
          <p style="font-size: 16px; color: #666; margin: 0 0 8px;">Your cart total:</p>
          <p style="font-size: 18px; color: #999; text-decoration: line-through; margin: 0;">
            €${cart.cart_total.toLocaleString()}
          </p>
          <p style="font-size: 28px; color: #0a0a0a; margin: 8px 0 0; font-weight: bold;">
            €${(cart.cart_total * 0.85).toLocaleString()}
          </p>
        </div>
        
        <!-- CTA -->
        <div style="padding: 0 32px 48px; text-align: center;">
          <a href="${recoveryUrl}" style="display: inline-block; background: #d4af37; color: #0a0a0a; text-decoration: none; padding: 16px 48px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">
            CLAIM YOUR 15% OFF
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 16px;">
            Offer expires in 24 hours
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 24px 32px; text-align: center;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            You received this email because you left items in your cart at LINEA.<br/>
            <a href="#" style="color: #666;">Unsubscribe</a>
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
        "Soldier, Your Gear Awaits | LINEA",
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
        "Still Standing By? | LINEA",
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
        "Final Call: 15% Off Your Order | LINEA",
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
