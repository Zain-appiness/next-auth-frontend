'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { MailOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-blue-50">
        <p className="text-lg font-medium text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-light-blue-50">
      {/* Left Section */}
      <div className="flex flex-col justify-between p-8 md:p-16 bg-white shadow-md">
        <div className="flex flex-col items-center justify-center flex-1">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center p-6">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Sign in with Google
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Use your Appiness email to access the dashboard
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
              {!session ? (
                <>
                  <Button
                    className="w-full py-3 bg-cyan-300 text-black text-lg rounded-lg hover:bg-black hover:text-white flex items-center justify-center"
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                  >
                    <MailOpen className="mr-2 h-6 w-6" /> Sign in with Google
                  </Button>
                  <Button
                    className="w-full py-3 bg-white text-cyan-300 text-lg rounded-lg hover:bg-black hover:text-white"
                    onClick={() => router.push('/admin')}
                  >
                    Go to Admin Page
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-800">
                    Welcome, {session.user.name}
                  </p>
                  <Button
                    className="w-full py-3 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 flex items-center justify-center"
                    onClick={() => signOut()}
                  >
                    <MailOpen className="mr-2 h-6 w-6" /> Sign out
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex relative">
        <img
          src="https://media.licdn.com/dms/image/v2/C4D0BAQGpHXmffW4TWw/company-logo_200_200/company-logo_200_200/0/1656923939573/appiness_interactive_pvt_ltd__logo?e=2147483647&v=beta&t=TdpEPbqJKzj1DLuF75aPDmButAOmUAIla1F-lvS1R_8"
          alt="Background"
          className="absolute inset-0 h-full w-full object-cover filter brightness-100 opacity-75"
        />
        <div className="absolute inset-0 bg-light-blue-100 bg-opacity-60"></div>
        <div className="absolute bottom-8 left-8 text-light-blue-900">
          <h1 className="text-3xl font-bold">Welcome to Appiness Interactive Pvt. Ltd.</h1>
          <p className="text-xl mt-2">Project Management Platform</p>
        </div>
      </div>
    </div>
  );
}
