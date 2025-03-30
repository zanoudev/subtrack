import { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const SetupPaymentButton = ({ stripeCustomerId: propStripeCustomerId }) => {
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      let stripeCustomerId = propStripeCustomerId;
      // Use the "clients" collection for clients.
      const clientDocRef = doc(db, "clients", user.uid);
      const docSnap = await getDoc(clientDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.stripeCustomerId) {
          stripeCustomerId = data.stripeCustomerId;
        } else {
          // Create a new Stripe Customer via backend
          const createResponse = await fetch("http://localhost:3000/create-stripe-customer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.uid, userType: "client" }),
          });
          const createData = await createResponse.json();
          if (createData.stripeCustomerId) {
            stripeCustomerId = createData.stripeCustomerId;
            // Update Firestore with the new stripeCustomerId
            await updateDoc(clientDocRef, { stripeCustomerId });
          } else {
            console.error("Failed to create Stripe customer", createData);
            setLoading(false);
            return;
          }
        }
      } else {
        console.error("Client document not found in Firestore");
        setLoading(false);
        return;
      }

      // Now create a Checkout session for setting up a payment method
      const response = await fetch("http://localhost:3000/create-stripe-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeCustomerId }),
      });
      const data = await response.json();
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error("No URL returned", data);
      }
    } catch (error) {
      console.error("Error setting up payment method:", error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleSetup}
      disabled={loading}
      className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
    >
      {loading ? "Setting up..." : "Add payment method with Stripe"}
    </button>
  );
};

export default SetupPaymentButton;
