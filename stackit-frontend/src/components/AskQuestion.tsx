"use client"

import type React from "react"
import { useState, useRef, type KeyboardEvent } from "react"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Smile,
  Link,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Quote,
  Code,
  Plus,
} from "lucide-react"

// Types defined in this file
interface CreateQuestionData {
  title: string
  description: string
  tags: string[]
}

interface FormErrors {
  title?: string
  description?: string
  tags?: string
}

interface AskQuestionPageProps {
  onSubmit?: (questionData: CreateQuestionData) => Promise<void>
  isModal?: boolean
}

const AskQuestionPage: React.FC<AskQuestionPageProps> = ({ onSubmit, isModal = false }) => {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)
  const [charCount, setCharCount] = useState<number>(0)
  const editorRef = useRef<HTMLDivElement>(null)

  // Rich text editor functions
  const formatText = (command: string, value: string | null = null): void => {
    document.execCommand(command, false, value || undefined)
    editorRef.current?.focus()
  }

  const insertEmoji = (emoji: string): void => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(emoji))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    editorRef.current?.focus()
    setShowEmojiPicker(false)
  }

  const insertLink = (): void => {
    const url = prompt("Enter URL:")
    if (url) {
      formatText("createLink", url)
    }
  }

  const insertImage = (): void => {
    const url = prompt("Enter image URL:")
    if (url) {
      formatText("insertImage", url)
    }
  }

  const insertCodeBlock = (): void => {
    formatText("formatBlock", "pre")
  }

  // Tag management
  const addTag = (e: KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>): void => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault()
      const trimmedTag = tagInput.trim().toLowerCase()
      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
        setTags([...tags, trimmedTag])
        setTagInput("")
        setErrors((prev) => ({ ...prev, tags: undefined }))
      }
    }
  }

  const removeTag = (tagToRemove: string): void => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.trim().length < 10) {
      newErrors.title = "Title must be at least 10 characters"
    } else if (title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters"
    }

    const textContent = editorRef.current?.textContent || ""
    if (!textContent.trim()) {
      newErrors.description = "Description is required"
    } else if (textContent.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    }

    if (tags.length === 0) {
      newErrors.tags = "At least one tag is required"
    } else if (tags.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const textContent = editorRef.current?.textContent || editorRef.current?.innerText || ""
      const questionData: CreateQuestionData = {
        title: title.trim(),
        description: textContent.trim(),
        tags,
      }

      console.log("📝 Submitting question data:", questionData)

      if (onSubmit) {
        await onSubmit(questionData)
      } else {
        console.log("⚠️ No onSubmit handler provided")
        await new Promise((resolve) => setTimeout(resolve, 1000))
        alert("Question submitted successfully!")
      }

      // Reset form on success
      setTitle("")
      setDescription("")
      setTags([])
      setCharCount(0)
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }
    } catch (error) {
      console.error("❌ Error submitting question:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    const textContent = e.currentTarget.textContent || ""
    setDescription(textContent)
    setCharCount(textContent.length)
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }))
    }
  }

  const commonEmojis: string[] = ["😀", "😊", "😎", "🤔", "👍", "👎", "❤️", "🚀", "💡", "🔥", "✨", "🎯"]

  const isFormValid = title.trim() && description.trim() && tags.length > 0

  const suggestedTags = [
    "javascript",
    "react",
    "nodejs",
    "typescript",
    "python",
    "css",
    "html",
    "api",
    "database",
    "mongodb",
    "sql",
    "git",
    "docker",
    "aws",
    "testing",
  ]

  const containerClass = isModal ? "bg-white max-h-[90vh] overflow-hidden flex flex-col" : "min-h-screen bg-gray-50"

  return (
    <div className={containerClass}>
      {/* Header */}
      {!isModal && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">StackIt</h1>
            </div>
          </div>
        </header>
      )}

      {/* Modal Header */}
      {isModal && (
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Ask a Question</h2>
          <p className="text-sm text-gray-600 mt-1">Get help from the community by asking a detailed question</p>
        </div>
      )}

      {/* Page Header for standalone */}
      {!isModal && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Ask a Question</h2>
            <p className="text-gray-600">Get help from the community by asking a detailed question</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isModal ? "flex-1 overflow-y-auto" : ""}`}>
        <div className={`${!isModal ? "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8" : "px-6"}`}>
          <div className={`${!isModal ? "bg-white rounded-lg border border-gray-200 shadow-sm" : ""}`}>
            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                  Question Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: undefined }))
                    }
                  }}
                  placeholder="Be specific and imagine you're asking a question to another person"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.title
                      ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  maxLength={200}
                  required
                />
                <div className="flex justify-between items-center">
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                  <p className="text-xs text-gray-500 ml-auto">{title.length}/200</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">Description *</label>

                {/* Rich Text Editor Toolbar */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-300 p-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {/* Text Formatting */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => formatText("bold")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Bold"
                        >
                          <Bold size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("italic")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Italic"
                        >
                          <Italic size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("strikeThrough")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Strikethrough"
                        >
                          <Strikethrough size={16} />
                        </button>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      {/* Lists */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => formatText("insertOrderedList")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Numbered List"
                        >
                          <ListOrdered size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("insertUnorderedList")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Bullet List"
                        >
                          <List size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("formatBlock", "blockquote")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Quote"
                        >
                          <Quote size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={insertCodeBlock}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Code Block"
                        >
                          <Code size={16} />
                        </button>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      {/* Media & Links */}
                      <div className="flex items-center">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                            title="Insert Emoji"
                          >
                            <Smile size={16} />
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10">
                              <div className="grid grid-cols-6 gap-1">
                                {commonEmojis.map((emoji, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => insertEmoji(emoji)}
                                    className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={insertLink}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Insert Link"
                        >
                          <Link size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={insertImage}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Insert Image"
                        >
                          <ImageIcon size={16} />
                        </button>
                      </div>

                      <div className="w-px h-6 bg-gray-300 mx-1"></div>

                      {/* Alignment */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => formatText("justifyLeft")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Align Left"
                        >
                          <AlignLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("justifyCenter")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Align Center"
                        >
                          <AlignCenter size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => formatText("justifyRight")}
                          className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900"
                          title="Align Right"
                        >
                          <AlignRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Editor Content Area */}
                  <div
                    ref={editorRef}
                    contentEditable
                    className={`w-full min-h-[200px] p-4 focus:outline-none text-gray-900 ${
                      errors.description ? "bg-red-50" : "bg-white"
                    }`}
                    style={{ lineHeight: "1.6" }}
                    onInput={handleDescriptionChange}
                    data-placeholder="Include all the information someone would need to answer your question. Use code blocks for code snippets."
                  />
                </div>

                <div className="flex justify-between items-center">
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  <p className="text-xs text-gray-500 ml-auto">{charCount} characters</p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">Tags *</label>

                {/* Tag Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={addTag}
                    placeholder="Add tags (e.g., React, JavaScript, JWT)"
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.tags
                        ? "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    disabled={tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.includes(tagInput.trim().toLowerCase()) || tags.length >= 5}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>

                {/* Suggested Tags */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags
                      .filter((tag) => !tags.includes(tag))
                      .slice(0, 8)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (tags.length < 5) {
                              setTags([...tags, tag])
                            }
                          }}
                          disabled={tags.length >= 5}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-full transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-600">Add up to 5 tags to describe what your question is about</p>
                  <span className="text-gray-500 font-medium">{tags.length}/5</span>
                </div>

                {errors.tags && <p className="text-sm text-red-600">{errors.tags}</p>}
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Make sure your question is clear and provides enough context for others to help you.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Question"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AskQuestionPage
