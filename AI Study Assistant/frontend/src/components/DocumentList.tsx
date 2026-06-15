/**
 * Document List Component
 */

"use client";

import { useDocuments } from "@/hooks";
import { formatDistanceToNow } from "date-fns";
import type { Document } from "@/types";

export function DocumentList() {
  const { data: documents, isLoading, error } = useDocuments();

  if (isLoading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading documents
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">No documents uploaded yet</p>
        <p className="text-sm text-slate-500">
          Upload your first study material to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc: Document) => (
        <div
          key={doc.id}
          className="card p-4 flex justify-between items-center"
        >
          <div>
            <h4 className="font-semibold text-slate-900">{doc.filename}</h4>
            <p className="text-sm text-slate-600">
              {formatDistanceToNow(new Date(doc.upload_date), {
                addSuffix: true,
              })}
            </p>
            <div className="mt-2">
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  doc.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : doc.status === "processing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary text-sm">View</button>
            <button className="btn-secondary text-sm">Chat</button>
          </div>
        </div>
      ))}
    </div>
  );
}
