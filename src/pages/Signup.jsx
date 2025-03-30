import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faFilm,
  faUtensils,
  faSpa,
  faPlaneUp,
  faBook,
  faHeartPulse,
  faLaptop,
  faShirt,
  faBasketball,
} from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaEyeSlash, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import logo from "../assets/logo.png";

// Import your new data-service functions:
import { signUpUser } from "../firebase/firebaseAuth";         // Auth logic
import { createClient } from "../firebase/firestoreClients";   // Firestore clients logic
import { createProvider } from "../firebase/firestoreProviders"; // Firestore providers logic

const BUSINESS_CATEGORIES = [
  { id: 1, name: "Fitness", icon: <FontAwesomeIcon icon={faDumbbell} /> },
  { id: 2, name: "Entertainment", icon: <FontAwesomeIcon icon={faFilm} /> },
  { id: 3, name: "Food & Dining", icon: <FontAwesomeIcon icon={faUtensils} /> },
  { id: 4, name: "Beauty & Spa", icon: <FontAwesomeIcon icon={faSpa} /> },
  { id: 5, name: "Travel", icon: <FontAwesomeIcon icon={faPlaneUp} /> },
  { id: 6, name: "Education", icon: <FontAwesomeIcon icon={faBook} /> },
  { id: 7, name: "Health & Wellness", icon: <FontAwesomeIcon icon={faHeartPulse} /> },
  { id: 8, name: "Technology", icon: <FontAwesomeIcon icon={faLaptop} /> },
  { id: 9, name: "Fashion", icon: <FontAwesomeIcon icon={faShirt} /> },
  { id: 10, name: "Sports", icon: <FontAwesomeIcon icon={faBasketball} /> },
];

