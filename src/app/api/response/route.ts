import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
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
    console.log("🤖 Incoming request:", message, "sessionId:", sessionId);

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

    console.log("🔧 Starting generateText with tools...");
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a Form Creator Bot. Your primary job is to help users create forms by analyzing their requests.

IMPORTANT: When a user mentions form-related content, you MUST use the createForm tool with proper parameters.

EXAMPLE: If user says "I need a contact form with name, email, phone"
You MUST call createForm with:
{
  "title": "Contact Form",
  "fields": [
    {"id": "name", "name": "Full Name", "type": "text", "required": true, "placeholder": "Enter your name"},
    {"id": "email", "name": "Email", "type": "email", "required": true, "placeholder": "Enter your email"}, 
    {"id": "phone", "name": "Phone", "type": "text", "required": true, "placeholder": "Enter your phone number"}
  ]
}

Always extract field information and create appropriate field objects. Common field mappings:
- "name" → {"id": "name", "name": "Full Name", "type": "text"}
- "email" → {"id": "email", "name": "Email Address", "type": "email"}  
- "phone" → {"id": "phone", "name": "Phone Number", "type": "text"}
- "age" → {"id": "age", "name": "Age", "type": "number"}
- "message" → {"id": "message", "name": "Message", "type": "textarea"}

User request: ${message}`,
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
            console.log("🚀 TOOL EXECUTE FUNCTION CALLED!");
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

            const result = {
              success: true,
              formSchema: {
                id: `form_${Date.now()}`,
                title: params.title,
                description: params.description || `Form for ${params.title}`,
                fields: params.fields,
                submitText: params.submitText || "Submit",
                successMessage:
                  params.successMessage || "Thank you for your submission!",
                createdAt: new Date().toISOString(),
              },
            };

            console.log(
              "🎯 Tool returning result:",
              JSON.stringify(result, null, 2)
            );
            return result;
          },
        }),
      },
      toolChoice: { type: "tool", toolName: "createForm" },
      onStepFinish({ text, toolCalls, toolResults, finishReason }) {
        console.log("🔄 Step finished:", {
          text: text?.substring(0, 100) + (text?.length > 100 ? "..." : ""),
          toolCallsCount: toolCalls?.length || 0,
          toolResultsCount: toolResults?.length || 0,
          finishReason,
          toolCallNames: toolCalls?.map((tc) => tc.toolName) || [],
        });
        if (toolCalls?.length > 0) {
          console.log(
            "🛠️ Tool calls in step:",
            JSON.stringify(toolCalls, null, 2)
          );
        }
        if (toolResults?.length > 0) {
          console.log(
            "📊 Tool results in step:",
            JSON.stringify(toolResults, null, 2)
          );
        }
      },
    });

    console.log("✅ generateText completed successfully");
    console.log("🔍 AI Result:", {
      text: result.text,
      toolResults: result.toolResults?.length || 0,
      toolNames: result.toolResults?.map((t) => t.toolName) || [],
    });

    if (result.toolResults && result.toolResults.length > 0) {
      console.log("✅ Tools were called!");
      const formResult = result.toolResults.find(
        (tool) => tool.toolName === "createForm"
      );
      if (formResult) {
        console.log("🎯 Found createForm tool result");
        console.log("🔍 Tool result structure:", formResult);
        const toolResult = formResult as {
          output?: {
            formSchema?: FormData & { id: string; createdAt: string };
          };
        };

        const formSchema = toolResult.output?.formSchema;
        console.log("📋 Form Schema:", JSON.stringify(formSchema, null, 2));

        if (!formSchema || !formSchema.title || !formSchema.fields) {
          console.error("❌ Invalid form schema returned from tool");
          return NextResponse.json({
            message: "Failed to create form - invalid schema generated",
            error: "Invalid form schema",
            type: "form_creation_error",
          });
        }

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
          const responseMessage =
            result.text ||
            `I've created your form: "${formSchema.title}"! You can access it at ${saveResult.url}`;

          // Store AI response message
          await saveChatMessage({
            sessionId: currentSessionId,
            role: "assistant",
            content: responseMessage,
          });

          // Update session with form link if form was created
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

          return NextResponse.json({
            message: responseMessage,
            formSchema,
            formUrl: saveResult.url,
            formId: saveResult.form?.id,
            sessionId: currentSessionId,
            type: "form_created",
          });
        } else {
          const errorMessage =
            result.text ||
            "I've created a form based on your request, but couldn't save it to the database.";

          // Store AI error response
          await saveChatMessage({
            sessionId: currentSessionId,
            role: "assistant",
            content: errorMessage,
          });

          return NextResponse.json({
            message: errorMessage,
            formSchema,
            error: saveResult.error,
            sessionId: currentSessionId,
            type: "form_created_with_error",
          });
        }
      }
    }

    const conversationMessage =
      result.text ||
      "I'm here to help you create forms! Just describe what kind of form you need.";

    // Store AI response for general conversation
    await saveChatMessage({
      sessionId: currentSessionId,
      role: "assistant",
      content: conversationMessage,
    });

    return NextResponse.json({
      message: conversationMessage,
      sessionId: currentSessionId,
      type: "conversation",
    });
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
