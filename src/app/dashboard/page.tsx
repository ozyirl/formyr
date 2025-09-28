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
            <div className="grid gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold mb-2">
                        {form.title}
                      </h2>
                      {form.description && (
                        <p className="text-gray-600 mb-4">{form.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Created:{" "}
                          {form.createdAt
                            ? new Date(form.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            form.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {form.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button className="w-full" variant="outline">
                        <Link href={`/f/${form.slug}`} className="">
                          View Form
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
