import React, { useState } from 'react'
import { CheckCircle, ThumbsUp } from 'lucide-react'
import useAllQuestionsWithAnswers from '../hooks/useQuestionsWithAnswers'
import toast from 'react-hot-toast'

const API_BASE_URL = 'http://localhost:5000/api'

const AllQuestionsWithAnswersPage: React.FC = () => {
  const { questions, isLoading, error, refetch } = useAllQuestionsWithAnswers()
  const [upvoting, setUpvoting] = useState<string | null>(null)

  const handleVote = async (answerId: string) => {
    try {
      setUpvoting(answerId)
      const res = await fetch(`${API_BASE_URL}/answers/${answerId}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote: 1 })
      })

      if (!res.ok) {
        throw new Error('Failed to vote')
      }

      toast.success('Answer upvoted!') // ✅ Toast added here

      await refetch()
    } catch (err) {
      console.error('Vote error:', err)
      toast.error('Something went wrong while voting.')
    } finally {
      setUpvoting(null)
    }
  }

  if (isLoading) {
    return null // ✅ Removed loading message
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-10 max-w-4xl mx-auto">
      {questions.map((q) => (
        <div key={q._id} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2 text-gray-900">{q.title}</h2>
          <div className="text-sm text-gray-600 mb-2">{q.description}</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {q.tags.map((tag) => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>Asked by {q.author.username}</span>
            <span>{q.votes} votes • {q.views} views</span>
          </div>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            {q.answers.length} {q.answers.length === 1 ? 'Answer' : 'Answers'}
          </h3>

          <div className="space-y-4">
            {q.answers
              .sort((a, b) => Number(b.isAccepted) - Number(a.isAccepted))
              .map((a) => (
                <div
                  key={a._id}
                  className={`border rounded-lg p-4 ${
                    a.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {a.isAccepted && (
                    <div className="flex items-center text-green-600 text-sm mb-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accepted Answer
                    </div>
                  )}
                  <p className="text-gray-800 mb-2">{a.content}</p>
                  <div className="flex justify-between text-sm text-gray-500 border-t pt-2">
                    <div>
                      By <span className="font-medium">{a.author.username}</span> on{' '}
                      {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={upvoting === a._id}
                        onClick={() => handleVote(a._id)}
                        className="hover:text-blue-600 disabled:opacity-50"
                        title="Upvote"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <span>{a.votes}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AllQuestionsWithAnswersPage
