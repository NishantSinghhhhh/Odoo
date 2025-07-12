// src/pages/AnswerPage.tsx

import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { CheckCircle, ThumbsUp, X } from "lucide-react"
import useQuestionsWithAnswers from "../hooks/useQuestionsWithAnswers"

const AnswerPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>()
  const navigate = useNavigate()

  const {
    questions,
    isLoading,
    error,
    refetch
  } = useQuestionsWithAnswers()

  const question = questions.find((q) => q._id === questionId)

  if (isLoading) return <div className="p-6 text-gray-700">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>
  if (!question) return <div className="p-6 text-gray-600">Question not found.</div>

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Question Section */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{question.title}</h2>
        <p className="text-gray-700 mb-4">{question.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Asked by <strong>{question.author.username}</strong> on{" "}
          {new Date(question.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Answers Section */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Answers</h3>
        {question.answers.length === 0 ? (
          <p className="text-gray-600">No answers yet.</p>
        ) : (
          question.answers.map((answer) => (
            <div
              key={answer._id}
              className={`p-4 mb-4 border rounded-md ${
                answer.isAccepted ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Answered by <strong>{answer.author.username}</strong>
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <ThumbsUp className="w-4 h-4 text-blue-600" />
                  {answer.votes} votes
                  {answer.isAccepted && (
                    <>
                      <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                      <span className="text-green-600">Accepted</span>
                    </>
                  )}
                </span>
              </div>
              <div className="text-gray-800 whitespace-pre-wrap">{answer.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AnswerPage
