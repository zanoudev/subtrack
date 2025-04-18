import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
const stripe = new Stripe(
  "sk_test_51R5zm1BVbZWXhJjDBg4aNFhJdJvR5BseoeIN5gt6Kk69JpgtX4u1Y7J8Nk62Bzuor2HzD2OzVxPxxSMWvrV1OnK700ksYqQleI",
  { apiVersion: "2020-08-27" }
);

app.use(cors());
app.use(express.json());

/* ----------------------------
   Provider Endpoints
---------------------------- */

// Create Stripe Connect account
app.post("/create-stripe-account", async (req, res) => {
  try {
    const { userId, userType } = req.body;
    const account = await stripe.accounts.create({ type: "express" });
    res.json({ stripeAccountId: account.id });
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create onboarding link
app.post("/create-stripe-account-link", async (req, res) => {
  try {
    const { stripeAccountId } = req.body;
    if (!stripeAccountId) {
      return res.status(400).json({ error: "Missing stripeAccountId" });
    }
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url:
        "http://localhost:5173/provider-profile?onboarding_refresh=true",
      return_url:
        "http://localhost:5173/provider-profile?onboarding_success=true",
      type: "account_onboarding",
    });
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe account link:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------
   Client Endpoints
---------------------------- */

// Create Stripe customer
app.post("/create-stripe-customer", async (req, res) => {
  try {
    const { userId, userType } = req.body;
    const customer = await stripe.customers.create({
      description: `Stripe Customer for ${userType} ${userId}`,
    });
    res.json({ stripeCustomerId: customer.id });
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a setup session to add card
app.post("/create-stripe-checkout-session", async (req, res) => {
  try {
    const { stripeCustomerId } = req.body;
    if (!stripeCustomerId) {
      return res.status(400).json({ error: "Missing stripeCustomerId" });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      mode: "setup",
      success_url: "http://localhost:5173/client-profile?setup_success=true",
      cancel_url: "http://localhost:5173/client-profile?setup_cancelled=true",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get saved payment methods
app.get("/getUserPaymentMethod", async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId)
      return res.status(400).json({ error: "Missing customerId" });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    res.json(paymentMethods.data);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------
   Subscription Handling
---------------------------- */

// Create recurring price and product
app.post("/create-stripe-price", async (req, res) => {
  const { title, price, billingCycle } = req.body;

  console.log("Received create-stripe-price:", { title, price, billingCycle });

  if (!title || !price || !billingCycle) {
    return res
      .status(400)
      .json({ error: "Missing title, price, or billingCycle" });
  }

  try {
    const product = await stripe.products.create({ name: title });

    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100),
      currency: "cad",
      recurring: { interval: billingCycle.toLowerCase() },
      product: product.id,
    });

    res.json({ stripePriceId: stripePrice.id });
  } catch (err) {
    console.error("Error creating Stripe price:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a subscription
app.post("/create-subscription", async (req, res) => {
  const { customerId, priceId } = req.body;

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error("Subscription error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------
   Stripe Connect Return Routes
---------------------------- */

app.get("/stripe/refresh", (req, res) => {
  res.redirect("/provider-profile");
});

app.get("/stripe/return", async (req, res) => {
  try {
    const stripeAccountId = req.query.account;
    console.log("Stripe onboarding completed for account:", stripeAccountId);
    res.redirect("/profile");
  } catch (error) {
    console.error("Error on Stripe return:", error);
    res.redirect("/profile");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