const Signup = () => {
  const navigate = useNavigate();

  // Tracks which step we're on. Step 1 = email/password; Step 2 = extra details.
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1 STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("none-selected");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Show/hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation logic
  const passwordCriteria = {
    length: password.length >= 8,
    number: /\d/.test(password),
    specialChar: /[!?#]/.test(password),
  };
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // STEP 2 STATES
  // For clients:
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // For providers:
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");

  // ────────────────────────────
  // STEP 1 SUBMIT HANDLER
  // ────────────────────────────
  const handleStep1Submit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    if (!isPasswordValid) {
      newErrors.password = "Password does not meet requirements.";
    }
    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (accountType === "none-selected") {
      newErrors.accountType = "Please select an account type.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // If no errors, proceed to Step 2 (DO NOT sign up yet).
    setErrors({});
    setCurrentStep(2);
  };

  // ────────────────────────────
  // STEP 2 SUBMIT HANDLER
  // ────────────────────────────
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (accountType === "client") {
      if (!firstName.trim()) newErrors.firstName = "First Name is required.";
      if (!lastName.trim()) newErrors.lastName = "Last Name is required.";
    } else if (accountType === "provider") {
      if (!businessName.trim()) newErrors.businessName = "Business Name is required.";
      if (!businessCategory) {
        newErrors.businessCategory = "Please select your business category.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Finalize signup here
    try {
      setLoading(true);

      // 1) Create user in Firebase Auth
      const user = await signUpUser(email, password);
      const uid = user.uid;

      // 2) Based on account type, create doc in /clients OR /providers (banking info is no longer sent)
      if (accountType === "client") {
        await createClient(uid, {
          firstName,
          lastName,
          email,
          preferences: selectedCategories,
          subscriptions: [],
        });
      } else {
        await createProvider(uid, {
          businessName,
          category: businessCategory,
          email,
          bio: "",
          "business-plans": []
        });
      }

      // 3) Navigate to Home (or Dashboard, etc.)
      navigate("/home");
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────
  // Toggle categories on click
  // ────────────────────────────
  const handleCategoryToggle = (catName) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== catName));
    } else {
      setSelectedCategories((prev) => [...prev, catName]);
    }
  };

  return (
    <div className="w-screen flex items-center justify-center bg-gray-100">
      <div
        className={
          currentStep === 1
            ? "bg-white p-8 rounded-2xl shadow-lg w-96 text-center"
            : "bg-white p-8 rounded-2xl shadow-lg w-[42rem] text-center"
        }
      >
        <img src={logo} alt="SubTrack Logo" className="w-16 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-black mb-2">
          {currentStep === 1 ? "Create an Account" : "Additional Details"}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {currentStep === 1 ? "Join SubTrack today" : "Just a bit more info…"}
        </p>

        {errors.general && <p className="text-red-500 text-sm mb-2">{errors.general}</p>}

        {/* ───────────────────────── STEP 1 FORM ───────────────────────── */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:outline-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:outline-primary pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

            <div className="text-xs text-left space-y-1 mt-1">
              <p className={passwordCriteria.length ? "text-green-500" : "text-gray-500"}>
                {passwordCriteria.length ? (
                  <FaCheckCircle className="inline mr-1" />
                ) : (
                  <FaRegCircle className="inline mr-1" />
                )}
                At least 8 characters
              </p>
              <p className={passwordCriteria.number ? "text-green-500" : "text-gray-500"}>
                {passwordCriteria.number ? (
                  <FaCheckCircle className="inline mr-1" />
                ) : (
                  <FaRegCircle className="inline mr-1" />
                )}
                At least 1 number
              </p>
              <p className={passwordCriteria.specialChar ? "text-green-500" : "text-gray-500"}>
                {passwordCriteria.specialChar ? (
                  <FaCheckCircle className="inline mr-1" />
                ) : (
                  <FaRegCircle className="inline mr-1" />
                )}
                At least 1 special character (!?#)
              </p>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:outline-primary pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
            )}

            <select
              className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 text-black focus:outline-primary"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              <option value="none-selected" disabled>
                Select Account Type
              </option>
              <option value="client">Client</option>
              <option value="provider">Service Provider</option>
            </select>
            {errors.accountType && <p className="text-red-500 text-xs">{errors.accountType}</p>}

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-opacity-90 transition"
              disabled={loading}
            >
              {loading ? "Validating..." : "Continue"}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold">
                Log in
              </Link>
            </p>
          </form>
        )}

        {/* ───────────────────────── STEP 2 FORM ───────────────────────── */}
        {currentStep === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-4">
            {accountType === "client" && (
              <>
                <h3 className="text-lg font-semibold text-left">Client Information</h3>
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:outline-primary"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs">{errors.firstName}</p>
                )}

                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:outline-primary"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">{errors.lastName}</p>
                )}

                <h4 className="text-md font-semibold text-left mt-4">
                  Businesses You're Interested In:
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {BUSINESS_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.name);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleCategoryToggle(cat.name)}
                        className={`flex items-center px-3 py-2 rounded-md cursor-pointer
                          ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-white border border-gray-300 text-black"
                          }
                        `}
                      >
                        <div className="mr-2">{cat.icon}</div>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
                {errors.selectedCategories && (
                  <p className="text-red-500 text-xs">{errors.selectedCategories}</p>
                )}
              </>
            )}

            {accountType === "provider" && (
              <>
                <h3 className="text-lg font-semibold text-left">Provider Information</h3>
                <input
                  type="text"
                  placeholder="Business Name"
                  className="w-full p-3 border border-gray-300 rounded-md bg-white text-black focus:outline-primary"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                {errors.businessName && (
                  <p className="text-red-500 text-xs">{errors.businessName}</p>
                )}

                <select
                  className="w-full p-3 border border-gray-300 rounded-md bg-gray-200 text-black focus:outline-primary"
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                >
                  <option value="">Select Business Category</option>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.businessCategory && (
                  <p className="text-red-500 text-xs">{errors.businessCategory}</p>
                )}
              </>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                className="bg-gray-300 text-black py-3 px-6 rounded-md font-bold hover:bg-gray-400 transition"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>

              <button
                type="submit"
                className="bg-primary text-white py-3 px-6 rounded-md font-bold hover:bg-opacity-90 transition"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Finish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
