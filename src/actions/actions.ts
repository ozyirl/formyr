"use server";

import { db } from "@/db";
import { forms, chatSessions, chatMessages, submissions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { desc } from "drizzle-orm";

export interface FormData {
  title: string;
  description: string;
  fields: Array<{
    id: string;
    name: string;
    type:
      | "text"
      | "email"
      | "number"
      | "textarea"
      | "select"
      | "checkbox"
      | "radio"
      | "date"
      | "file";
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  submitText: string;
  successMessage: string;
}

export interface ChatSessionData {
  userId: string;
  formId?: number;
  title?: string;
}

export interface ChatMessageData {
  sessionId: number;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolName?: string;
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() +
    "-" +
    Date.now()
  );
}

export async function saveForm(formData: FormData, userId?: string) {
  try {
    console.log("🗄️ saveForm called with:", formData);
    console.log("🔌 DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log(
      "🔌 DATABASE_URL value:",
      process.env.DATABASE_URL ? "***configured***" : "undefined"
    );

    let currentUserId = userId;
    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      currentUserId = authUserId;
    }

    console.log("👤 Using userId:", currentUserId);

    const slug = generateSlug(formData.title);
    console.log("🔗 Generated slug:", slug);

    try {
      console.log("🧪 Testing database connection...");
      await db.select().from(forms).limit(1);
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      throw new Error(`Database connection error: ${dbError}`);
    }

    const [savedForm] = await db
      .insert(forms)
      .values({
        slug,
        title: formData.title,
        description: formData.description,
        schemaJson: formData,
        isPublished: true,
        userId: currentUserId,
      })
      .returning();

    console.log("✅ Form inserted into database:", savedForm);

    return {
      success: true,
      form: savedForm,
      url: `/form/${slug}`,
    };
  } catch (error) {
    console.error("Error saving form:", error);
    return {
      success: false,
      error: "Failed to save form to database",
    };
  }
}

export async function getForms(userId?: string) {
  try {
    let currentUserId = userId;
    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      currentUserId = authUserId;
    }

    const userForms = await db
      .select()
      .from(forms)
      .where(eq(forms.userId, currentUserId))
      .orderBy(desc(forms.createdAt));

    return {
      success: true,
      forms: userForms,
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch forms",
      forms: [],
    };
  }
}

export async function createChatSession(sessionData: ChatSessionData) {
  try {
    console.log("💬 createChatSession called with:", sessionData);

    const [savedSession] = await db
      .insert(chatSessions)
      .values({
        userId: sessionData.userId,
        formId: sessionData.formId,
        title: sessionData.title,
      })
      .returning();

    console.log("✅ Chat session created:", savedSession);

    return {
      success: true,
      session: savedSession,
    };
  } catch (error) {
    console.error("Error creating chat session:", error);
    return {
      success: false,
      error: "Failed to create chat session",
    };
  }
}

export async function updateChatSessionWithForm(
  sessionId: number,
  formId: number
) {
  try {
    console.log("🔗 Updating session", sessionId, "with form ID", formId);

    const [updatedSession] = await db
      .update(chatSessions)
      .set({ formId })
      .where(eq(chatSessions.id, sessionId))
      .returning();

    console.log("✅ Session updated with form:", updatedSession);

    return {
      success: true,
      session: updatedSession,
    };
  } catch (error) {
    console.error("Error updating chat session with form:", error);
    return {
      success: false,
      error: "Failed to update chat session",
    };
  }
}

export async function saveChatMessage(messageData: ChatMessageData) {
  try {
    console.log("💬 saveChatMessage called with:", messageData);

    const [savedMessage] = await db
      .insert(chatMessages)
      .values({
        sessionId: messageData.sessionId,
        role: messageData.role,
        content: messageData.content,
        toolName: messageData.toolName,
      })
      .returning();

    console.log("✅ Chat message saved:", savedMessage);

    return {
      success: true,
      message: savedMessage,
    };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return {
      success: false,
      error: "Failed to save chat message",
    };
  }
}

export async function saveChatMessages(messages: ChatMessageData[]) {
  try {
    console.log("💬 saveChatMessages called with", messages.length, "messages");

    const savedMessages = await db
      .insert(chatMessages)
      .values(messages)
      .returning();

    console.log("✅ Chat messages saved:", savedMessages.length, "messages");

    return {
      success: true,
      messages: savedMessages,
    };
  } catch (error) {
    console.error("Error saving chat messages:", error);
    return {
      success: false,
      error: "Failed to save chat messages",
    };
  }
}

