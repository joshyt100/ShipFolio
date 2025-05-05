"use client";

import { signIn } from "next-auth/react";
import { Button } from "../../components/ui/button"; // assuming you're using Shadcn or similar
//import github
import { Github } from "lucide-react";


export default function SignInPage() {
  const handleSignIn = () => {
    signIn("github", { callbackUrl: "/dashboard" }).catch((err) => {
      console.error("GitHub sign-in failed:", err);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-32  gap-6 bg-background px-4">
      <h1 className="text-3xl font-bold">Sign In</h1>
      <Button
        onClick={handleSignIn}
        className="bg-black text-white px-10 py-5 hover:bg-black/80 "
      >
        <Github className="mr-2 h-4 w-4" />
        Sign in with GitHub
      </Button>
    </main>
  );
}
