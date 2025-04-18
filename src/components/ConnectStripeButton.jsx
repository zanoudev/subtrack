// src/components/ConnectStripeButton.jsx
import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const ConnectStripeButton = ({ stripeAccountId: propStripeAccountId, userType }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      let stripeAccountId = propStripeAccountId;
      // Determine Firestore collection based on userType: providers or clients.
      const collectionName = userType === "provider" ? "providers" : "clients";
      const userDocRef = doc(db, collectionName, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.stripeAccountId) {
          stripeAccountId = data.stripeAccountId;
        } else {
          // No stripeAccountId found; create one via backend
          const createResponse = await fetch("http://localhost:3000/create-stripe-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.uid, userType })
          });
          const createData = await createResponse.json();
          if (createData.stripeAccountId) {
            stripeAccountId = createData.stripeAccountId;
            // Update Firestore with the new stripeAccountId
            await updateDoc(userDocRef, { stripeAccountId });
          } else {
            console.error("Failed to create Stripe account", createData);
            setLoading(false);
            return;
          }
        }
      } else {
        console.error("User document not found in Firestore");
        setLoading(false);
        return;
      }

      // With a valid stripeAccountId, create an account link for onboarding.
      const response = await fetch("http://localhost:3000/create-stripe-account-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeAccountId })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned", data);
      }
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-6 py-2 bg-[#7069fe] text-white rounded-md hover:bg-[#a194ff] transition"
    >
      {loading ? "Connecting..." : "Connect to Stripe"}
    </button>
  );
};

export default ConnectStripeButton;
