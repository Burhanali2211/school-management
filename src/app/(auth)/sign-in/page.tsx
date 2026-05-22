"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserType } from "@prisma/client";
import { 
  Eye, 
  EyeOff, 
  User, 
  GraduationCap, 
  Users as UserGroup, 
  Shield,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Building,
  BookOpen,
  Users,
  BarChart,
  Clock,
  Smartphone,
  Monitor,
  Globe,
  Shield as SecurityIcon,
  Settings,
  Info,
  BookOpen as BookOpenIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as ExclamationCircleIcon,
  Lock as LockClosedIcon,
  User as UserIcon,
  Eye as EyeIcon,
  EyeOff as EyeSlashIcon,
  Smartphone as DevicePhoneMobileIcon,
  Monitor as ComputerDesktopIcon,
  Clock as ClockIcon,
  Info as InformationCircleIcon
} from 'lucide-react';

interface UserTypeOption {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

const userTypes: UserTypeOption[] = [
  {
    type: 'ADMIN',
    label: 'Administrator',
    icon: Shield,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:border-indigo-300 group-hover:bg-indigo-100',
  },
  {
    type: 'TEACHER',
    label: 'Teacher',
    icon: GraduationCap,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:border-emerald-300 group-hover:bg-emerald-100',
  },
  {
    type: 'STUDENT',
    label: 'Student',
    icon: User,
    color: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:border-amber-300 group-hover:bg-amber-100',
  },
  {
    type: 'PARENT',
    label: 'Parent',
    icon: UserGroup,
    color: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:border-rose-300 group-hover:bg-rose-100',
  }
];

export default function SignInPage() {
  const router = useRouter();
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [lastLoginInfo, setLastLoginInfo] = useState<{
    time: string;
    device: string;
    location: string;
  } | null>(null);

  // Enhanced security features
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    device: string;
    browser: string;
    ip: string;
  } | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      setMounted(true);
      
      // Check if user is blocked
      const blockedUntil = localStorage.getItem('blockedUntil');
      if (blockedUntil && new Date().getTime() < parseInt(blockedUntil)) {
        setIsBlocked(true);
        const timeRemaining = Math.ceil((parseInt(blockedUntil) - new Date().getTime()) / 1000);
        setBlockTimeRemaining(timeRemaining);
        
        const timer = setInterval(() => {
          const remaining = Math.ceil((parseInt(blockedUntil) - new Date().getTime()) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setBlockTimeRemaining(0);
            localStorage.removeItem('blockedUntil');
            localStorage.removeItem('loginAttempts');
            clearInterval(timer);
          } else {
            setBlockTimeRemaining(remaining);
          }
        }, 1000);

        return () => clearInterval(timer);
      }

      // Get stored login attempts
      const attempts = localStorage.getItem('loginAttempts');
      if (attempts) {
        setLoginAttempts(parseInt(attempts));
      }

      // Get remembered user info
      const rememberedUser = localStorage.getItem('rememberedUser');
      if (rememberedUser) {
        try {
          const userData = JSON.parse(rememberedUser);
          setUsername(userData.username || '');
          setSelectedUserType(userData.userType || '');
          setRememberMe(true);
        } catch (error) {
          console.error('Error parsing remembered user:', error);
        }
      }

      // Detect device and browser info
      const userAgent = navigator.userAgent;
      const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'Mobile' : 'Desktop';
      const browser = userAgent.includes('Chrome') ? 'Chrome' : 
                     userAgent.includes('Firefox') ? 'Firefox' : 
                     userAgent.includes('Safari') ? 'Safari' : 'Unknown';
      
      setSessionInfo({ device, browser, ip: 'Detecting...' });
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Too many failed attempts. Please wait ${blockTimeRemaining} seconds.`);
      return;
    }

    if (!selectedUserType) {
      setError("Please select your user type first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          password, 
          userType: selectedUserType,
          deviceInfo: sessionInfo,
          rememberMe 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear login attempts on successful login
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('blockedUntil');
        setLoginAttempts(0);

        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedUser', JSON.stringify({
            username,
            userType: data.user.userType
          }));
        } else {
          localStorage.removeItem('rememberedUser');
        }

        // Store last login info
        const loginInfo = {
          time: new Date().toLocaleString(),
          device: sessionInfo?.device || 'Unknown',
          location: 'Global Campus'
        };
        setLastLoginInfo(loginInfo);
        localStorage.setItem('lastLoginInfo', JSON.stringify(loginInfo));

        // Redirect based on user type
        switch (data.user.userType) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "TEACHER":
            router.push("/teacher");
            break;
          case "STUDENT":
            router.push("/student");
            break;
          case "PARENT":
            router.push("/parent");
            break;
          default:
            router.push("/");
        }
      } else {
        // Handle failed login
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());

        if (newAttempts >= 5) {
          // Block for 5 minutes after 5 failed attempts
          const blockUntil = new Date().getTime() + (5 * 60 * 1000);
          localStorage.setItem('blockedUntil', blockUntil.toString());
          setIsBlocked(true);
          setBlockTimeRemaining(300);
          setError("Too many failed attempts. Account temporarily blocked for 5 minutes.");
        } else {
          setError(data.error || `Invalid credentials. ${5 - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [username, password, selectedUserType, isBlocked, blockTimeRemaining, loginAttempts, rememberMe, sessionInfo, router]);

