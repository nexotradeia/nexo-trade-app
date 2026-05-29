// api/webhook.js — NEXO TRADE Stripe Webhook Handler
import crypto from 'node:crypto';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return res.status(400).json({ error: 'Missing signature or secret' });
  }

  // Read raw body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  // Verify Stripe signature
  try {
    const parts = {};
    sig.split(',').forEach(part => {
      const idx = part.indexOf('=');
      if (idx > 0) parts[part.slice(0, idx)] = part.slice(idx + 1);
    });

    const timestamp = parts['t'];
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex');

    const received = parts['v1'] || '';
    const expBuf = Buffer.from(expected, 'hex');
    const recBuf = Buffer.from(received.length === expected.length ? received : expected, 'hex');
    if (!crypto.timingSafeEqual(expBuf, recBuf) || received !== expected) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);
    console.log('Stripe event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email;

      if (email && process.env.SUPABASE_SERVICE_KEY) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          'https://glvrzrtatekuuhwtzzhd.supabase.co',
          process.env.SUPABASE_SERVICE_KEY
        );

        const { error } = await supabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('email', email);

        if (error) console.error('Supabase error:', error.message);
        else console.log('✅ Premium activado para:', email);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).json({ error: err.message });
  }
}
