import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { FaEnvelope, FaPhone, FaLink } from "react-icons/fa";
import PlanCard from "../components/PlanCard";
import ConnectStripeButton from "../components/ConnectStripeButton";

import { getProviderPlans } from "../firebase/firestorePlans";
import { Link } from "react-router-dom";


const ProviderProfile = () => {
  const [providerData, setProviderData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProviderData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const providerDocRef = doc(db, "providers", user.uid);
        const docSnap = await getDoc(providerDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProviderData(data);
          const providerPlans = await getProviderPlans(user.uid);
          setPlans(providerPlans);
        }
      }
    };

    fetchProviderData();
  }, []);

  // Handler for form input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Initiate editing by copying current data to formData
  const handleEdit = () => {
    setFormData({
      businessName: providerData.businessName || "",
      bio: providerData.bio || "",
      category: providerData.category || "",
      phone: providerData.phone || "",
      website: providerData.website || "",
    });
    setIsEditing(true);
  };

  // Save changes to Firestore and update local state
  const handleSave = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const providerDocRef = doc(db, "providers", user.uid);
      try {
        await updateDoc(providerDocRef, {
          businessName: formData.businessName,
          bio: formData.bio,
          category: formData.category,
          phone: formData.phone,
          website: formData.website,
        });
        setProviderData(prev => ({
          ...prev,
          businessName: formData.businessName,
          bio: formData.bio,
          category: formData.category,
          phone: formData.phone,
          website: formData.website,
        }));
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  // Cancel editing mode
  const handleCancel = () => {
    setIsEditing(false);
  };

  if (!providerData) {
    return <div className="text-center py-10">Loading...</div>;
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
            className="px-6 py-2 bg-gray-200 text-gray-700 border border-gray-400 rounded-md hover:bg-gray-300 transition"
          >
            Edit
          </button>
        )}
      </div>

      <section className="mb-10 w-full">
        <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
        <div className="space-y-4">
          <div>
            <span className="block text-gray-600 text-sm">Business Name</span>
            {isEditing ? (
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              />
            ) : (
              <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
                {providerData.businessName}
              </p>
            )}
          </div>

          <div>
            <span className="block text-gray-600 text-sm">Bio</span>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
                rows="3"
              />
            ) : (
              <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
                {providerData.bio || "No bio provided."}
              </p>
            )}
          </div>

          <div>
            <span className="block text-gray-600 text-sm">Category</span>
            {isEditing ? (
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black"
              />
            ) : (
              <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
                {providerData.category || "No category provided."}
              </p>
            )}
          </div>

          <div>
            <span className="block text-gray-600 text-sm">Contact Information</span>
            <ul className="mt-2 space-y-2">
              <li className="flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-white text-black">
                <FaEnvelope className="text-gray-500" /> {providerData.email}
              </li>
              <li className="flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-white text-black">
                <FaPhone className="text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="ml-2 p-1 border border-gray-300 rounded-md bg-white text-black"
                  />
                ) : (
                  providerData.phone
                )}
              </li>
              <li className="flex items-center gap-2 p-3 border border-gray-300 rounded-md bg-white text-black">
                <FaLink className="text-gray-500" />
                {isEditing ? (
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="ml-2 p-1 border border-gray-300 rounded-md bg-white text-black"
                  />
                ) : (
                  providerData.website
                )}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Stripe Connection Section */}
      <section className="mb-10 w-full">
        <h2 className="text-2xl font-semibold mb-4">Stripe Connection</h2>
        <div>
          {providerData.stripeConnected ? (
            <p className="w-full p-3 border border-gray-300 rounded-md bg-white text-black">
              Stripe Connected
            </p>
          ) : (
            <ConnectStripeButton 
              stripeAccountId={providerData.stripeAccountId} 
              userType="provider" 
            />
          )}
        </div>
      </section>

      {/* Plans Section */}
      <section className="mb-10 w-full">
        <h2 className="text-2xl font-semibold mb-4">Plans</h2>
        <div className="flex flex-wrap gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="flex flex-col items-start">
              <PlanCard {...plan} />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className="px-4 py-2 border border-gray-500 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  {plan.subscribers ? plan.subscribers.length : 0} Subscribers
                </button>
                <Link
                  to={`/config-plan/${plan.id}`}
                  className="px-4 py-2 border border-gray-500 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 max-h-[80vh]">
            <h2 className="text-xl font-bold mb-4">{selectedPlan.title} Subscribers</h2>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {(selectedPlan.subscribers || []).map((sub, idx) => (
                <div key={idx} className="px-3 py-2 bg-gray-100 rounded-md shadow-sm text-sm font-medium">
                  {sub}
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedPlan(null)}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;
