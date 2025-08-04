"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Verification code sent to your email!");
        setStep('verify');
        setResendCooldown(60); // 60 second cooldown
      } else {
        setError(data.error || "Failed to send verification code. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Code verified successfully!");
        // Store the reset token for the next step
        localStorage.setItem("resetToken", data.resetToken);
        setStep('reset');
      } else {
        setError(data.error || "Invalid verification code. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const resetToken = localStorage.getItem("resetToken");
      if (!resetToken) {
        setError("Invalid session. Please start over.");
        setStep('email');
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, resetToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password reset successfully!");
        localStorage.removeItem("resetToken");
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("New verification code sent!");
        setResendCooldown(60);
      } else {
        setError(data.error || "Failed to resend code. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const getStepTitle = () => {
    switch (step) {
      case 'email': return 'Reset Your Password';
      case 'verify': return 'Verify Your Email';
      case 'reset': return 'Set New Password';
      default: return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email': return 'Enter your email address and we\'ll send you a verification code';
      case 'verify': return 'Enter the 6-digit code sent to your email';
      case 'reset': return 'Create a new secure password for your account';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 border border-white/20 rounded-lg rotate-45 animate-float"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-4 h-16 bg-gradient-to-t from-blue-500/20 to-purple-500/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-40 w-12 h-12 border border-white/10 rounded-full animate-float-delayed"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 shadow-2xl">
              <Image
                src="/logo.png"
                alt="School Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            {getStepTitle()}
          </h1>
          <p className="text-slate-300 text-lg">
            {getStepDescription()}
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Email</span>
              <span>Verify</span>
              <span>Reset</span>
            </div>
            <div className="flex space-x-2">
              <div className={`flex-1 h-2 rounded-full ${step === 'email' ? 'bg-blue-500' : step === 'verify' || step === 'reset' ? 'bg-green-500' : 'bg-white/20'}`}></div>
              <div className={`flex-1 h-2 rounded-full ${step === 'verify' ? 'bg-blue-500' : step === 'reset' ? 'bg-green-500' : 'bg-white/20'}`}></div>
              <div className={`flex-1 h-2 rounded-full ${step === 'reset' ? 'bg-blue-500' : 'bg-white/20'}`}></div>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-200">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending Code...</span>
                  </div>
                ) : (
                  "Send Verification Code"
                )}
              </button>
            </form>
          )}

          {/* Verification step */}
          {step === 'verify' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium text-slate-200">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 text-center tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 text-center">
                  Code sent to {email}. For demo, use: <span className="text-blue-400 font-mono">123456</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Code"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {/* Password reset step */}
          {step === 'reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-200">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Password strength:</div>
                <div className="flex space-x-1">
                  <div className={`flex-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-white/20'}`}></div>
                  <div className={`flex-1 h-1 rounded-full ${newPassword.length >= 8 && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-white/20'}`}></div>
                  <div className={`flex-1 h-1 rounded-full ${newPassword.length >= 8 && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-white/20'}`}></div>
                  <div className={`flex-1 h-1 rounded-full ${newPassword.length >= 8 && /[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-white/20'}`}></div>
                </div>
                <div className="text-xs text-slate-400">
                  Password must be at least 8 characters long
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            © 2024 School Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}