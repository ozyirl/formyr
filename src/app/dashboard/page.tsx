import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Dashboard = () => {
  return (
    <>
      <SignedIn>
        <div>
          <h1>Dashboard</h1>
        </div>
      </SignedIn>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
    </>
  );
};

export default Dashboard;
