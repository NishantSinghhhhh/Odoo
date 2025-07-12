"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../context/auth-context"
import { HelpCircle, MessageSquare, Award, PlusCircle, CheckCircle, ThumbsUp, X } from "lucide-react"
import AskQuestionPage from "./AskQuestion" // Import the component
// import APITestComponent from "./APITestComponent" // Uncomment to add debug panel

// Types for question creation
interface CreateQuestionData {
  title: string
  description: string
  tags: string[]
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle question submission
  const handleQuestionSubmit = async (questionData: CreateQuestionData): Promise<void> => {
    try {
      setIsSubmitting(true)
      
      console.log('🚀 Starting question submission:', questionData)
      
      // Try the test endpoint first (no authentication required)
      let response = await fetch('http://localhost:5000/api/questions/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      })

      // If test endpoint fails, try with authentication
      if (!response.ok && response.status === 404) {
        console.log('⚠️ Test endpoint not found, trying authenticated endpoint...')
        
        // Get auth token from localStorage or context
        const token = localStorage.getItem('token') || 
                     localStorage.getItem('authToken') || 
                     localStorage.getItem('accessToken')
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.')
        }
        
        response = await fetch('http://localhost:5000/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(questionData)
        })
      }

      const result = await response.json()
      console.log('📊 API Response:', result)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error(result.error || result.message || `HTTP error! status: ${response.status}`)
      }

      console.log('✅ Question created successfully:', result)
      
      // Close modal and show success message
      setShowQuestionModal(false)
      alert('Question submitted successfully!')
      
      // Optional: Refresh the page or update the dashboard stats
      // window.location.reload()
      
    } catch (error: any) {
      console.error('❌ Error creating question:', error)
      
      // Show more helpful error messages
      let errorMessage = 'Failed to create question. '
      
      if (error.message.includes('token') || error.message.includes('Authentication')) {
        errorMessage += 'Please try logging out and logging in again.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.'
      } else {
        errorMessage += error.message
      }
      
      alert(errorMessage)
      throw error // Re-throw so AskQuestionPage can handle it
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">StackIt</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Reputation: {user?.reputation}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Panel - Uncomment to use */}
        {/* <APITestComponent /> */}
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Your Dashboard</h2>
            <p className="text-gray-600 mt-1">Track your activity and contributions</p>
          </div>
          <button 
            onClick={() => setShowQuestionModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Ask Question
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Your Questions</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">12</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Your Answers</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">34</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-50 rounded-md p-3">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Reputation</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">{user?.reputation}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">Your question: "How to handle React state?"</h4>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      15 votes
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Asked 1 day ago • 3 answers</p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                      react
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      state-management
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-1">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      You answered: "JavaScript async/await patterns"
                    </h4>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <ThumbsUp className="mr-1 h-4 w-4" />8 votes
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Answered 2 days ago •
                    <span className="inline-flex items-center ml-1 text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" /> Accepted
                    </span>
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                      javascript
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      async
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm">
              <a href="#" className="font-medium text-gray-900 hover:text-gray-700">
                View all activity <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative">
            {/* Close button */}
            <button
              onClick={() => setShowQuestionModal(false)}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Ask Question Component */}
            <AskQuestionPage 
              onSubmit={handleQuestionSubmit}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard