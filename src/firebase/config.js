import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBOEukZ_xT_sRlqjy4ToHicL0DuQIImbo4",
  authDomain: "cajuorganize.firebaseapp.com",
  projectId: "cajuorganize",
  storageBucket: "cajuorganize.firebasestorage.app",
  messagingSenderId: "409547444312",
  appId: "1:409547444312:web:9c0e07685d38af06887a2d",
  measurementId: "G-RR9Y496D0B",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
