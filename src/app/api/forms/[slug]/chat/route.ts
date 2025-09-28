import { NextRequest, NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { saveChatMessage, createChatSession } from "@/actions/actions";

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

interface ChatRequest {
  sessionId?: number;
  message: string;
  schema: FormSchema;
  answers: Record<string, string | number | boolean | string[]>;
  progress?: {
    asked: string[];
    pending: string[];
  };
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: ChatRequest = await request.json();
    const { sessionId, message, schema, answers } = body;

    console.log("🤖 Chat request for form:", slug, "sessionId:", sessionId);

    // Validate input
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!schema || !schema.fields) {
      return NextResponse.json(
        { error: "Form schema is required" },
        { status: 400 }
      );
    }

    const [form] = await db
      .select({
        id: forms.id,
        slug: forms.slug,
        title: forms.title,
        isPublished: forms.isPublished,
        schemaJson: forms.schemaJson,
      })
      .from(forms)
      .where(eq(forms.slug, slug));

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    if (!form.isPublished) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      console.log("💬 Creating new chat session for form filling...");

      const forwardedFor = request.headers.get("x-forwarded-for");
      const realIp = request.headers.get("x-real-ip");
      const userAgent = request.headers.get("user-agent");
      const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";
      const uniqueUserId = `anonymous_${Buffer.from(
        `${ipAddress}_${userAgent}_${Date.now()}`
      )
        .toString("base64")
        .slice(0, 16)}`;

      const sessionResult = await createChatSession({
        userId: uniqueUserId,
        formId: form.id,
        title: `Form Fill: ${form.title}`,
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
    await saveChatMessage({
      sessionId: currentSessionId,
      role: "user",
      content: message,
    });

    // Analyze current state
    const requiredFields = schema.fields.filter((field) => field.required);
    const answeredFields = Object.keys(answers);
    const unansweredRequired = requiredFields.filter(
      (field) => !answeredFields.includes(field.id)
    );

    console.log("📊 Form analysis:", {
      totalFields: schema.fields.length,
      requiredFields: requiredFields.length,
      answeredFields: answeredFields.length,
      unansweredRequired: unansweredRequired.length,
    });

    // Generate AI response using LLM
    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `You are a form-filling assistant. Your job is to help users fill out a form by asking questions one at a time and extracting answers from their responses.

FORM SCHEMA:
${JSON.stringify(schema, null, 2)}

CURRENT ANSWERS:
${JSON.stringify(answers, null, 2)}

REQUIRED FIELDS NOT YET ANSWERED:
${unansweredRequired.map((f) => `- ${f.id}: ${f.name} (${f.type})`).join("\n")}

RULES:
1. Ask for ONE field at a time, starting with required unanswered fields
2. Extract field values from user responses when possible
3. Validate extracted values against field types and constraints
4. Never invent field IDs that don't exist in the schema
5. Set complete=true only when ALL required fields are answered
6. Keep responses short and conversational

USER MESSAGE: "${message}"

Based on the user's message, either:
1. Extract field values if they provided information
2. Ask for the next required field if no extractable info
3. Mark complete if all required fields are filled`,
      tools: {
        processFormResponse: tool({
          description: "Process user response and determine next action",
          inputSchema: z.object({
            assistant: z
              .string()
              .describe("Short, conversational response to user"),
            extractedValues: z
              .array(
                z.object({
                  fieldId: z.string().describe("Field ID from schema"),
                  value: z
                    .union([
                      z.string(),
                      z.number(),
                      z.boolean(),
                      z.array(z.string()),
                    ])
                    .describe("Extracted value"),
                })
              )
              .optional()
              .describe("Values extracted from user message"),
            nextField: z
              .object({
                fieldId: z.string().describe("Next field to ask about"),
                prompt: z.string().describe("Question to ask user"),
              })
              .optional()
              .describe("Next field to ask about if not complete"),
            complete: z
              .boolean()
              .describe("Whether all required fields are answered"),
          }),
          execute: async (params) => {
            console.log("🛠️ processFormResponse executed:", params);
            return params;
          },
        }),
      },
      toolChoice: { type: "tool", toolName: "processFormResponse" },
    });

    // Extract tool result
    const toolResult = result.toolResults?.[0];
    if (!toolResult) {
      throw new Error("No tool result received");
    }

    const response = toolResult.output as {
      assistant: string;
      extractedValues?: Array<{
        fieldId: string;
        value: string | number | boolean | string[];
      }>;
      nextField?: { fieldId: string; prompt: string };
      complete: boolean;
    };

    // Process and validate extracted values
    const updates: Array<{
      fieldId: string;
      value: string | number | boolean | string[];
    }> = [];
    let newAnswers = { ...answers };

    if (response.extractedValues) {
      for (const extracted of response.extractedValues) {
        const field = schema.fields.find((f) => f.id === extracted.fieldId);
        if (field) {
          // Type coercion based on field type
          let coercedValue = extracted.value;
          try {
            switch (field.type) {
              case "checkbox":
                coercedValue = Boolean(extracted.value);
                break;
              case "number":
                coercedValue = Number(extracted.value);
                if (isNaN(coercedValue)) coercedValue = extracted.value;
                break;
              case "date":
                if (extracted.value && typeof extracted.value === "string") {
                  const date = new Date(extracted.value);
                  if (!isNaN(date.getTime())) {
                    coercedValue = date.toISOString().split("T")[0]; // YYYY-MM-DD
                  }
                }
                break;
              case "select":
              case "radio":
                if (
                  field.options &&
                  typeof extracted.value === "string" &&
                  !field.options.includes(extracted.value)
                ) {
                  // Try to find closest match
                  const lowercaseValue = extracted.value.toLowerCase();
                  const match = field.options.find((opt) =>
                    opt.toLowerCase().includes(lowercaseValue)
                  );
                  coercedValue = match || extracted.value;
                }
                break;
            }

            updates.push({ fieldId: field.id, value: coercedValue });
            newAnswers = { ...newAnswers, [field.id]: coercedValue };
          } catch (error) {
            console.warn("Type coercion failed for", field.id, error);
            updates.push({ fieldId: field.id, value: extracted.value });
            newAnswers = { ...newAnswers, [field.id]: extracted.value };
          }
        }
      }
    }

    // Validate next field if provided
    let nextField = response.nextField;
    if (nextField && !schema.fields.find((f) => f.id === nextField!.fieldId)) {
      // Invalid field ID, choose first required unanswered field
      const firstUnanswered = unansweredRequired[0];
      if (firstUnanswered) {
        nextField = {
          fieldId: firstUnanswered.id,
          prompt: `What is your ${firstUnanswered.name.toLowerCase()}?`,
        };
      } else {
        nextField = undefined;
      }
    }

    // Check completion status
    const updatedAnsweredFields = Object.keys(newAnswers);
    const stillUnansweredRequired = requiredFields.filter(
      (field) => !updatedAnsweredFields.includes(field.id)
    );
    const isComplete = stillUnansweredRequired.length === 0;

    // Store assistant message
    await saveChatMessage({
      sessionId: currentSessionId,
      role: "assistant",
      content: response.assistant,
    });

    // Store tool message if there were updates
    if (updates.length > 0) {
      await saveChatMessage({
        sessionId: currentSessionId,
        role: "tool",
        content: `Updated fields: ${updates
          .map((u) => `${u.fieldId}=${u.value}`)
          .join(", ")}`,
        toolName: "processFormResponse",
      });
    }

    const chatResponse: ChatResponse = {
      assistant: response.assistant,
      next: nextField,
      updates: updates.length > 0 ? updates : undefined,
      draft: {
        answers: newAnswers,
        meta: {
          isSubmitted: false,
          lastAsked: nextField?.fieldId,
        },
      },
      complete: isComplete,
      sessionId: currentSessionId,
    };

    console.log("✅ Chat response generated:", {
      hasNext: !!nextField,
      updatesCount: updates.length,
      complete: isComplete,
    });

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error("Error processing chat request:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
