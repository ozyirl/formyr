"use client";

import { useState, useEffect } from "react";

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

      {/* Content Area - Blank Shell for Now */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Form Shell Ready
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Successfully loaded form &quot;{form.title}&quot; with slug:{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                {slug}
              </code>
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Form Data:
              </h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(form, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
