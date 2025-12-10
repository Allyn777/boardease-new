import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { paymentMethodId, amount, currency, customerInfo, bookingInfo } = req.body;

    if (!paymentMethodId) {
      return res.status(400).json({ error: "Missing payment method. Please provide card details." });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount. Amount must be greater than 0." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency || "php",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: {
        customerName: customerInfo?.name || "N/A",
        customerEmail: customerInfo?.email || "N/A",
        customerPhone: customerInfo?.phone || "N/A",
        bookingId: String(bookingInfo?.id || "N/A"),
        roomId: String(bookingInfo?.roomId || "N/A"),
        roomNumber: bookingInfo?.roomNumber || "N/A",
        rentalTerm: bookingInfo?.rentalTerm || "N/A",
        tenantId: String(bookingInfo?.tenantId || "N/A")
      },
      description: `BoardEase Booking - ${bookingInfo?.roomNumber || "Room Rental"}`
    });

    if (paymentIntent.status === "succeeded") {
      return res.status(200).json({
        success: true,
        paymentIntentId: paymentIntent.id,
        requiresAction: false,
        clientSecret: paymentIntent.client_secret,
        status: "succeeded",
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      });
    }

    if (paymentIntent.status === "requires_action") {
      return res.status(200).json({
        success: false,
        paymentIntentId: paymentIntent.id,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        status: "requires_action"
      });
    }

    return res.status(400).json({
      error: `Payment is ${paymentIntent.status}. Please try again.`
    });
  } catch (error) {
    console.error("❌ Stripe error:", error);

    return res.status(500).json({
      error: error.message || "An unexpected error occurred. Please try again."
    });
  }
}
