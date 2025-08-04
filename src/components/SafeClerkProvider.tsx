"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

interface SafeClerkProviderProps {
  children: ReactNode;
}

// Wrapper that provides the AuthContext
const SafeClerkProvider = ({ children }: SafeClerkProviderProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default SafeClerkProvider;
