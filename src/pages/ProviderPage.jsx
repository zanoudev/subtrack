import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchProviderById } from "../firebase/firestoreProviders";
import { getProviderPlans } from "../firebase/firestorePlans";
import PlanCard from "../components/PlanCard";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const ProviderPage = () => {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the provider's data from Firestore
        const providerData = await fetchProviderById(providerId);
        setProvider(providerData);

        // Retrieve the provider's plans
        if (providerData) {
          const providerPlans = await getProviderPlans(providerId);
          setPlans(providerPlans);
        }

        // Determine the user type (client vs. provider)
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const clientDocRef = doc(db, "clients", user.uid);
          const clientSnap = await getDoc(clientDocRef);
          if (clientSnap.exists()) {
            setUserType("client");
          } else {
            setUserType("provider");
          }
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [providerId]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!provider) {
    return <div className="text-center py-10">Provider not found.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 px-10 py-16">
      <div className="max-w-4xl mx-auto p-8">
        {/* Business Name as Page Title */}
        <h1 className="text-4xl font-bold mb-4">{provider.businessName}</h1>
        {/* Provider Bio */}
        <p className="text-lg text-gray-700 mb-8">
          {provider.bio || "No bio available."}
        </p>
        <p className="text-lg text-gray-700 mb-8">
          {provider.website || "No website available."}
        </p>
        {/* Provider Plans */}
        <h2 className="text-2xl font-semibold mb-4">Plans</h2>
        <div className="flex gap-4">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div key={plan.id} className="flex flex-col">
                <PlanCard {...plan} />
                {userType === "client" && (
                  <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Subscribe
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No plans available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderPage;
