"use client";

import { useState } from "react";
import {
  testDatabaseConnection,
  createTestUser,
  getAllUsers,
  getAllPosts,
  getPostsWithUsers,
  runFullDatabaseTest,
} from "@/actions/actions";

type TestResult = {
  success: boolean;
  message: string;
  error?: string;
  [key: string]: unknown;
};

export function DatabaseTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ [key: string]: TestResult }>({});

  const runTest = async (
    testName: string,
    testFunction: () => Promise<TestResult>
  ) => {
    setIsLoading(true);
    try {
      console.log(`Running test: ${testName}`);
      const result = await testFunction();
      setResults((prev) => ({
        ...prev,
        [testName]: result,
      }));
      console.log(`Test ${testName} completed:`, result);
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          message: "Test failed with exception",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults({});
  };

  const TestButton = ({
    onClick,
    children,
    variant = "primary",
  }: {
    onClick: () => void;
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger" | "success";
  }) => {
    const baseClasses =
      "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
      primary: "bg-blue-500 hover:bg-blue-600 text-white",
      secondary: "bg-gray-500 hover:bg-gray-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
      success: "bg-green-500 hover:bg-green-600 text-white",
    };

    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {children}
      </button>
    );
  };

  const ResultDisplay = ({ result }: { result: TestResult }) => (
    <div
      className={`p-4 rounded-lg border ${
        result.success
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-lg ${
            result.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {result.success ? "✅" : "❌"}
        </span>
        <span
          className={`font-medium ${
            result.success ? "text-green-800" : "text-red-800"
          }`}
        >
          {result.message}
        </span>
      </div>
      {result.error && (
        <div className="text-red-600 text-sm bg-red-100 p-2 rounded">
          <strong>Error:</strong> {result.error}
        </div>
      )}
      {result.success && Object.keys(result).length > 2 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            View details
          </summary>
          <pre className="mt-2 text-xs bg-black p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(result).filter(
                  ([key]) => !["success", "message", "error"].includes(key)
                )
              ),
              null,
              2
            )}
          </pre>
        </details>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TestButton
          onClick={() => runTest("connection", testDatabaseConnection)}
        >
          Test Connection
        </TestButton>

        <TestButton
          onClick={() => runTest("createUser", () => createTestUser())}
        >
          Create Test User
        </TestButton>

        <TestButton onClick={() => runTest("getAllUsers", getAllUsers)}>
          Get All Users
        </TestButton>

        <TestButton onClick={() => runTest("getAllPosts", getAllPosts)}>
          Get All Posts
        </TestButton>

        <TestButton
          onClick={() => runTest("getPostsWithUsers", getPostsWithUsers)}
        >
          Get Posts with Users
        </TestButton>

        <TestButton
          onClick={() => runTest("fullTest", runFullDatabaseTest)}
          variant="success"
        >
          🚀 Run Full Test
        </TestButton>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <TestButton onClick={clearResults} variant="secondary">
          Clear Results
        </TestButton>

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>Running test...</span>
          </div>
        )}
      </div>

      {/* Results Display */}
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName}>
              <h4 className="font-medium text-gray-700 mb-2 capitalize">
                {testName.replace(/([A-Z])/g, " $1").trim()}:
              </h4>
              <ResultDisplay result={result} />
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Test Connection:</strong> Verify database connectivity
          </li>
          <li>
            • <strong>Create Test User:</strong> Add a test user to the database
          </li>
          <li>
            • <strong>Get All Users/Posts:</strong> Retrieve and display
            existing data
          </li>
          <li>
            • <strong>Get Posts with Users:</strong> Test JOIN operations
          </li>
          <li>
            • <strong>Run Full Test:</strong> Complete end-to-end test (creates,
            reads, then cleans up)
          </li>
        </ul>
      </div>
    </div>
  );
}
