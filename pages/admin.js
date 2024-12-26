"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Admin() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager: "",
    teamMembers: [], // This should handle an array of selected team members
  });
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProjects();
      fetchUsers();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://next-auth-backend-7n6yw8lzw-zain-appiness-projects.vercel.app/api/user/login", {
        email,
      });
      const token = response.data.token;
      localStorage.setItem("jwtToken", token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const getToken = () => localStorage.getItem("jwtToken");

  const fetchProjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get("https://next-auth-backend-7n6yw8lzw-zain-appiness-projects.vercel.app/api/project", {
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
      const response = await axios.get("https://next-auth-backend-7n6yw8lzw-zain-appiness-projects.vercel.app/api/user/", {
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
          ? [...e.target.selectedOptions].map((opt) => opt.value) // Handle multiple selections
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const payload={
        name: form.name,
        startDate: form.startDate || "2024-12-11",
        endDate: form.endDate || "2024-12-31",
        projectManagerId: form.manager,
        teamMemberIds: form.teamMembers.map((id) => parseInt(id)),
      };
      
      if (editingProjectId) {
        await axios.put(
          `https://next-auth-backend-7n6yw8lzw-zain-appiness-projects.vercel.app/api/project/${editingProjectId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Project updated successfully!");
        setEditingProjectId(null);
      } else {
        await axios.post("https://next-auth-backend-7n6yw8lzw-zain-appiness-projects.vercel.app/api/project", payload, {
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
      await axios.delete(`https://next-auth-backend-7n6yw8lzw-zain-appiness-projects.vercel.app/api/project/${id}`, {
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
      manager: project.projectManagerId, // Make sure manager is stored as ID
      teamMembers: project.teamMembers.map((member) => member.id), // Store only IDs for teamMembers
    });
  };

  return (
    <div className="container mx-auto p-4">
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-lg">
          <h1 className="text-xl font-bold mb-4">Admin Login</h1>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full p-2 bg-blue-500 text-white rounded-lg"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">Project Management</h1>
          <div className="mb-8 p-4 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {editingProjectId ? "Edit Project" : "Create Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Project Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  name="description"
                  placeholder="Project Description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
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
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full p-2 bg-blue-500 text-white rounded-lg"
              >
                {editingProjectId ? "Update Project" : "Create Project"}
              </button>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
                  className="w-full p-2 border border-gray-300 rounded-lg mt-2"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
          <h2 className="text-xl font-bold mb-4">Project List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border border-gray-300 rounded-lg">
                <h3 className="text-lg font-bold">{project.name}</h3>
                <p>{project.description}</p>
                <p>Manager: {project.name}</p>
                <p>
                  Team Members:{" "}
                  {project.teamMembers.map((member) => member.name).join(", ")}
                </p>
                <div className="space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-2 bg-yellow-500 text-white rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
