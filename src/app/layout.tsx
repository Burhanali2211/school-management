import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthProvider from "@/components/SafeClerkProvider";
import DevSetup from "@/components/DevSetup";
import StagewiseClient from "@/components/StagewiseClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lama Dev School Management Dashboard",
  description: "Next.js School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <body className={inter.className}>
          <DevSetup />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <ToastContainer
            position="bottom-right"
            theme="light"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            className="toast-container"
          />
          <StagewiseClient />
        </body>
      </html>
    </AuthProvider>
  );
}
