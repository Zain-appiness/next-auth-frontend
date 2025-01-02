import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../components/ui/select';
import { useRouter } from "next/router";

export default function Admin() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager: "",
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
      console.log("ADMIN res:", response);
      const token = response.data.token;
      const userRole = response.data.user.isAdmin; // boolean value
      localStorage.setItem("jwtToken", token);

      if (!userRole) {
        setErrorMessage("You are not authorized to access this page.");
        setTimeout(() => router.push("/"), 2000);
        return;
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
      [name]:
        name === "teamMembers"
          ? [...e.target.selectedOptions].map((opt) => opt.value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate || "2024-12-11",
        endDate: form.endDate || "2024-12-31",
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
      setForm({ name: "", description: "", manager: "", teamMembers: [] });
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
      manager: project.projectManagerId,
      teamMembers: project.teamMembers.map((member) => member.id),
    });
  };

  return (
    <div className="container mx-auto p-4">
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-lg">
          <h1 className="text-xl font-bold mb-4">Admin Login</h1>
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
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
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
              <Textarea
                name="description"
                placeholder="Project Description"
                value={form.description}
                onChange={handleChange}
                required
              />
              {/* select starts */}

              <div className="mb-4">
              <select
                name="manager"
                value={form.manager}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Manager</option>
                {Array.isArray(users) && users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <select
                name="teamMembers"
                value={form.teamMembers}
                onChange={handleChange}
                multiple
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Team members</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            { /* select ends */}

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
