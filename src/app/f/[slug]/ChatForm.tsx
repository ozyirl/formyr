"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  id: string;
  type: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface ChatFormProps {
  slug: string;
}

export default function ChatForm({ slug }: ChatFormProps) {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [collectedAnswers, setCollectedAnswers] = useState<Record<string, any>>(
    {}
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch form data on mount
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

        // Initialize messages with title and description
        const initialMessages: ChatMessage[] = [];

        if (formData.schema.title) {
          initialMessages.push({
            id: "title",
            type: "assistant",
            content: `Welcome! Let's fill out: **${formData.schema.title}**`,
            timestamp: new Date(),
          });
        }

        if (formData.schema.description) {
          initialMessages.push({
            id: "description",
            type: "assistant",
            content: formData.schema.description,
            timestamp: new Date(),
          });
        }

        setMessages(initialMessages);

        // Start with first field if available
        if (formData.schema.fields.length > 0) {
          setTimeout(() => {
            showCurrentField(formData.schema.fields, 0);
          }, 1000);
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [slug]);

  // Show current field as assistant message
  const showCurrentField = (fields: FormField[], fieldIndex: number) => {
    if (fieldIndex >= fields.length) {
      // All fields completed
      setIsReadyToSubmit(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `ready-${Date.now()}`,
          type: "assistant",
          content:
            "Great! You've completed all fields. Ready to submit your form?",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const field = fields[fieldIndex];
    const fieldPrompt = getFieldPrompt(field);

    setMessages((prev) => [
      ...prev,
      {
        id: `field-${field.id}`,
        type: "assistant",
        content: fieldPrompt,
        timestamp: new Date(),
      },
    ]);
  };

  // Generate appropriate prompt for each field type
  const getFieldPrompt = (field: FormField): string => {
    let prompt = `**${field.name}**`;

    if (field.required) {
      prompt += " *(required)*";
    }

    switch (field.type) {
      case "email":
        prompt += "\n\nPlease enter your email address.";
        break;
      case "number":
        prompt += "\n\nPlease enter a number.";
        break;
      case "textarea":
        prompt +=
          "\n\nPlease provide your response (you can write multiple lines).";
        break;
      case "select":
      case "radio":
        if (field.options) {
          prompt += `\n\nPlease choose one of the following options:\n${field.options
            .map((opt) => `• ${opt}`)
            .join("\n")}`;
        }
        break;
      case "checkbox":
        if (field.options) {
          prompt += `\n\nPlease select one or more options:\n${field.options
            .map((opt) => `• ${opt}`)
            .join("\n")}`;
        }
        break;
      default:
        prompt += field.placeholder
          ? `\n\n${field.placeholder}`
          : "\n\nPlease enter your response.";
    }

    return prompt;
  };

  // Validate field input
  const validateInput = (field: FormField, value: string): string | null => {
    if (field.required && (!value || value.trim() === "")) {
      return `${field.name} is required.`;
    }

    switch (field.type) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return "Please enter a valid email address.";
        }
        break;
      case "number":
        if (value && isNaN(Number(value))) {
          return "Please enter a valid number.";
        }
        break;
      case "select":
      case "radio":
        if (field.options && value && !field.options.includes(value)) {
          return "Please select a valid option.";
        }
        break;
    }

    return null;
  };

  // Handle sending message/answer
  const handleSend = () => {
    if (!form || isSubmitted) return;

    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    if (isReadyToSubmit) {
      // Handle submission confirmation
      if (
        trimmedValue.toLowerCase().includes("yes") ||
        trimmedValue.toLowerCase().includes("submit")
      ) {
        handleSubmit();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            type: "user",
            content: trimmedValue,
            timestamp: new Date(),
          },
          {
            id: `confirm-${Date.now()}`,
            type: "assistant",
            content:
              "Type 'yes' or 'submit' when you're ready to submit the form.",
            timestamp: new Date(),
          },
        ]);
      }
      setInputValue("");
      return;
    }

    const currentField = form.schema.fields[currentFieldIndex];
    const validationError = validateInput(currentField, trimmedValue);

    if (validationError) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: "user",
          content: trimmedValue,
          timestamp: new Date(),
        },
        {
          id: `error-${Date.now()}`,
          type: "assistant",
          content: `❌ ${validationError}\n\nPlease try again.`,
          timestamp: new Date(),
        },
      ]);
      setInputValue("");
      return;
    }

    // Valid input - store answer and advance
    const processedValue =
      currentField.type === "number" ? Number(trimmedValue) : trimmedValue;

    setCollectedAnswers((prev) => ({
      ...prev,
      [currentField.id]: processedValue,
    }));

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        type: "user",
        content: trimmedValue,
        timestamp: new Date(),
      },
    ]);

    setInputValue("");

    // Move to next field
    const nextIndex = currentFieldIndex + 1;
    setCurrentFieldIndex(nextIndex);

    setTimeout(() => {
      showCurrentField(form.schema.fields, nextIndex);
    }, 500);
  };

  // Handle form submission (placeholder)
  const handleSubmit = async () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-submit-${Date.now()}`,
        type: "user",
        content: "Yes, submit the form!",
        timestamp: new Date(),
      },
      {
        id: `submitting-${Date.now()}`,
        type: "assistant",
        content:
          "🚀 Submitting your form... (submission functionality coming next!)",
        timestamp: new Date(),
      },
    ]);

    setIsSubmitted(true);
    console.log("Form answers:", collectedAnswers);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No form data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {message.content
                  .split("**")
                  .map((part, index) =>
                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                  )}
              </div>
              <div className={`text-xs mt-1 opacity-70`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isSubmitted && (
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isReadyToSubmit
                  ? "Type 'yes' to submit..."
                  : "Type your answer..."
              }
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              disabled={isSubmitted}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isSubmitted}
              className="self-end"
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
