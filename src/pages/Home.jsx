import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import { getProviderPlans } from "../firebase/firestorePlans";
import PlanCard from "../components/PlanCard";
import SuggestionsList from "../components/SuggestionsList";

import loadingIllustration from "../assets/illustrations/Loading-Time.svg";

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allProviders, setAllProviders] = useState([]);
  const [preferences, setPreferences] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const clientDocRef = doc(db, "clients", user.uid);
        const providerDocRef = doc(db, "providers", user.uid);

        const [clientSnap, providerSnap] = await Promise.all([
          getDoc(clientDocRef),
          getDoc(providerDocRef),
        ]);

        if (clientSnap.exists()) {
          setUserType("client");
          const clientData = clientSnap.data();
          const preferences = clientData.preferences || [];
          setPreferences(preferences);

          // fetch user's subscriptions
          if (clientData.subscriptions && Object.keys(clientData.subscriptions).length > 0) {
            const subscriptions = Array.isArray(clientData.subscriptions)
              ? clientData.subscriptions
              : Object.values(clientData.subscriptions);

              const plansData = await Promise.all(
                subscriptions.map(async (sub) => {
                  const planDocRef = doc(db, "plans", sub.planId);
                  const planSnap = await getDoc(planDocRef);
                  if (planSnap.exists()) {
                    return { id: planSnap.id, ...planSnap.data() };
                  } else {
                    return null;
                  }
                })
              );
            setPlans(plansData.filter(plan => plan !== null));
          } else {
            setPlans([]);
          }

          // fetch all providers
          const allSnap = await getDocs(collection(db, "providers"));
          const all = [];

          allSnap.forEach((doc) => {
            const data = doc.data();
            all.push({ id: doc.id, ...data });
          });

          setAllProviders(all);

        } else if (providerSnap.exists()) {
          setUserType("provider");
          const providerPlans = await getProviderPlans(user.uid);
          setPlans(providerPlans);
        } else {
          setUserType(null);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <img src={loadingIllustration} alt="Loading..." className="w-60 mb-6" />
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-10 py-16">
      <h1 className="text-5xl font-bold mb-6">Home</h1>
      <main className="w-full flex-grow flex justify-center items-start">
        <div className="max-w-6xl w-full px-6">
          {userType === "client" && (
            <>
              <div className="flex space-x-4 overflow-visible pb-4">
              {plans.length > 0 ? (
                plans.map((plan) => <PlanCard key={plan.id} {...plan} isSubscribed={true} />)
              ) : (
                <div className="flex flex-col items-start justify-center"> 
                  <img
                    src="src/assets/notion-icons/14.svg"
                    alt="No subscriptions icon"
                    className="mb-4"
                  />
                  <p className="text-center text-gray-500 text-xl">No subscriptions yet</p>
                </div>
              )}
              </div>
              <SuggestionsList providers={allProviders} preferences={preferences} />
            </>
          )}

          {userType === "provider" && (
            <>
              <section className="mb-10">
                <h2 className="text-3xl font-bold mb-4">My Plans</h2>
                <div className="flex space-x-4 overflow-visible pb-4">
                  <Link
                    to="/config-plan"
                    className="bg-primary text-white p-6 shadow-xl rounded-2xl w-80 h-64 flex flex-col justify-between transform transition-transform hover:scale-[1.03] hover:shadow-2xl"
                  >
                    <span className="text-4xl font-bold">+ Add plan</span>
                  </Link>
                  {plans.length > 0 &&
                    plans
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((plan) => <PlanCard key={plan.id} {...plan} />)}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-4">Recent Updates</h2>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-500">Updates content goes here (To be integrated)</p>
                </div>
              </section>
            </>
          )}

          {userType === null && (
            <p className="text-center text-gray-500">
              User type not identified. Contact support.
            </p>
          )}
        </div>
      </main>

      {/* <footer className="bg-white py-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} SubTrack. All rights reserved.
        </div>
      </footer> */}
    </div>
  );
};

export default Home;
