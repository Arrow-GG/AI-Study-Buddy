/**
 * API service client
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  Document,
  ChatResponse,
  Quiz,
  Summary,
  AuthTokens,
} from "@/types";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          window.location.href = "/auth";
        }
        return Promise.reject(error);
      },
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data } = await this.client.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data;
  }

  async register(name: string, email: string, password: string) {
    const { data } = await this.client.post("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  }

  async logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    await this.client.post("/auth/logout");
  }

  // Document endpoints
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await this.client.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async createTextDocument(title: string, content: string): Promise<Document> {
    const { data } = await this.client.post("/documents/text", {
      title,
      content,
    });
    return data;
  }

  async listDocuments(): Promise<Document[]> {
    const { data } = await this.client.get("/documents/");
    return data;
  }

  async deleteDocument(documentId: number): Promise<void> {
    await this.client.delete(`/documents/${documentId}`);
  }

  async processDocument(documentId: number) {
    const { data } = await this.client.get(`/documents/${documentId}/process`);
    return data;
  }

  // Chat endpoints
  async askQuestion(
    message: string,
    documentId: number,
  ): Promise<ChatResponse> {
    const { data } = await this.client.post("/chat/ask", {
      message,
      document_id: documentId,
    });
    return data;
  }

  async getChatHistory(documentId: number) {
    const { data } = await this.client.get(`/chat/history/${documentId}`);
    return data;
  }

  // Quiz endpoints
  async generateQuiz(
    documentId: number,
    numQuestions: number = 10,
  ): Promise<Quiz> {
    const { data } = await this.client.post("/quizzes/generate", {
      document_id: documentId,
      num_questions: numQuestions,
    });
    return data;
  }

  async getQuiz(quizId: number): Promise<Quiz> {
    const { data } = await this.client.get(`/quizzes/${quizId}`);
    return data;
  }

  async submitQuiz(
    quizId: number,
    answers: Array<{ question_id: number; answer: string }>,
  ) {
    const { data } = await this.client.post(`/quizzes/${quizId}/submit`, {
      answers,
    });
    return data;
  }

  // Flashcard endpoints
  async generateFlashcards(documentId: number, numCards: number = 20) {
    const { data } = await this.client.post("/flashcards/generate", {
      document_id: documentId,
      num_cards: numCards,
    });
    return data;
  }

  async getFlashcardDeck(deckId: number) {
    const { data } = await this.client.get(`/flashcards/${deckId}`);
    return data;
  }

  async updateCardStatus(
    cardId: number,
    status: "mastered" | "learning" | "difficult",
  ) {
    const { data } = await this.client.put(`/flashcards/${cardId}/status`, {
      status,
    });
    return data;
  }

  // Summarizer endpoints
  async summarizeDocument(documentId: number): Promise<Summary> {
    const { data } = await this.client.post("/summarizer/summarize", {
      document_id: documentId,
    });
    return data;
  }

  async generateExamNotes(documentId: number) {
    const { data } = await this.client.post("/summarizer/exam-notes", {
      document_id: documentId,
    });
    return data;
  }
}

export const apiClient = new ApiClient();
