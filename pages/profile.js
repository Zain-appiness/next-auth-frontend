import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession,signOut} from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Profile = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = router.query.userId || session?.user?.id;
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const email = router.query.email;
  const [userProjects, setUserProjects] = useState([]);
  const [userData, setUserData] = useState(null);

  // Handle login
  useEffect(() => {
    const handleLogin = async () => {
      try {
        if (!email) {
          console.error("Email is missing for login.");
          return;
        }

        const res = await axios.post(`${BACKEND_URL}/api/user/login`, {
          email,
        });

        console.log("User res:", res);
        const token = res.data.token;
        localStorage.setItem("jwtToken", token);
      } catch (error) {
        console.error("Error Login:", error);
      }
    };

    if (email) {
      handleLogin();
    }
  }, [email, BACKEND_URL]);

  const getToken = () => localStorage.getItem("jwtToken");

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      const token = getToken();
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

      try {
        console.log(`Fetching profile for userId: ${userId}`);
        const response = await axios.get(`${BACKEND_URL}/api/project/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Profile data:", response.data);

        const allProjects = [
          ...(response.data.managedProjects || []),
          ...(response.data.teamProjects || []),
        ];

        setUserProjects(allProjects);
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, BACKEND_URL]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };


  return (
    <div className="flex h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <aside className="w-64 bg-cyan-300 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-black mb-6">Navigation</h2>
          <ul className="space-y-4 text-black">
            <li
              className="cursor-pointer hover:bg-white hover:text-blacke p-2 rounded"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </li>
            <li
              className="cursor-pointer hover:bg-white hover:text-blacke p-2 rounded"
              onClick={() => router.push("/profile")}
            >
              Profile
            </li>
            <li
              className="cursor-pointer hover:bg-white hover:text-blacke p-2 rounded"
              onClick={() => router.push("/profile")}
            >
              Projects
            </li>
          </ul>
        </div>
        <div>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded  hover:bg-white hover:text-black"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* User Profile Card */}
        <Card className="mb-6 font-semibold bg-cyan-300 text-white">
          <CardHeader>
            <CardTitle>{userData?.name || session?.user?.name || "User"}</CardTitle>
            <CardDescription>{userData?.email || session?.user?.email || "No Email"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Welcome to your profile page!</p>
          </CardContent>
        </Card>

        {/* User Projects */}
        <h2 className="text-2xl font-semibold text-cyan-300 mb-4">Your Projects</h2>
        {userProjects.length > 0 ? (
          <ul className="space-y-4">
            {userProjects.map((project) => (
              <li
                key={project.id}
                className="p-4 bg-cyan-300 rounded cursor-pointer hover:bg-black hover:text-white text-white"
                onClick={() =>
                  router.push(
                    `/projects/${project.id}?userId=${userId}&projectName=${encodeURIComponent(
                      project.name
                    )}`
                  )
                }
              >
                <div className="font-semibold text-lg">{project.name}</div>
                <div>Start Date: {new Date(project.startDate).toLocaleDateString()}</div>
                <div>End Date: {new Date(project.endDate).toLocaleDateString()}</div>
                <div>Project Manager: {project.projectManager.name}</div>
                <div>
                  Project Members:
                  {project.teamMembers.length > 0 ? (
                    <ul className="ml-4 space-y-1 mt-2">
                      {project.teamMembers.map((member) => (
                        <li key={member.id} className="text-sm">
                          {member.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-black"> No Members</span>
                  )}
                </div>
                {project.projectManager.id === userId && (
                  <div className="text-green-300 text-sm mt-2 font-medium">
                    You are the project manager.
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-black">You have no projects assigned.</p>
        )}
      </main>
    </div>
  );
};

export default Profile;
