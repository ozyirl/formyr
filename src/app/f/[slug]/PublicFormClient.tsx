"use client";

import { useState, useEffect } from "react";
import { AIChatInput } from "@/components/ui/ai-chat-input";
interface PublicFormClientProps {
  slug: string;
}

interface FormField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
  submitText?: string;
  successMessage?: string;
}

interface FormData {
  id: number;
  slug: string;
  title: string;
  description?: string;
  schema: FormSchema;
  createdAt: string;
  updatedAt: string;
}

export default function PublicFormClient({ slug }: PublicFormClientProps) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`/api/forms/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Form not found");
          } else {
            setError("Failed to load form");
          }
          return;
        }

        const formData = await response.json();
        setForm(formData);
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The form youre looking for doesnt exist or isnt published yet.
          </p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No form data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-700 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {form.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Form ID: {form.slug}</span>
            <span>•</span>
            <span>
              Created: {new Date(form.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <AIChatInput />
    </div>
  );
}
