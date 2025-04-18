// getUserPaymentMethods.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getUserPaymentMethods = async (req, res) => {
  const { customerId } = req.query;
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });
    res.json(paymentMethods.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
