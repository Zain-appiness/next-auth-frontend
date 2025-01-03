import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
export default function Admin() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    manager: "",
    managerName: "",
    teamMembers: [],
  });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
      fetchUsers();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/user/login`, {
        email,
      });
      const token = response.data.token;
      const userRole = response.data.user.isAdmin; // boolean value
      localStorage.setItem("jwtToken", token);

      if (!userRole) {
        setErrorMessage("You are not authorized to access this page.");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setIsLoggedIn(true);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setErrorMessage("Access forbidden. Redirecting to home...");
        setTimeout(() => router.push("/"), 2000);
      } else {
        console.error("Login failed:", error);
      }
    }
  };

  const getToken = () => localStorage.getItem("jwtToken");

  const fetchProjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_URL}/api/user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        projectManagerId: form.manager,
        teamMemberIds: form.teamMembers.map((id) => parseInt(id)),
      };

      if (editingProjectId) {
        await axios.put(
          `${BACKEND_URL}/api/project/${editingProjectId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Project updated successfully!");
        setEditingProjectId(null);
      } else {
        await axios.post(`${BACKEND_URL}/api/project`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Project created successfully!");
      }
      setForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        manager: "",
        teamMembers: [],
      });
      fetchProjects();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getToken();
      await axios.delete(`${BACKEND_URL}/api/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Project deleted successfully!");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = (project) => {
    setEditingProjectId(project.id);
    setForm({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      manager: project.projectManagerId,
      managerName: project.managerName,
      teamMembers: project.teamMembers.map((member) => member.id),
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300">
      
      {!isLoggedIn ? (
         <div className="flex flex-col items-center justify-center flex-1">
         <Card className="w-full max-w-md shadow-lg bg-white rounded-xl border-2 border-black">
           <CardHeader className="text-center p-6">
             <CardTitle className="text-2xl font-semibold text-cyan-700">
               Admin Login
             </CardTitle>
             <p className="text-sm text-gray-500 mt-2">
               Use your Appiness email to access the dashboard
             </p>
           </CardHeader>
           <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="mb-4">
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button onClick={handleLogin}  className="w-full py-3 bg-cyan-300 text-black text-lg rounded-lg hover:bg-black hover:text-white flex items-center justify-center">
            Login
          </Button>
           </CardContent>
         </Card>
        
       </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Project Management</h1>
          <div className="mb-8 p-4 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingProjectId ? "Edit Project" : "Create Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="name"
                placeholder="Project Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <label className="block mb-2">Start Date</label>
              <Input
                type="date"
                name="startDate"
                placeholder="Start Date"
                value={form.startDate || ""}
                onChange={handleChange}
                required
              />
              <label className="block mb-2">End Date</label>
              <Input
                type="date"
                name="endDate"
                placeholder="End Date"
                value={form.endDate || ""}
                onChange={handleChange}
                required
              />
              <Select
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
                value={
                  form.manager
                    ? { value: form.manager, label: form.managerName }
                    : null
                }
                onChange={(selectedOption) => {
                  setForm((prevForm) => ({
                    ...prevForm,
                    manager: selectedOption.value,
                    managerName: selectedOption.label,
                  }));
                }}
                placeholder="Select Manager"
              />
              <Select
                isMulti
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
                value={form.teamMembers.map((id) => ({
                  value: id,
                  label: users.find((user) => user.id === id)?.name,
                }))}
                onChange={(selectedOptions) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    teamMembers: selectedOptions.map((option) => option.value),
                  }))
                }
                placeholder="Select Team Members"
              />
              <Button type="submit" className="w-full">
                {editingProjectId ? "Update Project" : "Create Project"}
              </Button>
              {editingProjectId && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingProjectId(null)}
                >
                  Cancel
                </Button>
              )}
            </form>
          </div>
          <h2 className="text-xl font-bold mb-4">Project List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border border-gray-300 rounded-lg">
                <h3 className="text-lg font-bold">{project.name}</h3>
                <p>{project.description}</p>
                <p>Manager: {project.managerName}</p>
                <p>
                  Team Members:{" "}
                  {project.teamMembers.map((member) => member.name).join(", ")}
                </p>
                <div className="space-x-2 mt-4">
                  <Button onClick={() => handleEdit(project)} variant="outline">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(project.id)} variant="destructive">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
