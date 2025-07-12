"use client"

import React, { useRef } from "react"
import RichTextEditor from "./TextEditor"
import type { RichTextEditorRef } from "./TextEditor"

interface AnswerFormProps {
  questionId: string
  onClose: () => void
}

const AnswerForm: React.FC<AnswerFormProps> = ({ questionId, onClose }) => {
  const editorRef = useRef<RichTextEditorRef>(null)

  const handleSubmit = async () => {
    const content = editorRef.current?.getHTML()
  
    if (!content || content.trim() === "" || content === "<br>") {
      alert("Answer content cannot be empty.")
      return
    }
  
    try {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('accessToken')
  
      const author = localStorage.getItem('userId') || "64b1234567890abcdef12345" // Replace with real userId or mock
  
      if (!author) {
        alert("Author ID not found. Please log in again.")
        return
      }
  
      const res = await fetch("http://localhost:5000/api/answers/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content,
          question: questionId,
          author
        })
      })
  
      const result = await res.json()
  
      if (!res.ok) {
        throw new Error(result.error || "Failed to submit answer")
      }
  
      alert("✅ Test answer submitted successfully!")
      onClose()
    } catch (error: any) {
      console.error("Answer submission failed:", error)
      alert(error.message || "Something went wrong")
    }
  }
  

  return (
    <div className="mt-4">
      <RichTextEditor ref={editorRef} placeholder="Write your answer here..." minHeight="150px" />
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Submit Answer
        </button>
      </div>
    </div>
  )
}

export default AnswerForm
