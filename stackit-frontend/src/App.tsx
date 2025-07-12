// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/theme-context'
import { AuthProvider, useAuth } from './context/auth-context'
import LoginPage from './components/LoginPage'
import {AdminDashboard,GuestDashboard, Dashboard} from './pages/Dashboard'

import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Loading StackIt...</p>
    </div>
  </div>
)

// Route Guard Component
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

// Role-based Dashboard Redirect
const DashboardRedirect: React.FC = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />
    case 'user':
      return <Navigate to="/dashboard/user" replace />
    case 'guest':
      return <Navigate to="/dashboard/guest" replace />
    default:
      return <Navigate to="/dashboard/user" replace />
  }
}

// Main App Content Component
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <DashboardRedirect />
          ) : (
            <LoginPage />
          )
        } 
      />

      {/* Dashboard Redirect Route */}
      <Route 
        path="/dashboard" 
        element={
          <RouteGuard>
            <DashboardRedirect />
          </RouteGuard>
        } 
      />

      {/* Protected Routes for Different User Roles */}
      <Route 
        path="/dashboard/user" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard/guest" 
        element={
          <ProtectedRoute allowedRoles={['guest', 'user', 'admin']}>
            <GuestDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Main App Component with Providers
function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </div>
  )
}

export default App