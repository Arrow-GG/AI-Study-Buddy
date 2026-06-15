/**
 * Custom React hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import toast from "react-hot-toast";

// Documents hook
export const useDocuments = () => {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => apiClient.listDocuments(),
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiClient.uploadDocument(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document uploaded successfully!");
    },
    onError: () => {
      toast.error("Failed to upload document");
    },
  });
};

// Quiz hook
export const useGenerateQuiz = () => {
  return useMutation({
    mutationFn: ({
      documentId,
      numQuestions,
    }: {
      documentId: number;
      numQuestions: number;
    }) => apiClient.generateQuiz(documentId, numQuestions),
    onSuccess: () => {
      toast.success("Quiz generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate quiz");
    },
  });
};

// Flashcard hook
export const useGenerateFlashcards = () => {
  return useMutation({
    mutationFn: ({
      documentId,
      numCards,
    }: {
      documentId: number;
      numCards: number;
    }) => apiClient.generateFlashcards(documentId, numCards),
    onSuccess: () => {
      toast.success("Flashcards generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate flashcards");
    },
  });
};

// Summarizer hook
export const useSummarizeDocument = () => {
  return useMutation({
    mutationFn: (documentId: number) => apiClient.summarizeDocument(documentId),
    onSuccess: () => {
      toast.success("Document summarized!");
    },
    onError: () => {
      toast.error("Failed to summarize document");
    },
  });
};