  const handleUserTypeSelect = (type: string) => {
    setSelectedUserType(type);
    setError(""); // Clear any previous errors
    
    // Auto-fill demo credentials when user type is selected
    const demoCredentials = {
      'ADMIN': { username: 'admin1', password: 'admin123' },
      'TEACHER': { username: 'teacher1', password: 'teacher1123' },
      'STUDENT': { username: 'student1', password: 'student1123' },
      'PARENT': { username: 'parent1', password: 'parent1123' }
    };
    
    const credentials = demoCredentials[type as keyof typeof demoCredentials];
    if (credentials) {
      setUsername(credentials.username);
      setPassword(credentials.password);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Main Container */}
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center">
          
          {/* Header */}
          <div className="text-center mb-8 w-full">
            <div className="mx-auto w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center border border-primary-100 shadow-sm mb-4">
              <Building className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">ABC School</h1>
            <p className="text-neutral-600">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
                {/* User type selection */}
                {!selectedUserType && (
                  <div className="mb-8">
                    <h4 className="text-neutral-900 text-xl font-semibold mb-6 text-center">Choose your role</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.type}
                            onClick={() => handleUserTypeSelect(type.type)}
                            className={`group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-200 ${type.color} bg-white`}
                          >
                            <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="text-neutral-800 text-sm font-semibold">{type.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected user type indicator */}
                {selectedUserType && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm">
                      <div className="flex items-center space-x-4">
                        {(() => {
                          const selected = userTypes.find(t => t.type === selectedUserType);
                          if (!selected) return null;
                          const Icon = selected.icon;
                          return (
                            <>
                              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-100">
                                <Icon className="w-5 h-5 text-neutral-600" />
                              </div>
                              <div className="text-neutral-900 font-semibold text-base">{selected.label} Login</div>
                            </>
                          );
                        })()}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUserType('');
                          setUsername('');
                          setPassword('');
                          setError('');
                        }}
                        className="text-primary-700 hover:text-primary-800 text-sm font-medium bg-white px-3 py-1 rounded-lg border border-primary-200 hover:border-primary-300 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Login form */}
                {selectedUserType && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error message */}
                    {error && (
                      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Login attempts warning */}
                    {loginAttempts > 0 && loginAttempts < 5 && !isBlocked && (
                      <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                        <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{5 - loginAttempts} attempts remaining before temporary block</span>
                      </div>
                    )}

                    {/* Block warning */}
                    {isBlocked && (
                      <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                        <LockClosedIcon className="w-5 h-5 flex-shrink-0" />
                        <span>Account blocked for {formatTime(blockTimeRemaining)}</span>
                      </div>
                    )}

                    {/* Username field */}
                    <div className="space-y-2">
                      <label htmlFor="username" className="block text-sm font-semibold text-neutral-700">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                          placeholder="Enter your username"
                          required
                          disabled={isBlocked}
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-semibold text-neutral-700">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-primary-800 focus:bg-white focus:ring-2 focus:ring-primary-800/20 transition-all duration-200"
                          placeholder="Enter your password"
                          required
                          disabled={isBlocked}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember me and forgot password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-primary-800 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-800 focus:ring-2"
                          disabled={isBlocked}
                        />
                        <span className="text-sm text-neutral-600">Remember me</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary-800 hover:text-primary-900 transition-colors font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Sign in button */}
                    <button
                      type="submit"
                      disabled={isLoading || isBlocked}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>
                )}

                {/* Enhanced Demo credentials */}
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <div className="text-center">
                    <p className="text-neutral-600 text-sm font-medium mb-4">Quick Demo Access</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {userTypes.map((type) => (
                        <button
                          key={type.type}
                          onClick={() => handleUserTypeSelect(type.type)}
                          className="p-3 bg-neutral-50 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-all duration-200 border border-neutral-200 hover:border-neutral-300"
                        >
                          <div className="font-semibold">{type.label}</div>
                          <div className="opacity-70">Click to auto-fill</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                {sessionInfo && (
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <div className="text-center text-xs text-neutral-500 space-y-1">
                      <div className="flex items-center justify-center space-x-2">
                        {sessionInfo.device === 'Mobile' ? (
                          <DevicePhoneMobileIcon className="w-3 h-3" />
                        ) : (
                          <ComputerDesktopIcon className="w-3 h-3" />
                        )}
                        <span>{sessionInfo.device} • {sessionInfo.browser}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="text-center mt-8 space-y-2">
                <p className="text-neutral-500 text-sm">
                  © {new Date().getFullYear()} ABC School. All rights reserved.
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-neutral-400">
                  <button 
                    onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                    className="flex items-center space-x-1 hover:text-neutral-600 transition-colors"
                  >
                    <InformationCircleIcon className="w-3 h-3" />
                    <span>Security Info</span>
                  </button>
                  <span>•</span>
                  <span>Version 2.1.0</span>
                  <span>•</span>
                  <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

      {/* Security Info Modal */}
      {showSecurityInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <SecurityIcon className="w-5 h-5 text-primary-600 mr-2" />
              Security Information
            </h3>
            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>All data is encrypted using AES-256 encryption</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>HTTPS secure connection with SSL/TLS 1.3</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Rate limiting prevents brute force attacks</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Session management with automatic timeout</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Audit logging for all user activities</span>
              </div>
            </div>
            <button
              onClick={() => setShowSecurityInfo(false)}
              className="mt-6 w-full bg-primary-800 text-white py-2 px-4 rounded-lg hover:bg-primary-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
