import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchProviderById } from "../firebase/firestoreProviders";
import { getProviderPlans } from "../firebase/firestorePlans";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import PlanCard from "../components/PlanCard";
import loadingIllustration from "../assets/illustrations/Loading-Time.svg";


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
      <div className="w-full p-10">
        {/* cover image */}
        {provider.coverImageUrl && (
          <img
            src={provider.coverImageUrl}
            alt={`${provider.businessName} cover`}
            className="w-full h-64 object-cover rounded-xl mb-6 shadow-md"
          />
        )}
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
