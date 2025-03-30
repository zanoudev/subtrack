import { auth, db } from "./firebase/firebaseConfig";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    console.log("Firebase connected");
    console.log("Firebase Auth:", auth);
    console.log("Firebase Firestore:", db);
    if (!auth || !db) {
      console.error("⚠️ Firebase services are NOT initialized correctly!");
    } else {
      console.log("✅ Firebase is successfully initialized!");
    }
  }, []);

}

export default App;
