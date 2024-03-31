import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCMamClOkwHXPfWjdYa64R1AIAQbuuPw1k",
  authDomain: "dp-gutterguard.firebaseapp.com",
  databaseURL:
    "https://dp-gutterguard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dp-gutterguard",
  storageBucket: "dp-gutterguard.appspot.com",
  messagingSenderId: "122381802302",
  appId: "1:122381802302:web:17a80f74e4fb7aff55aa6f",
};

const initializeFirebase = () => {
  const app = initializeApp(firebaseConfig);
  return getDatabase(app);
};

export default initializeFirebase;
