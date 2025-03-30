import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const PlanCard = ({ title, providerId, price, currency, billingCycle }) => {
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    const fetchProviderName = async () => {
      try {
        const providerRef = doc(db, "providers", providerId);
        const providerSnap = await getDoc(providerRef);
        if (providerSnap.exists()) {
          setProviderName(providerSnap.data().businessName);
        }
      } catch (error) {
        console.error("Error fetching provider name:", error);
      }
    };

    if (providerId) {
      fetchProviderName();
    }
  }, [providerId]);

  return (
    <div className="bg-primary text-white p-6 shadow-lg rounded-2xl flex flex-col justify-between w-80 h-60">
      <p className="text-xs uppercase tracking-wide opacity-75">{providerName}</p>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-xl opacity-80 mt-1 break-words">{billingCycle}</p>
      <p className="text-5xl mt-4">
        <span className="text-xl font-medium">{currency}</span>
        <span className="font-extrabold">{price}</span>
      </p>
    </div>
  );
};

export default PlanCard;
