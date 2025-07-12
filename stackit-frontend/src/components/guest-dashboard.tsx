import React, { useState, useEffect } from "react"
import { useAuth } from "../context/auth-context"
import useQuestionsWithAnswers from "../hooks/useQuestionsWithAnswers"
import { 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Calendar,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  User
} from "lucide-react"

const GuestDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  // Use the custom hook
  const {
    questions,
    isLoading,
    error,
    totalPages,
    totalQuestions,
    currentPage,
    fetchQuestions
  } = useQuestionsWithAnswers()

  // Debug: Log questions when they change
  useEffect(() => {
    console.log("🔍 Questions updated:", questions)
    console.log("📊 Questions length:", questions.length)
    questions.forEach((q, index) => {
      console.log(`   Question ${index + 1}: "${q.title}" - Answers: ${q.answers?.length || 0}`)
      if (q.answers && q.answers.length > 0) {
        q.answers.forEach((answer, aIndex) => {
          console.log(`      Answer ${aIndex + 1}: by ${answer.author.username}`)
        })
      }
    })
  }, [questions])

  // Handle search and filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const tagsString = selectedTags.join(',')
      console.log("🔍 Triggering search with:", { searchQuery, sortBy, tags: tagsString })
      fetchQuestions(1, searchQuery, sortBy, tagsString)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, sortBy, selectedTags])

  // Toggle question expansion to show/hide answers
  const toggleQuestionExpansion = (questionId: string) => {
    console.log("🖱️ Question clicked:", questionId)
    
    const newExpanded = new Set(expandedQuestions)
    const wasExpanded = newExpanded.has(questionId)
    
    if (wasExpanded) {
      newExpanded.delete(questionId)
      console.log(`🔼 Collapsing question: ${questionId}`)
    } else {
      newExpanded.add(questionId)
      console.log(`🔽 Expanding question: ${questionId}`)
      
      // Find and log the question details
      const question = questions.find(q => q._id === questionId)
      if (question) {
        console.log(`📋 Question found: "${question.title}"`)
        console.log(`💬 Answers array:`, question.answers)
        console.log(`📊 Answer count: ${question.answers?.length || 0}`)
        
        if (question.answers && question.answers.length > 0) {
          question.answers.forEach((answer, index) => {
            console.log(`   Answer ${index + 1}:`, {
              id: answer._id,
              author: answer.author.username,
              votes: answer.votes,
              isAccepted: answer.isAccepted,
              preview: answer.content.substring(0, 50) + "..."
            })
          })
        } else {
          console.log("❌ No answers found for this question")
        }
      } else {
        console.log("❌ Question not found in questions array")
      }
    }
    
    setExpandedQuestions(newExpanded)
    console.log("📱 Updated expandedQuestions:", Array.from(newExpanded))
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const tagsString = selectedTags.join(',')
    fetchQuestions(1, searchQuery, sortBy, tagsString)
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    const tagsString = selectedTags.join(',')
    fetchQuestions(page, searchQuery, sortBy, tagsString)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
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
                Guest Access
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
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
          <p className="text-sm text-yellow-700">
            Questions loaded: {questions.length} | 
            Expanded: {expandedQuestions.size} | 
            Loading: {isLoading ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-yellow-700">
            Questions with answers: {questions.filter(q => q.answers && q.answers.length > 0).length}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Browse Questions</h2>
          <p className="text-gray-600 mt-1">
            Explore {totalQuestions.toLocaleString()} questions from the community
          </p>
        </div>

        {/* Guest Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg mb-8">
          <div className="px-6 py-5 sm:flex sm:items-start sm:justify-between">
            <div className="sm:flex sm:items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <h3 className="text-sm font-medium text-amber-800">Guest Access</h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p>You're browsing as a guest. To ask questions and provide answers, please register for an account.</p>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6">
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Register Account
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="votes">Most Votes</option>
                  <option value="views">Most Views</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-3" />
              <span className="text-gray-600">Loading questions and answers...</span>
            </div>
          </div>
        )}

        {/* Questions List */}
        {!isLoading && questions.length > 0 && (
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Questions {currentPage > 1 && `(Page ${currentPage} of ${totalPages})`}
                </h3>
                <span className="text-sm text-gray-500">
                  {totalQuestions.toLocaleString()} total questions
                </span>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {questions.map((question) => {
                const isExpanded = expandedQuestions.has(question._id)
                const answerCount = question.answers?.length || 0
                
                return (
                  <div key={question._id} className="px-6 py-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center mb-2">
                          <HelpCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <h4 
                            className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => {
                              console.log("📱 Title clicked for question:", question._id)
                              toggleQuestionExpansion(question._id)
                            }}
                          >
                            {question.title}
                          </h4>
                          {/* Debug badge */}
                          <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded">
                            {answerCount} answers
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {stripHtml(question.description).substring(0, 200)}
                          {stripHtml(question.description).length > 200 && '...'}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {question.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                              onClick={() => {
                                if (!selectedTags.includes(tag)) {
                                  setSelectedTags([...selectedTags, tag])
                                }
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Question Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center">
                              <ThumbsUp className="mr-1 h-3 w-3" />
                              {question.votes} votes
                            </span>
                            <span className="inline-flex items-center">
                              <MessageSquare className="mr-1 h-3 w-3" />
                              {answerCount} answers
                              {question.acceptedAnswer && (
                                <CheckCircle className="ml-1 h-3 w-3 text-green-500" />
                              )}
                            </span>
                            <span className="inline-flex items-center">
                              <Eye className="mr-1 h-3 w-3" />
                              {question.views} views
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(question.createdAt)}
                            </span>
                            <span className="text-gray-600">
                              by {question.author.username}
                            </span>
                          </div>
                        </div>

                        {/* Always show expand button for testing */}
                        <button
                          onClick={() => {
                            console.log("🖱️ Expand button clicked for question:", question._id)
                            toggleQuestionExpansion(question._id)
                          }}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors mb-4"
                        >
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {isExpanded ? 'Hide' : 'Show'} details ({answerCount} answers)
                          {isExpanded ? (
                            <ChevronUp className="ml-1 h-3 w-3" />
                          ) : (
                            <ChevronDown className="ml-1 h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button 
                          onClick={() => {
                            console.log("🖱️ Arrow button clicked for question:", question._id)
                            toggleQuestionExpansion(question._id)
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ArrowRight className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Answers Section - Always show when expanded, even if no answers */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Answers ({answerCount})
                        </h5>
                        
                        {answerCount > 0 ? (
                          <div className="space-y-4">
                            {question.answers
                              .sort((a, b) => {
                                if (a.isAccepted && !b.isAccepted) return -1
                                if (!a.isAccepted && b.isAccepted) return 1
                                if (a.votes !== b.votes) return b.votes - a.votes
                                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                              })
                              .map((answer, index) => (
                                <div 
                                  key={answer._id} 
                                  className={`p-4 rounded-lg border transition-all ${
                                    answer.isAccepted 
                                      ? 'bg-green-50 border-green-200 shadow-sm' 
                                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      {answer.isAccepted && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      )}
                                      <span className={`text-xs font-medium ${
                                        answer.isAccepted ? 'text-green-700' : 'text-gray-500'
                                      }`}>
                                        {answer.isAccepted ? 'Accepted Answer' : `Answer ${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span className="inline-flex items-center">
                                        <ThumbsUp className="mr-1 h-3 w-3" />
                                        {answer.votes}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-sm text-gray-700 mb-3 leading-relaxed">
                                    {stripHtml(answer.content).substring(0, 500)}
                                    {stripHtml(answer.content).length > 500 && (
                                      <span className="text-blue-600 cursor-pointer hover:underline ml-1">
                                        Read more...
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-3 w-3" />
                                      <span className="font-medium">{answer.author.username}</span>
                                      {answer.author.reputation && (
                                        <span className="text-gray-400">
                                          ({answer.author.reputation} rep)
                                        </span>
                                      )}
                                    </div>
                                    <span>{formatDate(answer.createdAt)}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No answers yet. Be the first to answer!</p>
                            <p className="text-xs mt-1 text-gray-400">
                              Debug: This question has {answerCount} answers in the data
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNumber = Math.max(1, currentPage - 2) + i
                      if (pageNumber <= totalPages) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              pageNumber === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      }
                      return null
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && questions.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedTags.length > 0
                ? "Try adjusting your search terms or filters."
                : "Be the first to ask a question in this community!"}
            </p>
            {searchQuery || selectedTags.length > 0 ? (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedTags([])
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Account to Ask Questions
              </button>
            )}
          </div>
        )}

        {/* Selected Tags Filter Display */}
        {selectedTags.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtering by:</span>
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setSelectedTags([])}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GuestDashboard