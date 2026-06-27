import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { api } from "./api";
import { User, Task } from "./types";
import { LayoutDashboard, Users, ClipboardList, Home, RefreshCw, Layers, Menu, X, CheckCircle } from "lucide-react";

// Views
import HomeView from "./components/HomeView";
import DashboardView from "./components/DashboardView";
import UsersView from "./components/UsersView";
import TasksView from "./components/TasksView";
import TaskDetailView from "./components/TaskDetailView";
import NotFoundView from "./components/NotFoundView";

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load baseline datasets from database
  const loadProjectData = async () => {
    setLoading(true);
    try {
      const [usersData, tasksData] = await Promise.all([
        api.getUsers(),
        api.getTasks(),
      ]);
      setUsers(usersData);
      setTasks(tasksData);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Failed to synchonize with the project database. Verify backend server is alive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, []);

  // --- USER CONTROLLERS ---
  const handleAddUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = await api.createUser(userData);
      setUsers((prev) => [...prev, newUser]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to add user.");
    }
  };

  const handleEditUser = async (id: string, userData: Partial<Omit<User, "id">>) => {
    try {
      const updatedUser = await api.updateUser(id, userData);
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      // Refresh tasks too, in case a user rename affects displays
      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (err: any) {
      throw new Error(err.message || "Failed to update user.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      // Re-fetch tasks since they'll be unassigned in db.json / MongoDB
      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete user.");
    }
  };

  // --- TASK CONTROLLERS ---
  const handleAddTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "history">) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
    } catch (err: any) {
      throw new Error(err.message || "Failed to add task.");
    }
  };

  const handleEditTask = async (id: string, taskData: Partial<Omit<Task, "id" | "createdAt" | "history">>) => {
    try {
      const updatedTask = await api.updateTask(id, taskData);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err: any) {
      throw new Error(err.message || "Failed to update task details.");
    }
  };

  const handleUpdateTaskStatus = async (id: string, newStatus: Task["status"]) => {
    try {
      const updatedTask = await api.updateTask(id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err: any) {
      throw new Error(err.message || "Failed to transfer task status.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      throw new Error(err.message || "Failed to remove task.");
    }
  };

  // Standard loading screens
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 space-y-5 select-none font-sans">
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <RefreshCw className="animate-spin text-slate-800" size={28} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-slate-900 tracking-tight">Initializing SDLC Workspace</p>
          <p className="text-xs text-slate-400 font-medium">Acquiring database schemas & active contributors...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased selection:bg-slate-200 selection:text-slate-900">
        {/* Navigation Header bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* Logo and title */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-xl shadow-sm transition-transform duration-200 hover:scale-105">
                    <Layers size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm tracking-tight block">
                      Task flow
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block -mt-0.5 tracking-wider uppercase">
                      SDLC Workspace
                    </span>
                  </div>
                </div>

                {/* Desktop Nav links */}
                <nav className="hidden md:ml-10 md:flex md:space-x-1 items-center">
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                      }`
                    }
                  >
                    <Home size={14} className="stroke-[2]" />
                    Overview
                  </NavLink>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                      }`
                    }
                  >
                    <LayoutDashboard size={14} className="stroke-[2]" />
                    Kanban Board
                  </NavLink>
                  <NavLink
                    to="/tasks"
                    className={({ isActive }) =>
                      `px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                      }`
                    }
                  >
                    <ClipboardList size={14} className="stroke-[2]" />
                    Manage Tasks
                  </NavLink>
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `px-3.5 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all duration-200 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm font-semibold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                      }`
                    }
                  >
                    <Users size={14} className="stroke-[2]" />
                    Team Members
                  </NavLink>
                </nav>
              </div>

              {/* Utility / Sync controllers */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={loadProjectData}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:rotate-180"
                  title="Synchronize database"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Mobile Menu button toggle */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile navigation side menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200/80 px-4 py-3 bg-white space-y-1 shadow-inner animate-fade-in">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-all duration-150 ${
                    isActive ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Home size={16} />
                Overview
              </NavLink>
              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-all duration-150 ${
                    isActive ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <LayoutDashboard size={16} />
                Kanban Board
              </NavLink>
              <NavLink
                to="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-all duration-150 ${
                    isActive ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <ClipboardList size={16} />
                Manage Tasks
              </NavLink>
              <NavLink
                to="/users"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2.5 transition-all duration-150 ${
                    isActive ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <Users size={16} />
                Team Members
              </NavLink>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  loadProjectData();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 transition-all duration-150"
              >
                <RefreshCw size={16} />
                Sync Database
              </button>
            </div>
          )}
        </header>

        {/* Primary Content shell */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error alerts banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-4 rounded-xl mb-6 flex items-start gap-2.5">
              <span className="font-bold text-rose-800">Connection Error:</span>
              <span>{error}</span>
            </div>
          )}

          <Routes>
            <Route path="/" element={<HomeView users={users} tasks={tasks} />} />
            <Route
              path="/dashboard"
              element={
                <DashboardView
                  tasks={tasks}
                  users={users}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              }
            />
            <Route
              path="/users"
              element={
                <UsersView
                  users={users}
                  onAddUser={handleAddUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                />
              }
            />
            <Route
              path="/tasks"
              element={
                <TasksView
                  tasks={tasks}
                  users={users}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <TaskDetailView
                  users={users}
                  onDeleteTask={handleDeleteTask}
                  onRefreshTasks={loadProjectData}
                />
              }
            />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </main>

        {/* Footer info block */}
        <footer className="bg-white/60 backdrop-blur-xs border-t border-slate-200/80 py-6 text-center text-[11px] text-slate-400 font-medium select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>© 2026 TaskFlow. Academic Internship Evaluation.</p>
            <div className="flex items-center gap-2 justify-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[9px] tracking-tight border border-slate-200/50">
                Express API Server
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono text-[9px] tracking-tight border border-slate-200/50">
                MongoDB Atlas Core
              </span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
