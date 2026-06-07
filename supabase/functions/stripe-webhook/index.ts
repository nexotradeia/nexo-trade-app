// ============================================================
// NEXO TRADE — Edge Function: stripe-webhook
// Maneja eventos de Stripe y actualiza suscripciones en DB
// ============================================================
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature  = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret)
  } catch (err) {
    console.error('Webhook signature inválida:', err)
    return new Response(JSON.stringify({ error: 'Firma inválida' }), { status: 400 })
  }

  console.log(`Evento Stripe recibido: ${event.type}`)

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.subscription_data?.metadata?.supabase_user_id
          ?? session.metadata?.supabase_user_id

        if (!userId) {
          console.error('checkout.session.completed: sin supabase_user_id en metadata')
          break
        }

        // Obtener detalles completos de la suscripción
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

        await supabase.rpc('upsert_subscription', {
          p_user_id:            userId,
          p_stripe_sub_id:      subscription.id,
          p_stripe_customer_id: subscription.customer as string,
          p_stripe_price_id:    subscription.items.data[0].price.id,
          p_status:             subscription.status,
          p_period_start:       new Date(subscription.current_period_start * 1000).toISOString(),
          p_period_end:         new Date(subscription.current_period_end   * 1000).toISOString(),
          p_canceled_at:        null,
        })

        console.log(`VIP activado para usuario ${userId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (!userId) {
          // Buscar por stripe_customer_id en profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single()

          if (!profile) { console.error('Usuario no encontrado para customer:', subscription.customer); break }

          await supabase.rpc('upsert_subscription', {
            p_user_id:            profile.id,
            p_stripe_sub_id:      subscription.id,
            p_stripe_customer_id: subscription.customer as string,
            p_stripe_price_id:    subscription.items.data[0].price.id,
            p_status:             subscription.status,
            p_period_start:       new Date(subscription.current_period_start * 1000).toISOString(),
            p_period_end:         new Date(subscription.current_period_end   * 1000).toISOString(),
            p_canceled_at:        subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          break
        }

        await supabase.rpc('upsert_subscription', {
          p_user_id:            userId,
          p_stripe_sub_id:      subscription.id,
          p_stripe_customer_id: subscription.customer as string,
          p_stripe_price_id:    subscription.items.data[0].price.id,
          p_status:             subscription.status,
          p_period_start:       new Date(subscription.current_period_start * 1000).toISOString(),
          p_period_end:         new Date(subscription.current_period_end   * 1000).toISOString(),
          p_canceled_at:        subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (sub) {
          await supabase.rpc('set_user_vip', {
            p_user_id:    sub.user_id,
            p_active:     false,
            p_expires_at: null,
          })
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled', canceled_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id)

          console.log(`VIP cancelado para usuario ${sub.user_id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subId)
          .single()

        if (sub) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subId)

          console.log(`Pago fallido para usuario ${sub.user_id}`)
        }
        break
      }

      default:
        console.log(`Evento no manejado: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Error procesando webhook:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
