"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  User,
  MapPin,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

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

interface FormResponse {
  id: number;
  data: Record<string, string | number | boolean | string[]>;
  submittedAt: string;
  ipAddress?: string;
}

interface ResponsesViewProps {
  formSlug: string;
}

export default function ResponsesView({ formSlug }: ResponsesViewProps) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResponse, setExpandedResponse] = useState<number | null>(null);

  useEffect(() => {
    async function fetchResponses() {
      try {
        const response = await fetch(`/api/forms/${formSlug}/responses`);

        if (!response.ok) {
          throw new Error("Failed to fetch responses");
        }

        const data = await response.json();
        setResponses(data.responses || []);
        setSchema(data.form?.schema || null);
      } catch (err) {
        console.error("Error fetching responses:", err);
        setError("Failed to load responses");
      } finally {
        setLoading(false);
      }
    }

    fetchResponses();
  }, [formSlug]);

  const formatFieldValue = (
    field: FormField,
    value: string | number | boolean | string[] | null | undefined
  ): string => {
    if (value === null || value === undefined) return "—";

    switch (field.type) {
      case "checkbox":
        return value ? "Yes" : "No";
      case "date":
        return new Date(value as string | number).toLocaleDateString();
      case "select":
      case "radio":
        return String(value);
      default:
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return String(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading responses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
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
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No responses yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Responses will appear here once people start submitting your form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Form Responses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {responses.length} response{responses.length !== 1 ? "s" : ""}{" "}
            received
          </p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {responses.map((response, index) => (
              <motion.div
                key={response.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
              >
                {/* Response Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() =>
                    setExpandedResponse(
                      expandedResponse === response.id ? null : response.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {expandedResponse === response.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Response #{responses.length - index}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(
                              response.submittedAt
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(response.submittedAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        {response.ipAddress && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{response.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Details */}
                <AnimatePresence>
                  {expandedResponse === response.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        {schema?.fields.map((field) => (
                          <div
                            key={field.id}
                            className="flex flex-col space-y-1"
                          >
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {field.name}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border">
                              {formatFieldValue(field, response.data[field.id])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