export async function getChatMessagesByFormSlug(slug: string) {
  try {
    console.log("💬 getChatMessagesByFormSlug called with slug:", slug);

    // Get current user
    const { userId } = await auth();
    if (!userId) {
      console.log("❌ User not authenticated");
      return {
        success: false,
        error: "User not authenticated",
        messages: [],
      };
    }

    console.log("👤 Current user:", userId);

    // Step 1: Find the form by slug
    const [form] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.slug, slug));

    if (!form) {
      console.log("❌ Form not found for slug:", slug);
      return {
        success: false,
        error: "Form not found",
        messages: [],
      };
    }

    const formId = form.id;
    console.log("📋 Found form with ID:", formId);

    // Step 2: Find chat sessions for this form owned by current user
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(
        and(eq(chatSessions.formId, formId), eq(chatSessions.userId, userId))
      )
      .orderBy(desc(chatSessions.createdAt));

    console.log("📋 Found", sessions.length, "sessions for user", userId);

    if (sessions.length === 0) {
      console.log("❌ No sessions found for form", formId, "and user", userId);
      return {
        success: true,
        messages: [],
      };
    }

    // Step 3: Get the latest session and load all its messages
    const latestSession = sessions[0];
    const sessionId = latestSession.id;
    console.log("📋 Using latest session ID:", sessionId);

    const messages = await db
      .select({
        id: chatMessages.id,
        sessionId: chatMessages.sessionId,
        role: chatMessages.role,
        content: chatMessages.content,
        toolName: chatMessages.toolName,
        createdAt: chatMessages.createdAt,
        sessionTitle: chatSessions.title,
      })
      .from(chatMessages)
      .leftJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.id))
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);

    console.log(
      "✅ Retrieved",
      messages.length,
      "messages for session",
      sessionId
    );

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error fetching chat messages by slug:", error);
    return {
      success: false,
      error: "Failed to fetch chat messages",
      messages: [],
    };
  }
}

export async function getChatMessagesByFormId(formId: number) {
  try {
    console.log("💬 getChatMessagesByFormId called with formId:", formId);

    // First get all chat sessions for this form
    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.formId, formId))
      .orderBy(desc(chatSessions.createdAt));

    console.log("📋 Found", sessions.length, "sessions for form", formId);

    if (sessions.length === 0) {
      console.log("❌ No sessions found for form", formId);
      return {
        success: true,
        messages: [],
      };
    }

    // Get all messages for the latest session of this form
    const latestSessionId = sessions[0].id;

    const messages = await db
      .select({
        id: chatMessages.id,
        sessionId: chatMessages.sessionId,
        role: chatMessages.role,
        content: chatMessages.content,
        toolName: chatMessages.toolName,
        createdAt: chatMessages.createdAt,
        sessionTitle: chatSessions.title,
      })
      .from(chatMessages)
      .leftJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.id))
      .where(eq(chatMessages.sessionId, latestSessionId))
      .orderBy(chatMessages.createdAt);

    console.log("✅ Retrieved", messages.length, "messages for form", formId);

    return {
      success: true,
      messages,
    };
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return {
      success: false,
      error: "Failed to fetch chat messages",
      messages: [],
    };
  }
}

export async function getFormSubmissions(formSlug: string, userId?: string) {
  try {
    let currentUserId = userId;
    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      currentUserId = authUserId;
    }

    // First verify the form belongs to the current user
    const [form] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(and(eq(forms.slug, formSlug), eq(forms.userId, currentUserId)));

    if (!form) {
      return {
        success: false,
        error: "Form not found or access denied",
        submissions: [],
      };
    }

    // Get all submissions for this form
    const formSubmissions = await db
      .select({
        id: submissions.id,
        data: submissions.data,
        submittedAt: submissions.submittedAt,
        ipAddress: submissions.ipAddress,
      })
      .from(submissions)
      .where(eq(submissions.formId, form.id))
      .orderBy(desc(submissions.submittedAt));

    return {
      success: true,
      submissions: formSubmissions,
    };
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return {
      success: false,
      error: "Failed to fetch submissions",
      submissions: [],
    };
  }
}

export async function getFormResponses(formSlug: string, userId?: string) {
  try {
    console.log("🔍 getFormResponses called with slug:", formSlug);
    let currentUserId = userId;
    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      currentUserId = authUserId;
    }

    // First verify the form belongs to the current user and get form details
    const [form] = await db
      .select({
        id: forms.id,
        title: forms.title,
        schemaJson: forms.schemaJson,
      })
      .from(forms)
      .where(and(eq(forms.slug, formSlug), eq(forms.userId, currentUserId)));

    if (!form) {
      return {
        success: false,
        error: "Form not found or access denied",
        responses: [],
        form: null,
      };
    }

    // Get all responses for this form
    const formResponses = await db
      .select({
        id: submissions.id,
        data: submissions.data,
        submittedAt: submissions.submittedAt,
        ipAddress: submissions.ipAddress,
      })
      .from(submissions)
      .where(eq(submissions.formId, form.id))
      .orderBy(desc(submissions.submittedAt));

    return {
      success: true,
      responses: formResponses,
      form: {
        id: form.id,
        title: form.title,
        schema: form.schemaJson,
      },
    };
  } catch (error) {
    console.error("Error fetching form responses:", error);
    return {
      success: false,
      error: "Failed to fetch responses",
      responses: [],
      form: null,
    };
  }
}
