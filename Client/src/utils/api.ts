import axios from 'axios';
import type { ApiResponse, ChatResponse, UploadResponse } from '../types';

const API_BASE_URL = '/api/v1'; // Use proxy path instead of full URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const chatApi = {
  async sendMessage(message: string): Promise<ApiResponse<ChatResponse>> {
    try {
      // Real API call to FastAPI backend
      const response = await api.post('/chat/message', { message });
      
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  },
};

export const uploadApi = {
  async uploadPDF(file: File): Promise<ApiResponse<UploadResponse>> {
    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        return {
          success: false,
          error: 'Please upload a PDF file only',
        };
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size must be less than 10MB',
        };
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Real API call to FastAPI backend
      const response = await api.post('/uploads/pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Map FastAPI response to frontend format
      const backendResponse = response.data;
      const mockResponse: UploadResponse = {
        fileId: backendResponse.file_id,
        fileName: backendResponse.original_filename,
        message: `Successfully uploaded ${backendResponse.original_filename}`,
      };

      return {
        success: true,
        data: mockResponse,
      };
    } catch (error) {
      console.error('Upload API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  },
};
