"use client";

import { useState } from "react";
import FormPreview from "./FormPreview";
import ChatHistory from "./ChatHistory";
import { Switch } from "@/components/ui/switch";

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
  const [showChatHistory, setShowChatHistory] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {form.title}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-gray-500 dark:text-gray-400">
            {showChatHistory ? "Chat History" : "Manual Build"}
          </p>
          <Switch
            checked={showChatHistory}
            onCheckedChange={setShowChatHistory}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Side - Form Editor or Chat History */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-950">
          <div className="p-6 h-full">
            {showChatHistory ? (
              <ChatHistory formSlug={slug} />
            ) : (
              <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Form Editor
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Drag and drop form builder will go here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Form Preview */}
        <div className="w-1/2 bg-gray-50 dark:bg-zinc-950 overflow-y-auto">
          <div className="p-6">
            <FormPreview schema={form.schemaJson as FormSchema} />
          </div>
        </div>
      </div>
    </div>
  );
}
