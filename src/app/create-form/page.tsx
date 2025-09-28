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

export default function PureMultimodalInputOnlyDisplay() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatId] = useState("demo-input-only");

  const handleSendMessage = useCallback(
    ({ input, attachments }: { input: string; attachments: Attachment[] }) => {
      //   console.log("--- Simulating Sending Message ---");
      //   console.log("Input:", input);
      //   console.log("Attachments:", attachments);
      //   console.log("---------------------------------");

      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
      }, 2000);
    },
    []
  );

  const handleStopGenerating = useCallback(() => {
    console.log("Stop button clicked (simulated).");
    setIsGenerating(false);
  }, []);

  const canSend = true;
  const messages: UIMessage[] = [];
  const selectedVisibilityType: VisibilityType = "private";

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-3xl mx-auto p-4">
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
  );
}
