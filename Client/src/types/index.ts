export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  message: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
  is_active: boolean;
}
