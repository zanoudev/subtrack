// THIS PAGE IS USED TO CREATE AND MODIFY PLANS
// USES CONTEXT TO DETERMINE ACTION CREATE/EDIT


import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, addDoc, collection, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const ConfigPlan = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const currency = "CAD";
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [customCycle, setCustomCycle] = useState("");
  const [gracePeriod, setGracePeriod] = useState("0");
  const [businessName, setBusinessName] = useState("");
  const navigate = useNavigate();
  const { planId } = useParams(); // if planId exists, we're editing

  // Fetch provider business name from Firestore
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const fetchProviderData = async () => {
        const providerDocRef = doc(db, "providers", user.uid);
        const providerSnap = await getDoc(providerDocRef);
        if (providerSnap.exists()) {
          setBusinessName(providerSnap.data().businessName);
        }
      };
      fetchProviderData();
    }
  }, []);

  // If editing, fetch existing plan data and populate the form
  useEffect(() => {
    if (planId) {
      const fetchPlanData = async () => {
        const planDocRef = doc(db, "plans", planId);
        const planSnap = await getDoc(planDocRef);
        if (planSnap.exists()) {
          const planData = planSnap.data();
          setTitle(planData.title);
          setDescription(planData.description);
          setPrice(planData.price.toString());
          // Billing cycle may be stored as "custom" or a string like "monthly"
          if (planData.billingCycle.includes("weeks")) {
            setBillingCycle("custom");
            setCustomCycle(planData.billingCycle.split(" ")[0]); // extract the number of weeks
          } else {
            setBillingCycle(planData.billingCycle);
          }
          setGracePeriod(planData.gracePeriod.toString());
        }
      };
      fetchPlanData();
    }
  }, [planId]);

  const handleBillingCycleChange = (e) => {
    setBillingCycle(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic client-side validation
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    if (parseFloat(price) < 0) {
      alert("Price cannot be negative.");
      return;
    }
    if (billingCycle === "custom" && (customCycle === "" || parseInt(customCycle, 10) < 0)) {
      alert("Custom billing cycle must be 0 or more weeks.");
      return;
    }
    if (parseInt(gracePeriod, 10) < 0) {
      alert("Grace period cannot be negative.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // Determine the final billingCycle value.
    const finalBillingCycle =
      billingCycle === "custom" ? `${customCycle} weeks` : billingCycle;

    // Prepare the plan object
    const plan = {
      title: title.trim(),
      description: description.trim(),
      providerId: user.uid,
      price: parseFloat(price),
      currency: currency,
      billingCycle: finalBillingCycle,
      gracePeriod: parseInt(gracePeriod, 10)
    };

    try {
      if (planId) {
        // Editing: update the existing plan
        const planDocRef = doc(db, "plans", planId);
        await updateDoc(planDocRef, plan);
      } else {
        // Creating a new plan: include additional fields for new plan
        plan.createdAt = new Date();
        plan.subscriberList = [];
        // Add the plan to /plans collection
        const planRef = await addDoc(collection(db, "plans"), plan);
        // Add the planId to the provider's "business-plans" attribute
        const providerDocRef = doc(db, "providers", user.uid);
        await updateDoc(providerDocRef, {
          "business-plans": arrayUnion(planRef.id)
        });
      }
      // Redirect back to home (or the plans display page)
      navigate("/home");
    } catch (error) {
      console.error("Error saving plan: ", error);
      alert("There was an error saving your plan. Please try again.");
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-100 py-10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6">
          {planId ? "Edit Plan" : "Create New Plan"}
        </h2>

        {/* Title (mandatory) */}
        <div className="mb-4">
          <label className="block text-gray-700">
            Title<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md mt-1"
            required
          />
        </div>

        {/* Description (optional) */}
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md mt-1"
            rows="4"
            placeholder="Enter a brief description of your plan..."
          />
        </div>

        {/* Business Name (read-only, greyed out) */}
        <div className="mb-4">
          <label className="block text-gray-700">Business Name</label>
          <input
            type="text"
            value={businessName}
            disabled
            className="w-full p-3 border border-gray-300 rounded-md mt-1 bg-gray-200"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-gray-700">Price</label>
          <div className="flex space-x-2 mt-1">
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-2/3 p-3 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              value={currency}
              readOnly
              className="w-1/3 p-3 border border-gray-300 rounded-md bg-gray-200"
            />
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="mb-4">
          <label className="block text-gray-700">Billing Cycle</label>
          <select
            value={billingCycle}
            onChange={handleBillingCycleChange}
            className="w-full p-3 border border-gray-300 rounded-md mt-1"
          >
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
            <option value="custom">Custom</option>
          </select>
          {billingCycle === "custom" && (
            <div className="mt-2">
              <label className="block text-gray-700">Custom Cycle (weeks)</label>
              <input
                type="number"
                min="0"
                value={customCycle}
                onChange={(e) => setCustomCycle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md mt-1"
                required
              />
            </div>
          )}
        </div>

        {/* Grace Period */}
        <div className="mb-4">
          <label className="block text-gray-700">Grace Period (days)</label>
          <input
            type="number"
            min="0"
            value={gracePeriod}
            onChange={(e) => setGracePeriod(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md mt-1"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-opacity-90 transition"
        >
          {planId ? "Save Changes" : "Save Plan"}
        </button>
      </form>
    </div>
  );
};

export default ConfigPlan;
