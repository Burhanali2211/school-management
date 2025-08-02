"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Simulate logout process
    const handleLogout = async () => {
      try {
        // Clear any stored authentication data
        localStorage.removeItem("authToken");
        sessionStorage.clear();
        
        // Clear any cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (error) {
        console.error("Logout error:", error);
        // Still redirect even if there's an error
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center max-w-md p-8">
        <div className="mb-8">
          <Image src="/logo.png" alt="SchooLama" width={64} height={64} className="mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Logging Out</h1>
        <div className="mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <p className="text-gray-600 mb-6">
          You are being logged out successfully. Please wait...
        </p>
        <p className="text-sm text-gray-500">
          You will be redirected to the home page shortly.
        </p>
      </div>
    </div>
  );
};

export default LogoutPage; 