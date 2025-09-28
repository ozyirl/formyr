import { NextResponse } from "next/server";
import { streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import {
  saveForm,
  type FormData,
  createChatSession,
  saveChatMessage,
  updateChatSessionWithForm,
} from "@/actions/actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, sessionId } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    console.log("🤖 Streaming request:", message, "sessionId:", sessionId);

    // Handle chat session - create one if not provided
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      console.log("💬 Creating new chat session...");
      const sessionResult = await createChatSession({
        userId,
        title: "Form Creation Chat",
      });

      if (sessionResult.success && sessionResult.session) {
        currentSessionId = sessionResult.session.id;
        console.log("✅ New session created:", currentSessionId);
      } else {
        console.error("❌ Failed to create session:", sessionResult.error);
        return NextResponse.json(
          { error: "Failed to create chat session" },
          { status: 500 }
        );
      }
    }

    // Store user message
    console.log("💬 Storing user message...");
    const userMessageResult = await saveChatMessage({
      sessionId: currentSessionId,
      role: "user",
      content: message,
    });

    if (!userMessageResult.success) {
      console.error(
        "❌ Failed to store user message:",
        userMessageResult.error
      );
    }

    console.log("🔧 Starting streamText with tools...");
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a helpful and conversational Form Creator Bot. Your job is to help users create forms through natural conversation.

CONVERSATION FLOW:
1. First, respond conversationally to understand what the user needs
2. Ask clarifying questions if needed IF NEEDED , DO not annoy the user, generate your own questions if needed  
3. When you have enough information, use the createForm tool to create the form
4. Explain what you've created in a friendly way

WHEN TO USE TOOLS:
- Only use the createForm tool when you have clear, specific form requirements
- If the user's request is vague, ask for clarification first instead of using tools

EXAMPLES:

User: "I need a contact form with name, email, phone"
Response: "I'll create a contact form for you with those fields. Let me set that up!"
Then use createForm tool with appropriate parameters.

User: "I need a form"
Response: "I'd be happy to help you create a form! What kind of form do you need? What information do you want to collect from users?"

User: "Hello"
Response: "Hi there! I'm here to help you create custom forms. What kind of form would you like to build today?"

FIELD MAPPINGS:
- "name" → {"id": "name", "name": "Full Name", "type": "text"}
- "email" → {"id": "email", "name": "Email Address", "type": "email"}  
- "phone" → {"id": "phone", "name": "Phone Number", "type": "text"}
- "age" → {"id": "age", "name": "Age", "type": "number"}
- "message" → {"id": "message", "name": "Message", "type": "textarea"}

User request: ${message}

