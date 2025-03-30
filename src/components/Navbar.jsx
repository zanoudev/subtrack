import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import SearchBar from "./SearchBar";
import logo from "../assets/logo.png";

const Navbar = ({ onSearch }) => {
  const [user, setUser] = useState(null);
  const [profilePath, setProfilePath] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const uid = currentUser.uid;
        const clientDocRef = doc(db, "clients", uid);
        const providerDocRef = doc(db, "providers", uid);

        const [clientSnap, providerSnap] = await Promise.all([
          getDoc(clientDocRef),
          getDoc(providerDocRef),
        ]);

        if (clientSnap.exists()) {
          setProfilePath("/client-profile");
          const clientData = clientSnap.data();
          // Assuming your client document has "firstName" and "lastName" fields
          setUserName(`${clientData.firstName} ${clientData.lastName}`);
        } else if (providerSnap.exists()) {
          setProfilePath("/provider-profile");
          const providerData = providerSnap.data();
          // Assuming your provider document has a "businessName" field
          setUserName(providerData.businessName);
        } else {
          setProfilePath("/profile");
          setUserName("User");
        }
      } else {
        setProfilePath("/profile");
        setUserName("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => navigate("/"))
      .catch((error) => console.error("Logout error:", error));
  };

  return (
    <nav className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between fixed top-0 left-0 z-50">

      {/* Project Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="SubTrack Logo" className="w-16 h-16" />
        <span className="text-2xl font-bold text-black font-poppins">
          Sub<span className="font-normal">Track</span>
        </span>
      </Link>

      {/* Search bar tool */}
      <div className="hidden md:flex w-1/3">
        <SearchBar onSearch={onSearch} />
      </div>

      <div className="flex items-center gap-6">

        {/* Hello Username */}
        <span className="text-lg text-black">Hello, {userName}</span>

        {/* Home button */}
        <Link
          to="/Home"
          className="text-lg font-bold text-black hover:text-gray-500 transition"
        >
          Home
        </Link>

        {/* Dashboard (only rendre if user is NOT a client) */}
        {profilePath !== "/client-profile" && (
          <Link
            to="/dashboard"
            className="text-lg font-bold text-black hover:text-gray-500 transition"
          >
            Dashboard
          </Link>
        )}

        {/* Profile */}
        <Link
          to={profilePath}
          className="text-lg font-bold text-black hover:text-gray-500 transition"
        >
          Profile
        </Link>

        {/* Logout button */}
        {user && (
          <button
            onClick={handleLogout}
            className="text-lg font-bold text-red-500 hover:text-red-700 transition"
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
