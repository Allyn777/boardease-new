// /api/create-payment-intent.js
import Stripe from 'stripe'; // NO TYPO - it's "stripe" NOT "stripel"

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log request for debugging
    console.log('=== STRIPE PAYMENT REQUEST ===');
    console.log('Body:', req.body);
    
    const { amount, orderId } = req.body;

    // Validate input
    if (!amount || !orderId) {
      return res.status(400).json({ 
        error: 'Missing amount or orderId',
        received: { amount, orderId }
      });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount. Must be positive number',
        received: amount
      });
    }

    // Check Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing!');
      return res.status(500).json({ 
        error: 'Server configuration error: Stripe key missing'
      });
    }

    console.log('Stripe key present, amount:', amountNum, 'orderId:', orderId);

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Create PaymentIntent - USE PHP CURRENCY
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountNum * 100), // PHP to centavos
      currency: 'php', // Philippine Peso - THIS IS CORRECT
      metadata: {
        orderId: orderId.toString(),
        platform: 'Fighting Gears',
        userId: req.body.userId || 'unknown'
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Order ${orderId} - Fighting Gears`,
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    // Return success
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountNum,
      currency: 'PHP',
      message: 'Payment intent created successfully'
    });

  } catch (error) {
    console.error('=== STRIPE ERROR ===');
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Code:', error.code);
    
    // Return detailed error
    return res.status(500).json({
      success: false,
      error: error.message,
      type: error.type || 'unknown',
      code: error.code || 'server_error',
      details: 'Check server logs for more info'
    });
  }
}