Be conversational, helpful, and only use tools when you have clear requirements!`,
      tools: {
        createForm: tool({
          description:
            "Generate a JSON schema for a form based on user requirements",
          inputSchema: z.object({
            title: z
              .string()
              .describe(
                "Title of the form (e.g., 'Contact Form', 'Registration Form')"
              ),
            description: z
              .string()
              .optional()
              .describe("Brief description of what the form is for"),
            fields: z
              .array(
                z.object({
                  id: z
                    .string()
                    .describe(
                      "Unique identifier for the field (e.g., 'name', 'email')"
                    ),
                  name: z
                    .string()
                    .describe(
                      "Display name for the field (e.g., 'Full Name', 'Email Address')"
                    ),
                  type: z
                    .enum([
                      "text",
                      "email",
                      "number",
                      "textarea",
                      "select",
                      "checkbox",
                      "radio",
                      "date",
                      "file",
                    ])
                    .describe("Type of input field"),
                  required: z
                    .boolean()
                    .default(true)
                    .describe("Whether the field is required"),
                  placeholder: z
                    .string()
                    .optional()
                    .describe("Placeholder text for the field"),
                  options: z
                    .array(z.string())
                    .optional()
                    .describe("Options for select, radio, or checkbox fields"),
                })
              )
              .describe("Array of form fields"),
            submitText: z
              .string()
              .default("Submit")
              .describe("Text for the submit button"),
            successMessage: z
              .string()
              .default("Thank you for your submission!")
              .describe("Message to show on successful submission"),
          }),
          execute: async (params) => {
            console.log("🚀 STREAM TOOL EXECUTE FUNCTION CALLED!");
            console.log(
              "🛠️ createForm tool executed with params:",
              JSON.stringify(params, null, 2)
            );

            // Validate required parameters
            if (!params.title) {
              console.error("❌ Missing required parameter: title");
              throw new Error("Missing required parameter: title");
            }
            if (
              !params.fields ||
              !Array.isArray(params.fields) ||
              params.fields.length === 0
            ) {
              console.error("❌ Missing or invalid parameter: fields");
              throw new Error("Missing or invalid parameter: fields");
            }

            console.log("✅ All required parameters present");

            const formSchema = {
              id: `form_${Date.now()}`,
              title: params.title,
              description: params.description || `Form for ${params.title}`,
              fields: params.fields,
              submitText: params.submitText || "Submit",
              successMessage:
                params.successMessage || "Thank you for your submission!",
              createdAt: new Date().toISOString(),
            };

            // Save the form
            console.log("💾 Saving form to database...");
            const saveResult = await saveForm(
              {
                title: formSchema.title,
                description: formSchema.description,
                fields: formSchema.fields,
                submitText: formSchema.submitText,
                successMessage: formSchema.successMessage,
              } as FormData,
              userId
            );

            console.log("💾 Save Result:", saveResult);

            if (saveResult.success) {
              console.log("✅ Form saved successfully!");

              if (saveResult.form?.id) {
                console.log("🔗 Form created with ID:", saveResult.form.id);
                const updateResult = await updateChatSessionWithForm(
                  currentSessionId,
                  saveResult.form.id
                );
                if (updateResult.success) {
                  console.log("✅ Session successfully linked to form");
                } else {
                  console.error(
                    "❌ Failed to link session to form:",
                    updateResult.error
                  );
                }
              }

              return {
                success: true,
                formSchema,
                formUrl: saveResult.url,
                formId: saveResult.form?.id,
                sessionId: currentSessionId,
                type: "form_created",
              };
            } else {
              return {
                success: false,
                formSchema,
                error: saveResult.error,
                sessionId: currentSessionId,
                type: "form_created_with_error",
              };
            }
          },
        }),
      },
      toolChoice: "auto",
      onStepFinish({ text, toolCalls, toolResults, finishReason }) {
        console.log("🔄 Stream step finished:", {
          text: text?.substring(0, 100) + (text?.length > 100 ? "..." : ""),
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0,
          finishReason,
          toolCallNames: toolCalls?.map((tc) => tc.toolName) || [],
        });
      },
    });

    // Create a custom stream that includes metadata
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullText = "";

        try {
          // Stream text as it comes
          for await (const chunk of result.textStream) {
            fullText += chunk;
            console.log("📝 Streaming chunk:", chunk);

            // Send text chunk immediately
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "text",
                  content: chunk,
                  sessionId: currentSessionId,
                })}\n\n`
              )
            );
          }

          console.log("✅ Text streaming completed, full text:", fullText);

          // Wait for the final result and tool results
          await result.response;
          console.log("🔧 Final result received");

          // Handle tool results if any
          try {
            const toolResults = await result.toolResults;
            if (toolResults && toolResults.length > 0) {
              const toolResult = toolResults[0];

              console.log("🛠️ Processing tool result:", toolResult.toolName);

              // Send tool result
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "tool_result",
                    content: toolResult,
                    sessionId: currentSessionId,
                  })}\n\n`
                )
              );
            }
          } catch {
            console.log("No tool results available");
          }

          // Store AI response message
          const messageToStore = fullText || "I've processed your request.";
          await saveChatMessage({
            sessionId: currentSessionId,
            role: "assistant",
            content: messageToStore,
          });

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                sessionId: currentSessionId,
                fullText: messageToStore,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);

          // Send error message
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                content:
                  "Sorry, I encountered an error while processing your request.",
                sessionId: currentSessionId,
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error generating streaming response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
