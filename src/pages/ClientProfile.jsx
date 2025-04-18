import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FaEnvelope } from "react-icons/fa";
import PlanCard from "../components/PlanCard";
import SetupPaymentButton from "../components/SetupPaymentButton";
import loadingIllustration from "../assets/illustrations/Loading-Time.svg";

const ClientProfile = () => {
  const [clientData, setClientData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const clientDocRef = doc(db, "clients", user.uid);
        const clientSnap = await getDoc(clientDocRef);
  
        if (clientSnap.exists()) {
          const data = clientSnap.data();
          setClientData(data);
  
          const rawSubs = Array.isArray(data.subscriptions)
            ? data.subscriptions
            : Object.values(data.subscriptions || []);
  
          const fullPlans = await Promise.all(
            rawSubs.map(async (sub) => {
              const planRef = doc(db, "plans", sub.planId);
              const planSnap = await getDoc(planRef);
              if (planSnap.exists()) {
                return { id: planSnap.id, ...planSnap.data() };
              }
              return null;
            })
          );
  
          setSubscriptions(fullPlans.filter(Boolean));
        }
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setFormData({
      firstName: clientData.firstName || "",
      lastName: clientData.lastName || "",
      email: clientData.email || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const clientDocRef = doc(db, "clients", user.uid);
      try {
        await updateDoc(clientDocRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        setClientData((prev) => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }));
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <img src={loadingIllustration} alt="Loading..." className="w-60 mb-6" />
        <p className="text-gray-500 text-lg">Loading your profile...</p>
      </div>
    );
  }

  if (!clientData) {
    return <div className="text-center py-10">Client data not found.</div>;
  }

  return (
    <div className="w-screen min-h-screen flex flex-col items-start px-10 py-16">
      <div className="flex items-center justify-between w-full mb-6">
        <h1 className="text-5xl font-bold">Profile</h1>
        {isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Edit
          </button>
        )}
      </div>

      <section className="mb-10 w-full">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <span className="block text-gray-600 text-sm">First Name</span>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              />
            ) : (
              <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
                {clientData.firstName}
              </p>
            )}
          </div>
          <div>
            <span className="block text-gray-600 text-sm">Last Name</span>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              />
            ) : (
              <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
                {clientData.lastName}
              </p>
            )}
          </div>
          <div>
            <span className="block text-gray-600 text-sm">Contact Information</span>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-white text-black">
                {clientData.email}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stripe Connection Section for Clients */}
      <section className="mb-10 w-full">
        <h2 className="text-2xl font-semibold mb-4">Stripe Connection</h2>
        <div>
          {clientData.stripeConnected ? (
            <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
              Stripe Connected
            </p>
          ) : (
            <SetupPaymentButton stripeCustomerId={clientData.stripeCustomerId} />
          )}
        </div>
      </section>

      {/* Subscriptions */}
      <section className="mb-10 w-full">
        <h2 className="text-2xl font-semibold mb-4">My Subscriptions</h2>
        <div className="flex flex-wrap gap-4">
          {subscriptions.length > 0 ? (
            subscriptions.map((plan) => (
              <div key={plan.id} className="flex flex-col items-start">
                <PlanCard {...plan} isSubscribed={true} />
                <button
                  onClick={() => handleUnsubscribe(plan.id)}
                  className="mt-3 px-4 py-2 border border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition"
                >
                  Unsubscribe
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No subscriptions yet.</p>
          )}
        </div>
      </section>


    </div>
  );
};

export default ClientProfile;
