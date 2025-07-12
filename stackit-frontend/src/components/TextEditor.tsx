"use client"

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react"
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
  Quote,
  Code,
} from "lucide-react"

interface RichTextEditorProps {
  value?: string
  onChange?: (content: string, textContent: string) => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
  error?: boolean
  disabled?: boolean
  className?: string
}

export interface RichTextEditorRef {
  clear: () => void
  focus: () => void
  getHTML: () => string
  getText: () => string
  setHTML: (html: string) => void
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "Start typing...",
      minHeight = "200px",
      maxHeight = "500px",
      error = false,
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

    // Initialize content
    useEffect(() => {
      if (editorRef.current && value !== undefined && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value
      }
    }, [value])

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      clear: () => {
        if (editorRef.current) {
          editorRef.current.innerHTML = ""
          handleContentChange()
        }
      },
      focus: () => {
        editorRef.current?.focus()
      },
      getHTML: () => {
        return editorRef.current?.innerHTML || ""
      },
      getText: () => {
        return editorRef.current?.textContent || ""
      },
      setHTML: (html: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = html
          handleContentChange()
        }
      },
    }))

    const handleContentChange = () => {
      if (onChange && editorRef.current) {
        const html = editorRef.current.innerHTML
        const text = editorRef.current.textContent || ""
        onChange(html, text)
      }
    }

    const formatText = (command: string, value: string | null = null): void => {
      if (disabled) return
      
      editorRef.current?.focus()
      
      if (command === "insertOrderedList" || command === "insertUnorderedList") {
        document.execCommand(command, false, undefined)
        
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const container = range.commonAncestorContainer
          const parentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement
          
          const isInList = parentElement?.closest('ul, ol')
          
          if (!isInList) {
            const listType = command === "insertOrderedList" ? "ol" : "ul"
            const list = document.createElement(listType)
            const listItem = document.createElement("li")
            
            const selectedText = range.toString()
            if (selectedText) {
              listItem.textContent = selectedText
              range.deleteContents()
            } else {
              listItem.innerHTML = "<br>"
            }
            
            list.appendChild(listItem)
            range.insertNode(list)
            
            const newRange = document.createRange()
            newRange.selectNodeContents(listItem)
            newRange.collapse(false)
            selection.removeAllRanges()
            selection.addRange(newRange)
          }
        }
      } else {
        document.execCommand(command, false, value || undefined)
      }
      
      editorRef.current?.focus()
      handleContentChange()
    }

    const insertEmoji = (emoji: string): void => {
      if (disabled) return
      
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
      handleContentChange()
    }

    const insertLink = (): void => {
      if (disabled) return
      
      const url = prompt("Enter URL:")
      if (url) {
        const selection = window.getSelection()
        const selectedText = selection?.toString() || url
        
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const link = document.createElement('a')
          link.href = url
          link.textContent = selectedText
          link.target = "_blank"
          link.rel = "noopener noreferrer"
          
          range.deleteContents()
          range.insertNode(link)
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
        } else {
          formatText("createLink", url)
        }
      }
      handleContentChange()
    }

    const insertImage = (): void => {
      if (disabled) return
      fileInputRef.current?.click()
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          return
        }

        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB')
          return
        }

        const reader = new FileReader()
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          
          editorRef.current?.focus()
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            const img = document.createElement('img')
            img.src = imageUrl
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            img.style.display = 'block'
            img.style.margin = '10px 0'
            
            range.insertNode(img)
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
          } else {
            const img = document.createElement('img')
            img.src = imageUrl
            img.style.maxWidth = '100%'
            img.style.height = 'auto'
            img.style.display = 'block'
            img.style.margin = '10px 0'
            editorRef.current?.appendChild(img)
          }
          
          handleContentChange()
        }
        
        reader.readAsDataURL(file)
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const insertCodeBlock = (): void => {
      if (disabled) return
      
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const pre = document.createElement('pre')
        const code = document.createElement('code')
        
        const selectedText = range.toString()
        code.textContent = selectedText || 'Enter code here'
        
        pre.style.backgroundColor = '#f5f5f5'
        pre.style.padding = '10px'
        pre.style.borderRadius = '4px'
        pre.style.margin = '10px 0'
        pre.style.overflowX = 'auto'
        code.style.fontFamily = 'monospace'
        
        pre.appendChild(code)
        range.deleteContents()
        range.insertNode(pre)
        
        const newRange = document.createRange()
        newRange.selectNodeContents(code)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
      
      editorRef.current?.focus()
      handleContentChange()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const container = range.commonAncestorContainer
          const parentElement = container.nodeType === 3 ? container.parentElement : container as HTMLElement
          
          const listItem = parentElement?.closest('li')
          if (listItem) {
            e.preventDefault()
            
            const newListItem = document.createElement('li')
            newListItem.innerHTML = '<br>'
            
            listItem.parentNode?.insertBefore(newListItem, listItem.nextSibling)
            
            const newRange = document.createRange()
            newRange.selectNodeContents(newListItem)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
            
            handleContentChange()
          }
        }
      }
    }

    const commonEmojis = ["😀", "😊", "😎", "🤔", "👍", "👎", "❤️", "🚀", "💡", "🔥", "✨", "🎯"]

    return (
      <div className={`rich-text-editor ${className}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        <div className={`border rounded-md overflow-hidden ${error ? 'border-red-300' : 'border-gray-300'} ${disabled ? 'opacity-50' : ''}`}>
          <div className="bg-gray-50 border-b border-gray-300 p-2">
            <div className="flex flex-wrap items-center gap-1">
              {/* Text Formatting */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => formatText("bold")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("italic")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("strikeThrough")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
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
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("insertUnorderedList")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("formatBlock", "blockquote")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Quote"
                >
                  <Quote size={16} />
                </button>
                <button
                  type="button"
                  onClick={insertCodeBlock}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
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
                    disabled={disabled}
                    className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                    title="Insert Emoji"
                  >
                    <Smile size={16} />
                  </button>
                  {showEmojiPicker && !disabled && (
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
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Insert Link"
                >
                  <Link size={16} />
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
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
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("justifyCenter")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText("justifyRight")}
                  disabled={disabled}
                  className="p-2 hover:bg-gray-200 rounded transition-colors text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
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
            contentEditable={!disabled}
            className={`w-full p-4 focus:outline-none text-gray-900 ${
              error ? "bg-red-50" : "bg-white"
            }`}
            style={{ 
              lineHeight: "1.6",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              minHeight,
              maxHeight,
              overflowY: "auto"
            }}
            onInput={handleContentChange}
            onKeyDown={handleKeyDown}
            data-placeholder={placeholder}
          />
          
          {/* CSS for placeholder */}
          <style jsx>{`
            [contenteditable][data-placeholder]:empty:before {
              content: attr(data-placeholder);
              color: #9ca3af;
              pointer-events: none;
              display: block;
            }
          `}</style>
        </div>
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor"

export default RichTextEditor