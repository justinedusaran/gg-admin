import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCMamClOkwHXPfWjdYa64R1AIAQbuuPw1k",
  databaseURL:
    "https://dp-gutterguard-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const initializeFirebase = () => {
  const app = initializeApp(firebaseConfig);
  return getDatabase(app);
};

export default initializeFirebase;
