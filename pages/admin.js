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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-300 p-8">
      {!isLoggedIn ? (
        <div className="flex flex-col items-center justify-center w-full max-w-sm">
          <Card className="w-full shadow-xl bg-white rounded-xl border-2 border-gray-300">
            <CardHeader className="text-center p-6 bg-cyan-700 text-white rounded-t-xl">
              <CardTitle className="text-2xl font-semibold">Admin Login</CardTitle>
              <p className="text-sm">Use your Appiness email to access the dashboard</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-6 space-y-4">
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <div className="w-full mb-4">
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                onClick={handleLogin}
                className="w-full py-3 bg-cyan-500 text-white text-lg rounded-lg hover:bg-cyan-600"
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8 text-center">Project Management</h1>
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8 border-t-4 border-cyan-500">
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
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <Input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <Input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
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
                <div className="space-x-4">
                  <Button
                    type="submit"
                    className="w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                  >
                    {editingProjectId ? "Update Project" : "Create Project"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">Projects</h2>
            <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-cyan-500">
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 border-b-2 border-gray-300 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-xl font-semibold">{project.name}</h3>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Manager: {project.managerName}
                        </p>
                      </div>
                      <div className="space-x-4">
                        <Button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </Button>
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleDelete(project.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No projects found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
