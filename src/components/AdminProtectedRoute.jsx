import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

/**
 * AdminProtectedRoute
 * 
 * A gatekeeper component that ensures only users with 'isAdmin: true' in their
 * Firestore profile can access the wrapped routes.
 */
const AdminProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // If no user is logged in, we let the first check handle redirection
      if (!currentUser) {
        setVerifying(false);
        return;
      }

      try {
        // Fetch the user's document from the 'user_profiles' collection
        const userDocRef = doc(db, 'user_profiles', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error verifying admin credentials:", error);
        setIsAdmin(false);
      } finally {
        setVerifying(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // 1. Initial Auth Check: If not logged in and not verifying anymore
  if (!currentUser && !verifying) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Loading State: Show the 'Verifying Credentials' spinner
  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-white">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-rose-pink/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-rose-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-dark-plum font-jost font-medium tracking-wide animate-pulse">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  // 3. Authorization Check: If logged in but not an admin
  if (isAdmin === false) {
    // Show the simple alert as requested
    alert("Access Denied: Admin Privileges Required");
    return <Navigate to="/" replace />;
  }

  // 4. Success: Render the Admin content
  return children;
};

export default AdminProtectedRoute;
