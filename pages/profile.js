import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Profile() {
  const { data: session, status } = useSession();
  const [userProjects, setUserProjects] = useState([]);
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId'); // Extract userId from query params

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
  
    if (status === 'authenticated' && userId) {
      const login = async (email) => {
        try {
          console.log("Logging in with email:", email);
          const response = await axios.post("https://next-auth-backend-ln9ncq7j9-zain-appiness-projects.vercel.app/api/user/login", { email });
          const token = response.data.token;
          console.log(token);
          localStorage.setItem("jwtToken", token);
          console.log("Login successful");
        } catch (error) {
          console.error("Login failed:", error);
        }
      };
  
      const email = session?.user?.email;
      if (email) {
        login(email);
      } else {
        console.error("Email not available");
      }
  
      const fetchProfileData = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!userId) {
          console.error("User ID is missing");
          return;
        }
        
        try {
          console.log(`Fetching profile for userId: ${userId}`);
          const response = await axios.get(`https://next-auth-backend-ln9ncq7j9-zain-appiness-projects.vercel.app/api/project/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Profile data:", response.data);
          setUserProjects(response.data.teamProjects);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
  
      fetchProfileData();
    } else if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, userId, router]);
  

  const renderUserInitials = (name) => {
    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
      : 'U';
    return <div className="w-16 h-16 bg-gray-300 flex items-center justify-center rounded-full text-xl font-bold text-white">{initials}</div>;
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 space-y-8">
      {/* User Profile Card */}
      <Card className="w-[500px] p-4">
        <CardHeader className="flex items-center space-x-4">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            renderUserInitials(userData?.name || session.user.name)
          )}
          <div>
            <CardTitle>{userData?.name || session.user.name || 'User'}</CardTitle>
            <CardDescription>{userData?.email || session.user.email || 'No Email'}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* User Projects */}
      <Card className="w-[500px] p-4">
        <CardHeader>
          <CardTitle className="text-xl">Assigned Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {userProjects.length > 0 ? (
            <ul className="space-y-2">
              {userProjects.map((project) => (
                <li
                  key={project.id}
                  className="p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                  onClick={() => router.push(`/projects/${project.id}?userId=${userId}`)}
                >
                  <div className="font-semibold">{project.name}</div>
                  <div>Start Date: {new Date(project.startDate).toLocaleDateString()}</div>
                  <div>End Date: {new Date(project.endDate).toLocaleDateString()}</div>
                  <div>Project Manager: {project.projectManager.name}</div>
                  <div>
                    Project Members:
                    {project.teamMembers.length > 0 ? (
                      <ul className="space-y-1 mt-1">
                        {project.teamMembers.map((member) => (
                          <li key={member.id} className="text-sm text-black-800">
                            {member.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>No Members</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No projects assigned yet.</p>
          )}
        </CardContent>

      </Card>
    </div>
  );
}
