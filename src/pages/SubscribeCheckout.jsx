import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const SubscribeCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state;
  const [cardInfo, setCardInfo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "clients", user.uid));
        const stripeCustomerId = userDoc.data().stripeCustomerId;

        const res = await fetch(`http://localhost:3000/getUserPaymentMethod?customerId=${stripeCustomerId}`);
        if (!res.ok) return console.error("Error:", await res.text());

        const data = await res.json();
        if (data.length > 0) setCardInfo(data[0]);
      }
    });
      
    return () => unsubscribe();
  }, []);

  const handleConfirm = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return alert("Not signed in.");
  
    const clientRef = doc(db, "clients", user.uid);
    const planRef = doc(db, "plans", plan.id);
  
    try {
      // get client stripeCustomerId
      const clientSnap = await getDoc(clientRef);
      const stripeCustomerId = clientSnap.data().stripeCustomerId;
  
      let stripePriceId = plan.stripePriceId;
      const cycleMap = {
        monthly: "month",
        annually: "year",
        annual: "year",
        yearly: "year",
        weekly: "week",
        daily: "day"
      };
      
      const mappedCycle = cycleMap[plan.billingCycle.toLowerCase()] || "month";
      
  
      // If no Stripe price, create it now
      if (!stripePriceId) {
        const createRes = await fetch("http://localhost:3000/create-stripe-price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: plan.title,
            price: plan.price,
            billingCycle: mappedCycle || "month",
          }),
        });
  
        const created = await createRes.json();
        stripePriceId = created.stripePriceId;

        if (!stripePriceId) throw new Error("Stripe price ID missing from response");
  
        // Update the plan in Firestore with stripePriceId
        await updateDoc(planRef, {
          stripePriceId,
        });
      }
  
      // Add user to subscriber list
      await updateDoc(planRef, {
        subscriberList: arrayUnion(user.uid),
      });
  
      // Add plan to user's subscriptions
      await updateDoc(clientRef, {
        subscriptions: arrayUnion({ planId: plan.id }),
      });
  
      // Create Stripe subscription
      const subRes = await fetch("http://localhost:3000/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          priceId: stripePriceId,
        }),
      });
  
      if (!subRes.ok) throw new Error("Stripe subscription failed");
      const { subscriptionId } = await subRes.json();
  
      alert("Subscription created!");
      // navigate("/client-profile");
  
    } catch (err) {
      console.error("Error during subscription:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Confirm Subscription</h2>

        {/* Plan Info */}
        <div className="mb-6 p-6 rounded-xl bg-gray-100">
        <p className="text-sm font-medium text-gray-500 uppercase mb-2 tracking-wide">
            Plan
        </p>
        <h3 className="text-2xl font-extrabold text-gray-900">{plan.title}</h3>

        <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
            <p className="text-base font-medium text-gray-800">{plan.billingCycle}</p>
        </div>

        <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Price</p>
            <p className="text-3xl font-bold text-gray-900">
            {plan.currency} {plan.price}
            </p>
        </div>

        {plan.description && (
            <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Description</p>
            <p className="text-sm text-gray-700">{plan.description}</p>
            </div>
        )}
        </div>


        {/* Payment Info */}
        <div className="mb-6 p-5 rounded-xl bg-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold mb-2">Payment Method</h4>
              {cardInfo ? (
                <div className="text-sm text-gray-700">
                  <p>{cardInfo.card.brand.toUpperCase()} **** {cardInfo.card.last4}</p>
                  <p>Expires {cardInfo.card.exp_month}/{cardInfo.card.exp_year}</p>
                </div>
              ) : (
                <p className="text-gray-500">Loading payment info...</p>
              )}
            </div>
            <button
              onClick={() => navigate("/client-profile")}
              className="text-sm text-blue-500 hover:underline mt-1"
            >
              Edit Card
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
          <button
            onClick={() => navigate(`/provider-page/${plan.providerId}`)}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeCheckout;
