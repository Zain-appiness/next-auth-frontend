import { useSession, signOut } from 'next-auth/react';
import { useAuthStore } from '../stores/authStores'; 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MailOpen } from "lucide-react";
import axios from 'axios';
import {Button} from '../components/ui/button';
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

  
  useEffect(() => {
    if (status === 'loading') {
      return; 
    }

    if (status === 'authenticated') {
      const { name, email } = session.user;
      setUser({ name, email })

     
      axios
        .get(`http://localhost:4000/api/users/users/${email}`) 
        .then((response) => {
          if (response.data) {
            router.push('/dashboard'); 
          } else {

            axios
              .post('http://localhost:4000/api/users', { name, email })
              .then(() => {
                router.push('/dashboard');
              })
              .catch((err) => console.error('Error storing user data:', err));
          }
        })
        .catch((err) => console.error('Error checking user data:', err));
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, session, setUser, router]);

  const handleLogout = async () => {
    setUser(null);
    await signOut({ callbackUrl: "/" }); 
  };

  if (status === 'loading') {
    return <p>Loading...</p>; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
       <Card className="w-[500px] h-[500px] flex flex-col justify-center">
       <CardHeader className="text-center">
          <CardTitle className="text-xl"> Hello, {session?.user?.name || 'User'}!</CardTitle>
          <CardDescription className="text-gray-600">SIGN-IN AS {session?.user?.name || 'User'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center items-center space-y-4 h-full">
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
