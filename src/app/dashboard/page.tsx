import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getForms } from "@/actions/actions";
import { CreateFormButton } from "./create-form-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Dashboard = async () => {
  const result = await getForms();

  if (!result.success) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Forms
          </h2>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  const { forms } = result;

  return (
    <div className="container mx-auto px-4 py-8">
      <SignedIn>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Forms</h1>
            <CreateFormButton />
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-600 mb-4">
                No forms yet
              </h2>
              <p className="text-gray-500 mb-6">
                Create your first form to get started
              </p>
              <CreateFormButton />
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
              {forms.map((form) => (
                <li
                  key={form.id}
                  className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{form.title}</h2>
                    {form.description && (
                      <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {form.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        Created:{" "}
                        {form.createdAt
                          ? new Date(form.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          form.isPublished
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                        }`}
                      >
                        {form.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 justify-start sm:w-auto sm:justify-end">
                    <Button className="w-full sm:w-auto" variant="outline">
                      <Link href={`/f/${form.slug}`}>View Form</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Please sign in to view your dashboard
            </h2>
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default Dashboard;
