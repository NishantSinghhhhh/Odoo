// hooks/useQuestionsWithAnswers.ts - FIXED VERSION WITH ANSWERS
import { useState, useEffect, useCallback } from 'react'

// Types (same as before)
interface Author {
  _id: string
  username: string
  email: string
  reputation?: number
  avatar?: string
}

interface Answer {
  _id: string
  content: string
  author: Author
  question: string
  votes: number
  isAccepted: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Question {
  _id: string
  title: string
  description: string
  tags: string[]
  author: Author
  votes: number
  answers: Answer[]
  acceptedAnswer?: string
  views: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface QuestionsData {
  data: Question[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface UseQuestionsWithAnswersReturn {
  questions: Question[]
  isLoading: boolean
  error: string | null
  totalPages: number
  totalQuestions: number
  currentPage: number
  fetchQuestions: (page?: number, search?: string, sort?: string, tags?: string) => Promise<void>
  refetch: () => Promise<void>
}

const useQuestionsWithAnswers = (): UseQuestionsWithAnswersReturn => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const API_BASE_URL = 'http://localhost:5000/api'
  const QUESTIONS_PER_PAGE = 10

  // Fetch answers for a specific question
  const fetchAnswersForQuestion = async (questionId: string): Promise<Answer[]> => {
    try {
      console.log(`🔍 Fetching answers for question: ${questionId}`)
      const response = await fetch(`${API_BASE_URL}/answers/question/${questionId}`)
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch answers for question ${questionId}: ${response.status}`)
        return []
      }
      
      const result: ApiResponse<Answer[]> = await response.json()
      console.log(`📝 Raw answer response for ${questionId}:`, result)
      
      if (result.success && result.data) {
        console.log(`✅ Found ${result.data.length} answers for question ${questionId}`)
        result.data.forEach((answer, index) => {
          console.log(`   Answer ${index + 1}:`, {
            id: answer._id,
            author: answer.author.username,
            votes: answer.votes,
            isAccepted: answer.isAccepted,
            contentPreview: answer.content.substring(0, 100) + '...'
          })
        })
        return result.data
      }
      
      console.log(`❌ No answers found for question ${questionId}`)
      return []
    } catch (error) {
      console.error(`💥 Error fetching answers for question ${questionId}:`, error)
      return []
    }
  }

  // Main fetch function - wrapped in useCallback to prevent infinite loops
  const fetchQuestions = useCallback(async (
    page = 1, 
    search = "", 
    sort = "newest", 
    tags = ""
  ): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: QUESTIONS_PER_PAGE.toString(),
        sort: sort
      })

      if (search) params.append('search', search)
      if (tags) params.append('tags', tags)

      console.log(`🚀 Fetching questions: ${API_BASE_URL}/questions?${params}`)

      // Fetch questions first
      const questionsResponse = await fetch(`${API_BASE_URL}/questions?${params}`)
      
      if (!questionsResponse.ok) {
        throw new Error(`HTTP error! status: ${questionsResponse.status}`)
      }
      
      const questionsResult: ApiResponse<QuestionsData> = await questionsResponse.json()
      console.log(`📊 Raw questions response:`, questionsResult)

      if (questionsResult.success && questionsResult.data) {
        const questionsData = questionsResult.data.data
        
        console.log(`📋 Fetched ${questionsData.length} questions:`)
        questionsData.forEach((question, index) => {
          console.log(`   Question ${index + 1}:`, {
            id: question._id,
            title: question.title,
            author: question.author.username,
            tags: question.tags,
            votes: question.votes,
            views: question.views
          })
        })
        
        // Fetch answers for each question
        console.log(`🔄 Now fetching answers for all questions...`)
        const questionsWithAnswers = await Promise.all(
          questionsData.map(async (question, index) => {
            console.log(`📥 Processing question ${index + 1}/${questionsData.length}: ${question.title}`)
            const answers = await fetchAnswersForQuestion(question._id)
            
            const questionWithAnswers = {
              ...question,
              answers: answers
            }
            
            console.log(`✅ Question "${question.title}" now has ${answers.length} answers`)
            return questionWithAnswers
          })
        )

        console.log(`🎉 Final result: ${questionsWithAnswers.length} questions with their answers:`)
        questionsWithAnswers.forEach((question, index) => {
          console.log(`   📋 Question ${index + 1}: "${question.title}" - ${question.answers.length} answers`)
          question.answers.forEach((answer, answerIndex) => {
            console.log(`      💬 Answer ${answerIndex + 1}: by ${answer.author.username} (${answer.votes} votes)${answer.isAccepted ? ' ✅ ACCEPTED' : ''}`)
          })
        })

        setQuestions(questionsWithAnswers)
        setTotalPages(questionsResult.data.totalPages)
        setTotalQuestions(questionsResult.data.total)
        setCurrentPage(questionsResult.data.page)
        
        console.log(`📊 Updated state:`, {
          totalQuestions: questionsResult.data.total,
          currentPage: questionsResult.data.page,
          totalPages: questionsResult.data.totalPages,
          questionsLoaded: questionsWithAnswers.length
        })
      } else {
        console.error(`❌ Failed to fetch questions:`, questionsResult.error)
        setError(questionsResult.error || 'Failed to fetch questions')
      }
    } catch (error) {
      console.error('💥 Error fetching questions:', error)
      setError('Unable to load questions. Please check your connection.')
    } finally {
      setIsLoading(false)
      console.log(`⏹️ Finished loading questions`)
    }
  }, [API_BASE_URL, QUESTIONS_PER_PAGE])

  // Refetch with current parameters
  const refetch = useCallback(async (): Promise<void> => {
    console.log(`🔄 Refetching questions...`)
    await fetchQuestions(currentPage)
  }, [fetchQuestions, currentPage])

  // Initial fetch - only runs once on mount
  useEffect(() => {
    console.log(`🎬 Hook mounted, starting initial fetch...`)
    fetchQuestions()
  }, []) // Empty dependency array - only run on mount

  return {
    questions,
    isLoading,
    error,
    totalPages,
    totalQuestions,
    currentPage,
    fetchQuestions,
    refetch
  }
}

export default useQuestionsWithAnswers