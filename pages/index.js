'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from "../components/ui/button";
import { MailOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter(); // For redirection

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[500px] h-[500px] flex flex-col justify-center">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">SIGN-IN WITH GOOGLE WITH YOUR APPINESS EMAIL</CardTitle>
          <CardDescription className="text-gray-600">SIGN-IN WITH US</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center space-y-4 h-full">
          {!session ? (
            <Button
              className="w-64 h-16 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 flex items-center justify-center"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <MailOpen className="mr-2 w-6 h-6" /> Sign in with Google
            </Button>
          ) : (
            <div className="text-center">
              <p className="mb-4">Welcome, {session.user.name}</p>
              <Button
                className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => signOut()}
              >
                <MailOpen className="mr-2 w-6 h-6" /> Sign out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
