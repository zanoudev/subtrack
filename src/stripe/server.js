/*
• /create-stripe-account: For providers who need to create a Connect account.
• /create-stripe-account-link: For generating an onboarding link for providers.
• /create-stripe-customer: For clients to create a Stripe Customer object.
• /create-stripe-checkout-session: For clients to generate a Checkout session to add a payment method via Stripe Checkout.
• Plus optional endpoints for refresh and return for Connect onboarding.
*/

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

// -----------------------------
// Provider Endpoints
// -----------------------------

// Endpoint to create a Stripe Connect account for providers
app.post("/create-stripe-account", async (req, res) => {
  try {
    const { userId, userType } = req.body; // Optional for logging/future use
    console.log(
      "Received request to create Stripe account for:",
      userId,
      userType
    );
    const account = await stripe.accounts.create({ type: "express" });
    console.log("Created Stripe account:", account.id);
    res.json({ stripeAccountId: account.id });
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to create a Stripe account link for onboarding providers
app.post("/create-stripe-account-link", async (req, res) => {
  try {
    const { stripeAccountId } = req.body;
    if (!stripeAccountId) {
      return res.status(400).json({ error: "Missing stripeAccountId" });
    }
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: "http://localhost:3000/stripe/refresh",
      return_url: "http://localhost:3000/stripe/return",
      type: "account_onboarding",
    });
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe account link:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// Client Endpoints
// -----------------------------

// Endpoint to create a new Stripe Customer for clients
app.post("/create-stripe-customer", async (req, res) => {
  try {
    const { userId, userType } = req.body;
    console.log(
      "Received request to create Stripe customer for:",
      userId,
      userType
    );
    const customer = await stripe.customers.create({
      description: `Stripe Customer for ${userType} ${userId}`,
    });
    console.log("Created Stripe customer:", customer.id);
    res.json({ stripeCustomerId: customer.id });
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to create a Stripe Checkout session for setting up payment method for clients
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
      success_url: "http://localhost:5173/profile?setup_success=true",
      cancel_url: "http://localhost:5173/profile?setup_cancelled=true",
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// Optional Endpoints for Connect Onboarding (Providers)
// -----------------------------

app.get("/stripe/refresh", (req, res) => {
  res.redirect("/profile");
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
