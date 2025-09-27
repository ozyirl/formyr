import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { DatabaseTestComponent } from "./DatabaseTestComponent";

const Dashboard = () => {
  return (
    <>
      <SignedIn>
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <UserButton />
          </div>

          <div className="grid gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Database Testing</h2>
              <p className="text-black mb-4">
                Test your database connection and operations to ensure
                everything is working correctly.
              </p>
              <DatabaseTestComponent />
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">
              Welcome to MLH Frontend
            </h1>
            <div className="space-x-4 text-center">
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
};

export default Dashboard;
