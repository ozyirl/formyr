"use client";

import React, { useState, useCallback } from "react";
import { PureMultimodalInput } from "@/components/multimodal-ai-chat-input";
type VisibilityType = "public" | "private" | "unlisted" | string;

interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

interface UIMessage {
  id: string;
  content: string;
  role: string;
  attachments?: Attachment[];
}

interface FormSchema {
  id: string;
  title: string;
  description: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  submitText: string;
  successMessage: string;
  createdAt: string;
}

interface ApiResponse {
  message: string;
  type: string;
  formSchema?: FormSchema;
  formUrl?: string;
  formId?: string;
  error?: string;
}

export default function PureMultimodalInputOnlyDisplay() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatId] = useState("demo-input-only");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [response, setResponse] = useState<string>("");

  const handleSendMessage = useCallback(
    async ({
      input,
      attachments,
    }: {
      input: string;
      attachments: Attachment[];
    }) => {
      if (!input.trim()) return;

      // Add user message to chat
      const userMessage: UIMessage = {
        id: `user-${Date.now()}`,
        content: input,
        role: "user",
        attachments,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);

      try {
        const response = await fetch("/api/response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        const aiMessage: UIMessage = {
          id: `ai-${Date.now()}`,
          content: data.message,
          role: "assistant",
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Handle different response types
        if (data.type === "form_created" && data.formUrl) {
          setResponse(
            `Form created successfully! You can access it at: ${data.formUrl}`
          );
        } else if (data.type === "form_created_with_error") {
          setResponse(
            `Form created but with errors: ${data.error || "Unknown error"}`
          );
        } else {
          setResponse(data.message);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: UIMessage = {
          id: `error-${Date.now()}`,
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
          role: "assistant",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setResponse("Error occurred while processing your request.");
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const handleStopGenerating = useCallback(() => {
    console.log("Stop button clicked (simulated).");
    setIsGenerating(false);
  }, []);

  const canSend = true;
  const selectedVisibilityType: VisibilityType = "private";

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Form Creator Bot
          </h1>
          <p className="text-gray-600">
            Describe the form you need and I&apos;ll create it for you!
          </p>
        </div>

        {/* Chat Messages Display */}
        {messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 max-h-96 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Conversation</h2>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Status */}
        {response && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">{response}</p>
          </div>
        )}

        {/* Input Component */}
        <div className="bg-white rounded-lg  h-full w-full">
          <PureMultimodalInput
            chatId={chatId}
            messages={messages}
            attachments={attachments}
            setAttachments={setAttachments}
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isGenerating={isGenerating}
            canSend={canSend}
            selectedVisibilityType={selectedVisibilityType}
          />
        </div>
      </div>
    </div>
  );
}
