/**
 * Document Upload Component
 */

"use client";

import { useCallback, useState } from "react";
import { useUploadDocument } from "@/hooks";
import toast from "react-hot-toast";

export function DocumentUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const { mutate: uploadDocument, isPending } = useUploadDocument();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      validateAndUpload(file);
    }
  }, []);

  const validateAndUpload = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    uploadDocument(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files?.length) {
      validateAndUpload(files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
        isDragging
          ? "border-primary-600 bg-primary-50"
          : "border-slate-300 hover:border-primary-600"
      }`}
    >
      <div className="text-4xl mb-2">📄</div>
      <h3 className="text-lg font-semibold mb-2">Upload Study Material</h3>
      <p className="text-slate-600 mb-4">
        Drag and drop your PDF, DOCX, or TXT files here
      </p>

      <label className="inline-block">
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.txt"
          disabled={isPending}
          className="hidden"
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.currentTarget
              .previousElementSibling as HTMLInputElement;
            input?.click();
          }}
          disabled={isPending}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {isPending ? "Uploading..." : "Choose File"}
        </button>
      </label>
    </div>
  );
}
