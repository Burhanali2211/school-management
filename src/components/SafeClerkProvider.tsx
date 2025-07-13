"use client";

import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

// Simple provider that just renders children since we're using custom authentication
const AuthProvider = ({ children }: AuthProviderProps) => {
  return <>{children}</>;
};

export default AuthProvider;
