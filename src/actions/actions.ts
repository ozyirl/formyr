"use server";

import { db } from "@/db";
import {
  usersTable,
  postsTable,
  type InsertUser,
  type InsertPost,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function testDatabaseConnection() {
  try {
    console.log("🔄 Testing database connection...");

    // Test basic connection by querying users table
    const users = await db.select().from(usersTable).limit(1);
    console.log("✅ Database connection successful!");

    return {
      success: true,
      message: "Database connection is working!",
      userCount: users.length,
    };
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createTestUser(userData?: Partial<InsertUser>) {
  try {
    console.log("🔄 Creating test user...");

    const testUser: InsertUser = {
      name: userData?.name || "Test User",
      age: userData?.age || 25,
      email: userData?.email || `test.user.${Date.now()}@example.com`,
    };

    const [newUser] = await db.insert(usersTable).values(testUser).returning();
    console.log("✅ Test user created:", newUser);

    return {
      success: true,
      message: "Test user created successfully!",
      user: newUser,
    };
  } catch (error) {
    console.error("❌ Failed to create test user:", error);
    return {
      success: false,
      message: "Failed to create test user",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createTestPost(
  userId: number,
  postData?: Partial<InsertPost>
) {
  try {
    console.log("🔄 Creating test post...");

    const testPost: InsertPost = {
      title: postData?.title || "Test Post Title",
      content:
        postData?.content ||
        "This is a test post content to verify the database is working correctly.",
      userId,
    };

    const [newPost] = await db.insert(postsTable).values(testPost).returning();
    console.log("✅ Test post created:", newPost);

    return {
      success: true,
      message: "Test post created successfully!",
      post: newPost,
    };
  } catch (error) {
    console.error("❌ Failed to create test post:", error);
    return {
      success: false,
      message: "Failed to create test post",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllUsers() {
  try {
    console.log("🔄 Fetching all users...");

    const users = await db.select().from(usersTable);
    console.log(`✅ Found ${users.length} users`);

    return {
      success: true,
      message: `Retrieved ${users.length} users`,
      users,
    };
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    return {
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllPosts() {
  try {
    console.log("🔄 Fetching all posts...");

    const posts = await db.select().from(postsTable);
    console.log(`✅ Found ${posts.length} posts`);

    return {
      success: true,
      message: `Retrieved ${posts.length} posts`,
      posts,
    };
  } catch (error) {
    console.error("❌ Failed to fetch posts:", error);
    return {
      success: false,
      message: "Failed to fetch posts",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getPostsWithUsers() {
  try {
    console.log("🔄 Fetching posts with user data...");

    const postsWithUsers = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        content: postsTable.content,
        createdAt: postsTable.createdAt,
        updatedAt: postsTable.updatedAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          age: usersTable.age,
        },
      })
      .from(postsTable)
      .innerJoin(usersTable, eq(postsTable.userId, usersTable.id));

    console.log(`✅ Found ${postsWithUsers.length} posts with user data`);

    return {
      success: true,
      message: `Retrieved ${postsWithUsers.length} posts with user data`,
      postsWithUsers,
    };
  } catch (error) {
    console.error("❌ Failed to fetch posts with users:", error);
    return {
      success: false,
      message: "Failed to fetch posts with users",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteTestUser(userId: number) {
  try {
    console.log(`🔄 Deleting test user with ID: ${userId}...`);

    // Posts will be automatically deleted due to cascade delete
    await db.delete(usersTable).where(eq(usersTable.id, userId));
    console.log("✅ Test user and associated posts deleted");

    return {
      success: true,
      message: "Test user deleted successfully!",
    };
  } catch (error) {
    console.error("❌ Failed to delete test user:", error);
    return {
      success: false,
      message: "Failed to delete test user",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function runFullDatabaseTest() {
  try {
    console.log("🚀 Starting full database test...");

    // 1. Test connection
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      throw new Error(connectionTest.message);
    }

    // 2. Create test user
    const userResult = await createTestUser({
      name: "Database Test User",
      age: 30,
      email: `db.test.${Date.now()}@example.com`,
    });

    if (!userResult.success || !userResult.user) {
      throw new Error(userResult.message);
    }

    // 3. Create test post
    const postResult = await createTestPost(userResult.user.id, {
      title: "Database Test Post",
      content:
        "This post was created during a full database test to verify all operations are working correctly.",
    });

    if (!postResult.success) {
      throw new Error(postResult.message);
    }

    // 4. Fetch data to verify
    const usersResult = await getAllUsers();
    const postsResult = await getAllPosts();
    const postsWithUsersResult = await getPostsWithUsers();

    // 5. Clean up test data
    await deleteTestUser(userResult.user.id);

    console.log("✅ Full database test completed successfully!");

    return {
      success: true,
      message:
        "Full database test passed! All operations are working correctly.",
      results: {
        connection: connectionTest,
        userCreation: userResult,
        postCreation: postResult,
        usersFetch: usersResult,
        postsFetch: postsResult,
        joinedDataFetch: postsWithUsersResult,
      },
    };
  } catch (error) {
    console.error("❌ Full database test failed:", error);
    return {
      success: false,
      message: "Full database test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
