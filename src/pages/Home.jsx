import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getProviderPlans } from "../firebase/firestorePlans";
import PlanCard from "../components/PlanCard";

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-10 py-16">
      <h1 className="text-5xl font-bold mb-6">Home</h1>
      <main className="w-screen flex-grow flex">
        <div className="max-w-4xl w-full">
          {userType === "client" && (
            <>
              {plans.length > 0 ? (
                plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <img
                    src="src/assets/notion-icons/14.svg"
                    alt="No subscriptions icon"
                    className="mb-4"
                  />
                  <p className="text-center text-gray-500 text-xl">No subscriptions yet</p>
                </div>
              )}
            </>
          )}

          {userType === "provider" && (
            <>
              <section className="mb-10">
                <h2 className="text-3xl font-bold mb-4">My Plans</h2>
                <div className="flex space-x-4 overflow-x-auto pb-4">
                  <Link
                    to="/config-plan"
                    className="flex-shrink-0 w-40 h-40 bg-blue-500 text-white flex items-center justify-center rounded-md hover:bg-blue-600"
                  >
                    <span className="text-4xl font-bold">+</span>
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

      <footer className="bg-white py-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} SubTrack. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
