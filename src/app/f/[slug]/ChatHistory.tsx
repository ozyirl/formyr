"use client";

import { useState, useEffect } from "react";
import { getChatMessagesByFormSlug } from "@/actions/actions";

interface ChatMessage {
  id: number;
  sessionId: number;
  role: string;
  content: string;
  toolName?: string;
  createdAt: Date;
  sessionTitle?: string;
}

interface ChatHistoryProps {
  formSlug: string;
}

export default function ChatHistory({ formSlug }: ChatHistoryProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Fetch chat messages when component mounts test
  useEffect(() => {
    async function fetchChatMessages() {
      try {
        setLoadingMessages(true);
        const result = await getChatMessagesByFormSlug(formSlug);
        if (result.success) {
          setChatMessages(result.messages as ChatMessage[]);
        } else {
          console.error("Failed to fetch chat messages:", result.error);
        }
      } catch (error) {
        console.error("Error fetching chat messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    }

    fetchChatMessages();
  }, [formSlug]);

  const formatMessageTime = (createdAt: Date) => {
    return new Date(createdAt).toLocaleString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "user":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "assistant":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "system":
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
      case "tool":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200";
    }
  };

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">
          Loading chat history...
        </div>
      </div>
    );
  }

  if (chatMessages.length === 0) {
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Chat History
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No chat messages found for this form yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Chat History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {chatMessages.length} message{chatMessages.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${getRoleColor(message.role)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium capitalize">
                {message.role}
                {message.toolName && ` (${message.toolName})`}
              </span>
              <span className="text-xs opacity-75">
                {formatMessageTime(message.createdAt)}
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
