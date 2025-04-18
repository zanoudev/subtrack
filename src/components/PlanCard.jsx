import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";

const PlanCard = ({ id, title, providerId, price, currency, billingCycle, isSubscribed=false }) => {
  const [providerName, setProviderName] = useState("");

  // fallback rendering if essential props are missing
  if (!title || !providerId || !price) {
    console.warn("Incomplete plan data:", { id, title, providerId, price });
    return null;
  }

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
    <div className="bg-primary text-white p-6 shadow-xl rounded-2xl w-80 h-64 flex flex-col justify-between transform transition-transform hover:scale-[1.03] hover:shadow-2xl">
      {/* provider name */}
      <p className="text-xs uppercase tracking-widest text-white/60">{providerName}</p>

      {/* plan title */}
      <h3 className="text-2xl font-extrabold mt-1">{title}</h3>

      {/* billing cycle */}
      <p className="text-sm text-white/80 mt-1">{billingCycle}</p>

      {/* price */}
      <p className="mt-4 text-4xl font-black">
        <span className="text-xl align-top font-medium mr-1">{currency}</span>
        {price}
      </p>

      {/* subscribe button */}
      {!isSubscribed && (
              <Link
              to={`/checkout/${providerId}-${String(title).replaceAll(" ", "-")}`}
              state={{ plan: { id, title, providerId, price, currency, billingCycle } }}
            >
              <button className="mt-4 w-full py-2 bg-white text-primary font-semibold rounded-lg hover:bg-lightgray hover:text-primary-dark transition">
                Subscribe
              </button>
            </Link>
      )}

    </div>
  );
};

export default PlanCard;
