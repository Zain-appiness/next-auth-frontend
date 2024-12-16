'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <h1 className="text-3xl font-bold mb-6">Welcome to the App</h1>
      {!session ? (
        <button
          className="p-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <p>Welcome, {session.user.name}</p>
          <button
            className="p-4 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
