"use client";

import { useState } from "react";
import FormPreview from "./FormPreview";
import ChatHistory from "./ChatHistory";
import ResponsesView from "./ResponsesView";

interface FormField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

interface FormSchema {
  title: string;
  fields: FormField[];
  submitText?: string;
  description?: string;
  successMessage?: string;
}

interface FormData {
  id: number;
  title: string;
  schemaJson: unknown;
}

interface FormPageClientProps {
  form: FormData;
  slug: string;
}

export default function FormPageClient({ form, slug }: FormPageClientProps) {
  const [activeView, setActiveView] = useState<"responses" | "chat">(
    "responses"
  );
  const [copied, setCopied] = useState(false);

  // Get the deployed URL for the form
  const deployedUrl =
    process.env.NEXT_PUBLIC_DEPLOYED_URL ||
    process.env.DEPLOYED_URL ||
    "https://formyr.vercel.app";
  const formUrl = `${deployedUrl}/form/${slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {form.title}
        </h1>

        {/* Form URL Display */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Form URL:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                {formUrl}
              </p>
            </div>
            <button
              onClick={handleCopyUrl}
              className={`ml-3 px-3 py-1 text-xs rounded-md transition-colors ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title="Copy URL"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView("responses")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "responses"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Responses
            </button>
            <button
              onClick={() => setActiveView("chat")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === "chat"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Chat History
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {activeView === "responses"
              ? "View form submissions"
              : "View AI chat conversations"}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Side - Responses or Chat History */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-950">
          {activeView === "responses" ? (
            <ResponsesView formSlug={slug} />
          ) : (
            <div className="p-6 h-full">
              <ChatHistory formSlug={slug} />
            </div>
          )}
        </div>

        {/* Right Side - Form Preview */}
        <div className="w-1/2 bg-gray-50 dark:bg-zinc-950 overflow-y-auto">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Form Preview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is how your form appears to users
              </p>
            </div>
            <FormPreview schema={form.schemaJson as FormSchema} />
          </div>
        </div>
      </div>
    </div>
  );
}
