import { db } from "@/config/firebase.config";
import LoaderPage from "@/routes/loader-page";
import { User } from "@/types";
import { useAuth, useUser } from "@clerk/clerk-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const AuthHandler = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = useLocation().pathname;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) {
      setLoading(false);
      return;
    }

    const storeUserData = async () => {
      try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const userData: User = {
            id: user.id,
            name: user.fullName || user.firstName || "Anonymous",
            email: user.primaryEmailAddress?.emailAddress || "",
            imageUrl: user.imageUrl,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          console.log("📦 Storing user to Firestore:", userData);

          await setDoc(userRef, userData);

          console.log("✅ User stored successfully");
        } else {
          console.log("ℹ️ User already exists in Firestore");
        }
      } catch (error) {
        console.error("❌ Error storing user data in Firestore:", error, JSON.stringify(user));
      } finally {
        setLoading(false);
      }
    };

    storeUserData();
  }, [isSignedIn, user, pathname]);

  if (loading) {
    return <LoaderPage />;
  }

  return null;
};

export default AuthHandler;
