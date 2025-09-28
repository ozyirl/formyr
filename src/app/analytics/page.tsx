"use client";

import { useEffect, useState } from "react";
import {
  getAllResponsesSentimentAnalysis,
  SentimentAnalysis,
  getMostPopularForm,
  PopularForm,
} from "@/actions/actions";
import Link from "next/link";

const Analytics = () => {
  const [sentimentData, setSentimentData] = useState<SentimentAnalysis | null>(
    null
  );
  const [popularForm, setPopularForm] = useState<PopularForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [sentimentResult, popularFormResult] = await Promise.all([
          getAllResponsesSentimentAnalysis(),
          getMostPopularForm(),
        ]);

        if (sentimentResult.success && sentimentResult.analysis) {
          setSentimentData(sentimentResult.analysis);
        } else {
          setError(
            sentimentResult.error || "Failed to load sentiment analysis"
          );
        }

        if (popularFormResult.success && popularFormResult.form) {
          setPopularForm(popularFormResult.form);
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  const getSentimentColor = (
    sentiment: "positive" | "neutral" | "negative"
  ) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50 border-green-200";
      case "negative":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Insights and analytics for all your form responses
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading analytics
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : sentimentData ? (
        <div className="grid gap-6">
          {/* Sentiment Analysis Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sentiment Analysis
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {sentimentData.totalResponses} total responses
              </div>
            </div>

            {sentimentData.totalResponses === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No responses to analyze yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Create a form and start collecting responses to see sentiment
                  analysis
                </p>
              </div>
            ) : (
              <>
                {/* Sentiment Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div
                    className={`rounded-lg border p-4 ${getSentimentColor(
                      "positive"
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Positive</p>
                        <p className="text-2xl font-bold">
                          {sentimentData.positive}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {formatPercentage(
                            sentimentData.positive,
                            sentimentData.totalResponses
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg border p-4 ${getSentimentColor(
                      "neutral"
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Neutral</p>
                        <p className="text-2xl font-bold">
                          {sentimentData.neutral}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {formatPercentage(
                            sentimentData.neutral,
                            sentimentData.totalResponses
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg border p-4 ${getSentimentColor(
                      "negative"
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Negative</p>
                        <p className="text-2xl font-bold">
                          {sentimentData.negative}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {formatPercentage(
                            sentimentData.negative,
                            sentimentData.totalResponses
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Average Sentiment Score */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Average Sentiment Score
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Range: -1.0 (very negative) to +1.0 (very positive)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {sentimentData.averageScore.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {sentimentData.averageScore > 0.1
                          ? "Positive"
                          : sentimentData.averageScore < -0.1
                          ? "Negative"
                          : "Neutral"}
                      </p>
                    </div>
                  </div>

                  {/* Score bar visualization */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          sentimentData.averageScore > 0
                            ? "bg-green-500"
                            : sentimentData.averageScore < 0
                            ? "bg-red-500"
                            : "bg-gray-400"
                        }`}
                        style={{
                          width: `${
                            Math.abs(sentimentData.averageScore) * 50 + 50
                          }%`,
                          marginLeft:
                            sentimentData.averageScore < 0
                              ? `${
                                  50 - Math.abs(sentimentData.averageScore) * 50
                                }%`
                              : "50%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Most Popular Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Most Popular Form
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                By submissions
              </div>
            </div>

            {!popularForm ? (
              <div className="text-center py-8">
                <div className="text-gray-400 dark:text-gray-500 mb-2">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No forms created yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Create your first form to see popularity statistics
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {popularForm.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Created on{" "}
                      {popularForm.createdAt
                        ? new Date(popularForm.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {popularForm.submissionCount}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          submissions
                        </p>
                      </div>
                      <div className="text-blue-500 dark:text-blue-400">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Link
                    href={`/f/${popularForm.slug}`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Form
                  </Link>
                  <Link
                    href={`/f/${popularForm.slug}?tab=responses`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    View Responses
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Analytics;
