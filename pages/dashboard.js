'use client';
import { useSession, signOut } from 'next-auth/react';
import { useAuthStore } from '../stores/authStores';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; 
import { MailOpen } from "lucide-react";
import axios from 'axios';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'authenticated' && !userId) {
      const { name, email } = session.user;
      setUser({ name, email });
      const isAdmin = false;

      axios
        .get(`https://next-auth-backend-bmb9pt0zx-zain-appiness-projects.vercel.app/api/user/email/${email}`, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.data) {
            setUserId(response.data.id);
            console.log("get",response.data.id)
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            axios
              .post('https://next-auth-backend-bmb9pt0zx-zain-appiness-projects.vercel.app/api/user/signup', {
                name,
                email,
                isAdmin,
              })
              .then((signupResponse) => {
                setUserId(signupResponse.data.id);
                console.log("post",signupResponse.data.id)
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

  // Handle query parameter for userId
  useEffect(() => {
    const queryUserId = router.query.userId;
    if (queryUserId && !userId) {
      setUserId(queryUserId);
    }
  }, [router.query.userId, userId]);

  const handleLogout = async () => {
    setUser(null);
    await signOut({ callbackUrl: "/" });
  };

  const handleNavigateToProfile = () => {
    if (userId) {
      router.push(`/profile?userId=${userId}`);
    } else {
      console.error("User ID not found.");
    }
  };

  if (isLoading || status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-[500px] h-[500px] flex flex-col justify-center">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Hello, {session?.user?.name || 'User'}!</CardTitle>
          <CardDescription className="text-gray-600">SIGN-IN AS {session?.user?.name || 'User'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center space-y-4 h-full">
          <Button
            onClick={handleNavigateToProfile}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Profile
          </Button>
          <Button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <MailOpen /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
