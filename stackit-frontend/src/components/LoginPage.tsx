// src/components/LoginPage.tsx
import React, { useState, type FormEvent } from "react"
import { Eye, EyeOff, Mail, Lock, User, Home, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/theme-context"
import { useAuth } from "../context/auth-context"

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  password?: string
  username?: string
  confirmPassword?: string
  general?: string
}

const LoginPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { login, register, isLoading } = useAuth()
  
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  // Form states
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }

  const validateLoginForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!loginData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!loginData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!registerData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (registerData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (!registerData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!registerData.password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(registerData.password)) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setErrors({})

    try {
      if (isLoginMode) {
        if (!validateLoginForm()) return

        console.log('🔐 Attempting login...')
        const response = await login(loginData)
        
        console.log('🔐 Login response received:', response)
        
        if (!response.success) {
          console.log('❌ Login failed:', response.error)
          setErrors({ general: response.error || 'Login failed' })
        } else {
          console.log('✅ Login successful, auth context should update automatically')
          // The auth context will handle state updates and navigation
          // Clear the form
          setLoginData({ email: '', password: '' })
        }

      } else {
        if (!validateRegisterForm()) return

        console.log('📝 Attempting registration...')
        const response = await register({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
        
        console.log('📝 Registration response received:', response)
        
        if (!response.success) {
          console.log('❌ Registration failed:', response.error)
          setErrors({ general: response.error || 'Registration failed' })
        } else {
          console.log('✅ Registration successful, auth context should update automatically')
          // The auth context will handle state updates and navigation
          // Clear the form
          setRegisterData({ username: '', email: '', password: '', confirmPassword: '' })
        }
      }
    } catch (error: any) {
      console.error("🚨 Unexpected auth error:", error)
      setErrors({ general: "Something went wrong. Please try again." })
    }
  }

  const switchMode = (): void => {
    setIsLoginMode(!isLoginMode)
    setErrors({})
    setLoginData({ email: "", password: "" })
    setRegisterData({ username: "", email: "", password: "", confirmPassword: "" })
  }

  // Quick fill demo accounts
  const fillDemoAccount = (userType: 'user' | 'admin') => {
    if (userType === 'user') {
      setLoginData({ email: 'user@demo.com', password: 'password123' })
    } else {
      setLoginData({ email: 'admin@demo.com', password: 'password123' })
    }
    setIsLoginMode(true)
    setErrors({})
  }

  // Generate unique demo account for testing
  const createTestAccount = () => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@demo.com`;
    const testUsername = `testuser${timestamp}`;
    
    setRegisterData({
      username: testUsername,
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123'
    })
    setIsLoginMode(false)
    setErrors({})
  }

  const isDarkMode = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-gray-900'}`}>
                StackIt
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                <a
                  href="/"
                  className={`flex items-center space-x-2 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-300 hover:text-orange-400' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home size={18} />
                  <span className="font-medium">Home</span>
                </a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className={`rounded-lg shadow-sm border p-8 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {isLoginMode ? "Sign in to StackIt" : "Create your account"}
              </h2>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {isLoginMode ? "Welcome back! Please sign in to continue" : "Join our community of developers"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <div className={`border px-4 py-3 rounded-md text-sm ${
                  isDarkMode
                    ? 'bg-red-900/20 border-red-700 text-red-400'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="font-medium">Error:</p>
                      <p>{errors.general}</p>
                      
                      {/* Helpful suggestions based on error */}
                      {errors.general.includes('already exists') && (
                        <div className="mt-2 text-xs opacity-75">
                          💡 Try logging in instead, or use the "Generate Unique Test Account" button below.
                        </div>
                      )}
                      {errors.general.includes('connect to server') && (
                        <div className="mt-2 text-xs opacity-75">
                          💡 Make sure your backend server is running on port 5000.
                        </div>
                      )}
                      {errors.general.includes('Invalid email or password') && (
                        <div className="mt-2 text-xs opacity-75">
                          💡 Check your credentials, or try the demo accounts below.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Username (Register only) */}
              {!isLoginMode && (
                <div>
                  <label htmlFor="username" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Username
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} size={18} />
                    <input
                      type="text"
                      id="username"
                      value={registerData.username}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, username: e.target.value }))
                        if (errors.username) {
                          setErrors((prev) => ({ ...prev, username: undefined }))
                        }
                      }}
                      placeholder="Enter your username"
                      className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                        errors.username 
                          ? (isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50')
                          : (isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                              : 'border-gray-300 hover:border-gray-400'
                            )
                      }`}
                      required={!isLoginMode}
                    />
                  </div>
                  {errors.username && (
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {errors.username}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} size={18} />
                  <input
                    type="email"
                    id="email"
                    value={isLoginMode ? loginData.email : registerData.email}
                    onChange={(e) => {
                      if (isLoginMode) {
                        setLoginData((prev) => ({ ...prev, email: e.target.value }))
                      } else {
                        setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: undefined }))
                      }
                    }}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                      errors.email 
                        ? (isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50')
                        : (isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                            : 'border-gray-300 hover:border-gray-400'
                          )
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={isLoginMode ? loginData.password : registerData.password}
                    onChange={(e) => {
                      if (isLoginMode) {
                        setLoginData((prev) => ({ ...prev, password: e.target.value }))
                      } else {
                        setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }))
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-12 py-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                      errors.password 
                        ? (isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50')
                        : (isDarkMode 
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                            : 'border-gray-300 hover:border-gray-400'
                          )
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      isDarkMode 
                        ? 'text-gray-500 hover:text-gray-300' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password (Register only) */}
              {!isLoginMode && (
                <div>
                  <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                        }
                      }}
                      placeholder="Confirm your password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 ${
                        errors.confirmPassword 
                          ? (isDarkMode ? 'border-red-600 bg-red-900/20' : 'border-red-300 bg-red-50')
                          : (isDarkMode 
                              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                              : 'border-gray-300 hover:border-gray-400'
                            )
                      }`}
                      required={!isLoginMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                        isDarkMode 
                          ? 'text-gray-500 hover:text-gray-300' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-all duration-200 flex items-center justify-center mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isLoginMode ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className={`font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-orange-400 hover:text-orange-300' 
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  {isLoginMode ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className={`mt-6 p-4 rounded-md border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Demo Accounts:
              </h4>
              
              {/* Existing Demo Accounts for Login */}
              <div className="space-y-2 mb-3">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('user')}
                  className={`w-full text-left text-xs p-2 rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-600 hover:text-gray-300' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <strong>Login as User:</strong> user@demo.com / password123
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin')}
                  className={`w-full text-left text-xs p-2 rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:bg-gray-600 hover:text-gray-300' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <strong>Login as Admin:</strong> admin@demo.com / password123
                </button>
              </div>

              {/* Generate Test Account for Registration */}
              <div className={`pt-3 border-t ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={createTestAccount}
                  className={`w-full text-center text-xs p-2 rounded transition-colors border ${
                    isDarkMode 
                      ? 'border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white' 
                      : 'border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  <strong>Generate Unique Test Account</strong>
                  <br />
                  <span className="text-xs opacity-75">For testing registration</span>
                </button>
              </div>
            </div>

            <p className={`mt-6 text-xs text-center ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              No credit card required
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage