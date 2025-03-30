# Subscription Web App with React, Tailwind, and Stripe

**Technologies Used:** React (JSX) + Vite, Tailwind CSS, Firebase, Stripe API  
**Author:** Zanou Rih
**Course Context:** Honours Project  
**Term:** Winter 2025

---

## Overview

This project is a full-stack subscription-based web application built with modern front-end technologies. It allows users to view, subscribe to, and manage digital content or services, integrating payment functionality via Stripe and user authentication and data storage via Firebase.

The frontend is built with React using the Vite bundler and styled with Tailwind CSS. The application is modular and performant, with asset optimization and clean routing logic.

---

## Features

- **User Authentication**  
  Firebase Authentication is used to handle secure user login and account management.

- **Stripe Payment Integration**  
  Stripe's API enables secure payment processing for subscription-based plans.

- **Responsive Design**  
  Tailwind CSS ensures responsiveness and a consistent user experience across devices.

- **Firebase Firestore**  
  Used as a real-time database to store user data, subscription information, and other relevant content.

- **Animated UI Elements**  
  Loading indicators and illustrations enhance the user experience during transitions and actions.

---

## Setup Documentation

These are the steps I followed to setup my project:

### 1. Install Dependencies

Ensure Node.js is installed. Then run:

```bash
npm install
```

### 2. Configure Firebase

Create a `firebaseConfig.js` file under `src/firebase/` with my project credentials (available in the Firebase Console):

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 3. Stripe Integration

Configure the Stripe keys using environment variables or a secure backend proxy. The frontend uses Stripe's public-facing functions to trigger checkout sessions.

### 4. Run the App

```bash
npm run dev
```

The app should now be available at `http://localhost:5173`.

---

## Future Improvements

- Add backend API endpoints for advanced Stripe session handling and webhook verification.
- Implement user dashboards for subscription status and billing history.
- Publish Mobile version on iOS and Android.
- Add support for additional payment methods and currencies.
- Improve accessibility and test coverage.

---

## License

This project is for academic and portfolio use. Stripe and Firebase are used under their respective licenses.

---

## Acknowledgements

- [Stripe API Docs](https://stripe.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
