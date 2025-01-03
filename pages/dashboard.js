'use client';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '../stores/authStores';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && !userId) {
      const { name, email } = session.user;
      setUser({ name, email });
      const isAdmin = false;

      axios
        .get(`${BACKEND_URL}/api/user/email/${email}`, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.data) {
            setUserId(response.data.id);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            axios
              .post(`${BACKEND_URL}/api/user/signup`, {
                name,
                email,
                isAdmin,
              })
              .then((signupResponse) => {
                setUserId(signupResponse.data.id);
              })
              .catch((err) => console.error('Error storing user data:', err));
          } else {
            console.error('Error checking user data:', error);
          }
        })
        .finally(() => setIsLoading(false));
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, session, setUser, router]);

  useEffect(() => {
    const queryUserId = router.query.userId;
    if (queryUserId && !userId) {
      setUserId(queryUserId);
    }
  }, [router.query.userId, userId]);


  const handleNavigateToProfile = () => {
    const user = useAuthStore.getState().user;
    const email = user?.email;
    if (userId && email) {
      router.push(`/profile?userId=${userId}&email=${encodeURIComponent(email)}`);
    } else {
      console.error('User ID not found.');
    }
  };

  if (isLoading || status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300">
      <img
        src="https://media.licdn.com/dms/image/v2/C4D0BAQGpHXmffW4TWw/company-logo_200_200/company-logo_200_200/0/1656923939573/appiness_interactive_pvt_ltd__logo?e=2147483647&v=beta&t=TdpEPbqJKzj1DLuF75aPDmButAOmUAIla1F-lvS1R_8"
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-white bg-opacity-70">
      <Card className="relative z-10 w-full max-w-md p-8 shadow-xl bg-white rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-cyan-300">
            Welcome, {session?.user?.name || 'User'}!
          </CardTitle>
          <CardDescription className="text-gray-700">
            You are authenticated by your email: {session?.user?.email}.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6 space-y-6">
          <Button
            onClick={handleNavigateToProfile}
            className="w-full py-3 text-lg bg-cyan-400 text-black rounded-lg  hover:bg-black hover:text-white"
          >
            View Your Projects
          </Button>
          
        </CardContent>
      </Card>
      </div>
    </div>
  );
}