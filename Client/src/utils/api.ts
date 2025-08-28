import axios from 'axios';
import type { ApiResponse, ChatResponse, UploadResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your actual API URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simulate network delay for demo purposes
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const chatApi = {
  async sendMessage(message: string): Promise<ApiResponse<ChatResponse>> {
    try {
      // Simulate API call
      await simulateDelay(800);
      
      // Dummy response - replace with actual API call
      // const response = await api.post('/chat', { message });
      
      // Mock response for demo
      const mockResponse: ChatResponse = {
        message: `I received your message: "${message}". This is a demo response from the chat API.`,
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResponse,
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

      // Simulate upload progress
      await simulateDelay(1500);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Dummy response - replace with actual API call
      // const response = await api.post('/upload', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      // Mock response for demo
      const mockResponse: UploadResponse = {
        fileId: `file_${Date.now()}`,
        fileName: file.name,
        message: `Successfully uploaded ${file.name}`,
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
