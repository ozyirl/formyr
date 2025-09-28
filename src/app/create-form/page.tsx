"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { PureMultimodalInput } from "@/components/multimodal-ai-chat-input";
import { useRouter } from "next/navigation";
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
  isTyping?: boolean;
  displayedContent?: string;
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
  sessionId?: number;
  error?: string;
}

export default function PureMultimodalInputOnlyDisplay() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatId] = useState("demo-input-only");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [response, setResponse] = useState<string>("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const router = useRouter();

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typing animation function
  const animateTyping = useCallback((messageId: string, fullText: string) => {
    let currentIndex = 0;
    setTypingMessageId(messageId);

    // Clear any existing typing animation
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  displayedContent: fullText.slice(0, currentIndex),
                  isTyping: currentIndex < fullText.length,
                }
              : msg
          )
        );
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setTypingMessageId(null);
      }
    }, 30); // Adjust speed as needed (30ms = fast, 100ms = slow)
  }, []);

  // Cleanup typing animation on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Handle streaming response
  const handleStreamingResponse = useCallback(
    async (contextualMessage: string, aiMessageId: string) => {
      try {
        console.log("🚀 Starting streaming request...");
        const response = await fetch("/api/response/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: contextualMessage,
            sessionId: sessionId,
          }),
        });

        if (!response.ok) {
          console.error(
            "❌ Streaming response not OK:",
            response.status,
            response.statusText
          );
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ Streaming response OK, starting to read...");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.sessionId && !sessionId) {
                    setSessionId(data.sessionId);
                    console.log("💬 Session ID set:", data.sessionId);
                  }

                  if (data.type === "text") {
                    accumulatedText += data.content;
                    console.log("📝 Received text chunk:", data.content);

                    // Update message with streaming content
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: accumulatedText,
                              displayedContent: accumulatedText,
                              isTyping: false,
                            }
                          : msg
                      )
                    );
                  } else if (data.type === "tool_result") {
                    // Handle tool results (form creation)
                    console.log("🛠️ Received tool result:", data.content);
                    const toolResult = data.content;

                    // Check if a form was successfully created and redirect
                    if (
                      toolResult?.toolName === "createForm" &&
                      (toolResult.result?.success || toolResult.output?.success)
                    ) {
                      console.log(
                        "✅ Form created successfully, redirecting to dashboard..."
                      );
                      setTimeout(() => {
                        router.push("/dashboard");
                      }, 2000); // Small delay to let user see the success message
                    }
                  } else if (data.type === "error") {
                    // Handle streaming errors
                    console.error("❌ Streaming error:", data.content);
                    accumulatedText = data.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === aiMessageId
                          ? {
                              ...msg,
                              content: accumulatedText,
                              displayedContent: accumulatedText,
                              isTyping: false,
                            }
                          : msg
                      )
                    );
                  } else if (data.type === "complete") {
                    // Streaming complete
                    console.log(
                      "✅ Streaming completed with text:",
                      data.fullText
                    );

                    // Ensure final message is set correctly
                    if (data.fullText && data.fullText !== accumulatedText) {
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === aiMessageId
                            ? {
                                ...msg,
                                content: data.fullText,
                                displayedContent: data.fullText,
                                isTyping: false,
                              }
                            : msg
                        )
                      );
                    }
                  }
                } catch (e) {
                  console.error("Error parsing streaming data:", e);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
        // Fall back to regular response
        return false;
      }
      return true;
    },
    [sessionId, router]
  );

  const handleSendMessage = useCallback(
    async ({
      input,
      attachments,
    }: {
      input: string;
      attachments: Attachment[];
    }) => {
      if (!input.trim()) return;

      const userMessage: UIMessage = {
        id: `user-${Date.now()}`,
        content: input,
        role: "user",
        attachments,
      };

      // Add user message with fade-in animation
      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);

      // Create placeholder AI message for typing animation
      const aiMessageId = `ai-${Date.now()}`;
      const placeholderAiMessage: UIMessage = {
        id: aiMessageId,
        content: "",
        role: "assistant",
        isTyping: true,
        displayedContent: "",
      };
      setMessages((prev) => [...prev, placeholderAiMessage]);

      try {
        // Include conversation context for better continuity
        const conversationContext = messages
          .slice(-4) // Last 4 messages for context
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");

        const contextualMessage = conversationContext
          ? `Previous context:\n${conversationContext}\n\nCurrent request: ${input}`
          : input;

        // Try streaming first, fall back to regular if it fails
        let streamingSuccess = false;
        if (useStreaming) {
          streamingSuccess = await handleStreamingResponse(
            contextualMessage,
            aiMessageId
          );
        }

        if (!streamingSuccess) {
          console.log("📡 Falling back to regular response...");
          setUseStreaming(false);

          const response = await fetch("/api/response", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: contextualMessage,
              sessionId: sessionId,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: ApiResponse = await response.json();

          if (data.sessionId && !sessionId) {
            setSessionId(data.sessionId);
            console.log("💬 Session ID set:", data.sessionId);
          }

          // Update the placeholder message with actual content and start typing animation
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content: data.message,
                    isTyping: false,
                    displayedContent: "",
                  }
                : msg
            )
          );

          // Start typing animation
          setTimeout(() => {
            animateTyping(aiMessageId, data.message);
          }, 500); // Small delay for better UX

          // Handle form creation and redirect
          if (data.type === "form_created" && data.formUrl) {
            console.log(
              "✅ Form created successfully, redirecting to dashboard..."
            );
            setResponse("Form created! Redirecting to dashboard...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          } else if (data.type === "form_created_with_error") {
            setResponse(
              `Form created but with errors: ${data.error || "Unknown error"}`
            );
          } else {
            setResponse("");
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);

        // Update placeholder message with error and animate
        const errorText =
          "Sorry, I encountered an error while processing your request. Please try again.";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: errorText,
                  isTyping: false,
                  displayedContent: "",
                }
              : msg
          )
        );

        // Animate error message
        setTimeout(() => {
          animateTyping(aiMessageId, errorText);
        }, 300);

        setResponse("Error occurred while processing your request.");
      } finally {
        setIsGenerating(false);
      }
    },
    [
      sessionId,
      messages,
      animateTyping,
      useStreaming,
      handleStreamingResponse,
      router,
    ]
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Form Creator Bot
            {useStreaming && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ⚡ Streaming
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Describe the form you need and I&apos;ll create it for you!
            {useStreaming && (
              <span className="block text-sm text-green-600 dark:text-green-400 mt-1">
                Real-time responses enabled
              </span>
            )}
          </p>
        </div>

        {messages.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border p-4 max-h-96 overflow-y-auto transition-all duration-300 ease-in-out">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Conversation
            </h2>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in-0 slide-in-from-bottom-2 duration-500`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      message.role === "user"
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-gray-100 shadow-sm"
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {message.role === "assistant" && message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                            Thinking...
                          </span>
                        </div>
                      ) : (
                        <span>
                          {message.displayedContent !== undefined
                            ? message.displayedContent
                            : message.content}
                          {message.role === "assistant" &&
                            typingMessageId === message.id && (
                              <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse"></span>
                            )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Response Status */}
        {response && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-in fade-in-0 slide-in-from-top-2 duration-500">
            <p className="text-green-800 dark:text-green-200">{response}</p>
          </div>
        )}

        {/* Input Component */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg  h-full w-full">
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
