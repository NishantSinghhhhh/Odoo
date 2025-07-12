// hooks/useAllQuestionsWithAnswers.ts

import { useState, useEffect } from 'react'

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

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

const useAllQuestionsWithAnswers = () => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_BASE_URL = 'http://localhost:5000/api'

  const fetchAllData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 1. Fetch all answers
      const answersRes = await fetch(`${API_BASE_URL}/answers`)
      const answersJson: ApiResponse<Answer[]> = await answersRes.json()
      const allAnswers = answersJson.data || []

      // 2. Fetch all questions
      const questionsRes = await fetch(`${API_BASE_URL}/questions`)
      const questionsJson: ApiResponse<any> = await questionsRes.json()

      let allQuestions: Question[] = []
      if (Array.isArray(questionsJson.data)) {
        allQuestions = questionsJson.data
      } else if (questionsJson.data?.data) {
        allQuestions = questionsJson.data.data
      }

      // 3. Attach answers to questions
      const combined = allQuestions.map((q) => ({
        ...q,
        answers: allAnswers.filter((a) => a.question === q._id)
      }))

      setQuestions(combined)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return { questions, isLoading, error, refetch: fetchAllData }
}

export default useAllQuestionsWithAnswers
