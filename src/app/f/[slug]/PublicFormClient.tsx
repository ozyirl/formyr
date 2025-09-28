"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  assistant: string;
  next?: {
    fieldId: string;
    prompt: string;
  };
  updates?: Array<{
    fieldId: string;
    value: string | number | boolean | string[];
  }>;
  draft: {
    answers: Record<string, string | number | boolean | string[]>;
    meta: {
      isSubmitted: boolean;
      lastAsked?: string;
    };
  };
  complete: boolean;
  sessionId: number;
}

export default function PublicFormClient({ slug }: PublicFormClientProps) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [answers, setAnswers] = useState<
    Record<string, string | number | boolean | string[]>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      schema: FormSchema,
      currentAnswers: Record<string, string | number | boolean | string[]>
    ) => {
      if (!schema) return;

      setIsSubmitting(true);

      try {
        const response = await fetch(`/api/forms/${slug}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            message,
            schema,
            answers: currentAnswers,
            progress: {
              asked: Object.keys(currentAnswers),
              pending: schema.fields
                .filter((f) => f.required && !currentAnswers[f.id])
                .map((f) => f.id),
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const chatResponse: ChatResponse = await response.json();

        // Update session ID if this is the first message
        if (!sessionId && chatResponse.sessionId) {
          setSessionId(chatResponse.sessionId);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: chatResponse.assistant,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);

        // Update answers with any extracted values
        if (chatResponse.updates && chatResponse.updates.length > 0) {
          const newAnswers = { ...currentAnswers };
          chatResponse.updates.forEach((update) => {
            newAnswers[update.fieldId] = update.value;
          });
          setAnswers(newAnswers);
        } else {
          setAnswers(chatResponse.draft.answers);
        }

        // Update completion status
        setIsComplete(chatResponse.complete);

        // Set current question
        if (chatResponse.next) {
          setCurrentQuestion(chatResponse.next.prompt);
        } else if (chatResponse.complete) {
          setCurrentQuestion(
            "All required fields are complete! You can now submit the form."
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);

        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } finally {
        setIsSubmitting(false);
      }
    },
    [slug, sessionId]
  );

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

        // Start the conversation with a welcome message
        if (formData.schema) {
          const welcomeMessage: ChatMessage = {
            role: "assistant",
            content: `Hi! I'll help you fill out the "${formData.title}" form. Let's start with the first question.`,
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);

          // Send initial message to get first question
          await sendMessage(
            "Hello, I'd like to fill out this form",
            formData.schema,
            {}
          );
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [sendMessage, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting || !form) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Auto-scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    // Send to chat API
    await sendMessage(inputValue, form.schema, answers);
    setInputValue("");
  };

  const handleFinalSubmit = async () => {
    if (!form || !isComplete) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${slug}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });

      if (response.ok) {
        setIsSubmitted(true);
        const successMessage: ChatMessage = {
          role: "assistant",
          content:
            form.schema.successMessage || "Thank you for your submission!",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);

        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        throw new Error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, there was an error submitting your form. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <AlertCircle className="mx-auto h-12 w-12" />
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

  // Show thank you screen after successful submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto px-6"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4"
            >
              Thank You!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-400 mb-6"
            >
              {form.schema.successMessage ||
                "Your form has been submitted successfully!"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500 dark:text-gray-500"
            >
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                &ldquo;{form.title}&rdquo;
              </p>
              <p>
                Submitted on {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {form.description}
            </p>
          )}

          {/* Progress indicator */}
          {form.schema && (
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (Object.keys(answers).length /
                        form.schema.fields.filter((f) => f.required).length) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(answers).length} /{" "}
                {form.schema.fields.filter((f) => f.required).length}
              </span>
              {isComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    delay: index * 0.05,
                  }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start gap-3 max-w-[85%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gradient-to-br from-purple-500 to-blue-600 text-white"
                      }`}
                    >
                      {message.role === "user" ? "You" : "AI"}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                        message.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-md"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Message tail */}
                      <div
                        className={`absolute top-0 w-3 h-3 ${
                          message.role === "user"
                            ? "right-0 -mr-1 bg-blue-600"
                            : "left-0 -ml-1 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700"
                        } transform rotate-45`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Enhanced Typing Indicator */}
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-3 max-w-[85%]">
                  {/* AI Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                    AI
                  </div>

                  {/* Typing Bubble */}
                  <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.2,
                          }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: 0.4,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        AI is thinking...
                      </span>
                    </div>

                    {/* Message tail */}
                    <div className="absolute top-0 left-0 -ml-1 w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            {isComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Form completed successfully!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    All required fields have been filled. Ready to submit.
                  </p>
                </div>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-sm"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    form.schema.submitText || "Submit Form"
                  )}
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {/* Current Question Display */}
                {currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border-l-4 border-blue-500"
                  >
                    <span className="font-medium">Next: </span>
                    {currentQuestion}
                  </motion.div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your answer here..."
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200 pr-12"
                    />
                    {inputValue.trim() && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </motion.div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isSubmitting}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
