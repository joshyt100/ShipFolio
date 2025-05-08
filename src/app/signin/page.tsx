"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Github } from "lucide-react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If already signed in, send straight to dashboard
  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  // Show a simple loader while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-pulse text-gray-500">Checking authentication…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4 ">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Welcome!</CardTitle>
          <CardDescription className="text-center">
            Sign in with your GitHub account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full flex items-center bg-black text-white hover:bg-black/85 hover:text-white cursor-pointer justify-center"
            onClick={() =>
              signIn("github", { callbackUrl: "/dashboard" }).catch((err) =>
                console.error("GitHub sign-in failed:", err)
              )
            }
          >
            <Github className="mr-2 h-5 w-5 text-white" />
            Continue with GitHub
          </Button>
          {/* <p className="text-xs text-gray-500"> */}
          {/*   We’ll never post without your permission. */}
          {/* </p> */}
        </CardContent>
      </Card>
    </div>
  );
}

