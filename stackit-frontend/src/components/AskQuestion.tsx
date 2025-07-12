import React, { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Smile, 
  Link, 
  Image, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Home,
  User,
  Bell,
  X
} from 'lucide-react';

import { CreateQuestionData } from '../types/question';

interface AskQuestionPageProps {
  onSubmit?: (questionData: CreateQuestionData) => Promise<void>;
}

const AskQuestionPage: React.FC<AskQuestionPageProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    tags?: string;
  }>({});
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Rich text editor functions
  const formatText = (command: string, value: string | null = null): void => {
    document.execCommand(command, false, value || undefined);
    editorRef.current?.focus();
  };

  const insertEmoji = (emoji: string): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    editorRef.current?.focus();
  };

  const insertLink = (): void => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const insertImage = (): void => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  // Tag management
  const addTag = (e: KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>): void => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      
      if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
        setTags([...tags, trimmedTag]);
        setTagInput('');
        setErrors(prev => ({ ...prev, tags: undefined }));
      }
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get the HTML content from the editor
      const htmlContent = editorRef.current?.innerHTML || '';
      
      const questionData: CreateQuestionData = {
        title: title.trim(),
        description: htmlContent,
        tags
      };
      
      console.log('Question data:', questionData);
      
      // Call the onSubmit prop if provided, otherwise simulate API call
      if (onSubmit) {
        await onSubmit(questionData);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      alert('Question submitted successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setTags([]);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Error submitting question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonEmojis: string[] = ['😀', '😊', '😎', '🤔', '👍', '👎', '❤️', '🚀', '💡', '🔥'];

  const isFormValid = title.trim() && description.trim() && tags.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-orange-400">StackIt</h1>
            <nav className="flex items-center space-x-4">
              <a 
                href="/" 
                className="flex items-center space-x-1 hover:text-orange-400 transition-colors"
              >
                <Home size={20} />
                <span>Home</span>
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-700 rounded">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-8">Ask a Question</h2>
          
          <div onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="Be specific and imagine you're asking a question to another person"
                className={`w-full px-4 py-3 bg-gray-700 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Description
              </label>
              
              {/* Rich Text Editor Toolbar */}
              <div className="bg-gray-700 border border-gray-600 rounded-t-md p-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => formatText('bold')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('italic')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('strikeThrough')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Strikethrough"
                >
                  <Strikethrough size={16} />
                </button>
                
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                
                <button
                  type="button"
                  onClick={() => formatText('insertOrderedList')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('insertUnorderedList')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                
                <div className="relative group">
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-600 rounded transition-colors"
                    title="Insert Emoji"
                  >
                    <Smile size={16} />
                  </button>
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md p-2 hidden group-hover:flex flex-wrap gap-1 z-10">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="p-1 hover:bg-gray-700 rounded text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={insertLink}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Insert Link"
                >
                  <Link size={16} />
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Insert Image"
                >
                  <Image size={16} />
                </button>
                
                <div className="w-px h-6 bg-gray-600 mx-1"></div>
                
                <button
                  type="button"
                  onClick={() => formatText('justifyLeft')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Align Left"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('justifyCenter')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Align Center"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => formatText('justifyRight')}
                  className="p-2 hover:bg-gray-600 rounded transition-colors"
                  title="Align Right"
                >
                  <AlignRight size={16} />
                </button>
              </div>
              
              {/* Editor Content Area */}
              <div
                ref={editorRef}
                contentEditable
                className={`w-full min-h-[200px] p-4 bg-gray-700 border border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                style={{ lineHeight: '1.6' }}
                onInput={(e) => {
                  setDescription(e.currentTarget.innerHTML);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
                data-placeholder="Include all the information someone would need to answer your question"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-lg font-medium mb-2">
                Tags
              </label>
              <div className="space-y-3">
                {/* Tag Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-orange-600 rounded-full p-0.5 transition-colors"
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
                    className={`flex-1 px-4 py-2 bg-gray-700 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 ${
                      errors.tags ? 'border-red-500' : 'border-gray-600'
                    }`}
                    disabled={tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.includes(tagInput.trim()) || tags.length >= 5}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
                  >
                    Add Tag
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Add up to 5 tags to describe what your question is about ({tags.length}/5)
                </p>
                {errors.tags && (
                  <p className="text-sm text-red-400">{errors.tags}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md text-white font-medium transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Question'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AskQuestionPage;