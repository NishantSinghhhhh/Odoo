export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    reputation: number;
    createdAt: Date;
  }
  
  export interface Question {
    id: string;
    title: string;
    description: string;
    tags: string[];
    author: User;
    votes: number;
    answers: Answer[];
    acceptedAnswerId?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Answer {
    id: string;
    content: string;
    author: User;
    questionId: string;
    votes: number;
    isAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Tag {
    id: string;
    name: string;
    description?: string;
    questionsCount: number;
  }
  
  export interface CreateQuestionData {
    title: string;
    description: string;
    tags: string[];
  }
  
  export interface CreateAnswerData {
    content: string;
    questionId: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  // Form validation errors
  export interface FormErrors {
    [key: string]: string | undefined;
  }
  
  // Authentication types
  export interface LoginData {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface AuthUser {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    reputation: number;
    token: string;
  }