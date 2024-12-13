// pages/dashboard.js
'use client'
import { useSession,signOut } from 'next-auth/react';
import { useAuthStore } from '../stores/authStores';
import axios from 'axios';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session } = useSession();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (session) {
      const { name, email } = session.user;
      setUser({ name, email });

      axios.post('http://localhost:4000/api/users', { name, email }).catch(console.error);
    }
  }, [session, setUser]);

  if (!session) {
    return <p>LOADING......</p>; // Return loading message when session is not available
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <h1 className='text-3xl font-bold mb-4'>
        Hello, {session.user?.name}!
      </h1>
      <button
        onClick={() => signOut({ callbackUrl: '/' })} // Redirect to homepage after sign out
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
