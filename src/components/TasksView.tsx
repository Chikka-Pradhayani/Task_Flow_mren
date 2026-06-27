import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Task, User } from "../types";
import { Plus, Edit2, Trash2, Calendar, UserCheck, ChevronRight, Search, SlidersHorizontal, AlertCircle, Check } from "lucide-react";

interface TasksViewProps {
  tasks: Task[];
  users: User[];
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "history">) => Promise<void>;
  onEditTask: (id: string, task: Partial<Omit<Task, "id" | "createdAt" | "history">>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TasksView({ tasks, users, onAddTask, onEditTask, onDeleteTask }: TasksViewProps) {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedUser: "",
    status: "To Do" as Task["status"],
    priority: "Medium" as Task["priority"],
    dueDate: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get Assigned User name
  const getUserName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : "Unassigned";
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Open modal for adding
  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      assignedUser: users.length > 0 ? users[0].id : "",
      status: "To Do",
      priority: "Medium",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 1 week from now
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (task: Task, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering other links
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedUser: task.assignedUser,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Please provide a task title.");
      return;
    }
    if (!formData.dueDate) {
      setError("Please select a target due date.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTask) {
        await onEditTask(editingTask.id, formData);
        setSuccess("Task details updated successfully!");
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        await onAddTask(formData);
        setSuccess("New task tracked successfully!");
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong saving the task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete task
  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(`Permanently remove task "${title}"?`);
    if (confirmed) {
      try {
        await onDeleteTask(id);
      } catch (err: any) {
        alert(err.message || "Failed to remove task.");
      }
    }
  };

  // Colors for Priority tags
  const priorityStyles = (p: Task["priority"]) => {
    switch (p) {
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Low":
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  // Colors for Status tags
  const statusStyles = (s: Task["status"]) => {
    switch (s) {
      case "Backlog":
        return "bg-slate-100 text-slate-700";
      case "To Do":
        return "bg-blue-50 text-blue-700";
      case "In Progress":
        return "bg-indigo-50 text-indigo-700";
      case "Testing":
        return "bg-amber-50 text-amber-700";
      case "Done":
        return "bg-emerald-50 text-emerald-700";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SDLC Project Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">Track requirements, development items, and bugs.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <SlidersHorizontal size={14} />
          Filter & Query Tasks
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search text */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="all">All SDLC Stages</option>
              <option value="Backlog">Backlog</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Testing">Testing</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Filter Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table/List View */}
      {filteredTasks.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block p-5 hover:bg-slate-50 transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusStyles(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityStyles(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition text-base">
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{task.description || "No description provided."}</p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-500 justify-between sm:justify-end shrink-0">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={14} className="text-slate-400" />
                      <span>{getUserName(task.assignedUser)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Due {task.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                      <button
                        onClick={(e) => openEditModal(task, e)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                        title="Edit Task"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(task.id, task.title, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition translate-x-0 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 font-medium">No tasks found matching current filters.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="text-xs text-indigo-600 font-semibold mt-1.5 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Task Creation & Editing Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingTask ? "Update Software Task" : "Register New Project Task"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3 rounded-lg flex items-start gap-2">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Task Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Implement OIDC OAuth flows"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Description / Specifications</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Provide explicit steps, technical stacks or scope of implementation..."
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Row: Assigned Developer & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Assigned Developer</label>
                  <select
                    name="assignedUser"
                    value={formData.assignedUser}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">SDLC Stage</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Testing">Testing</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>

              {/* Row: Priority & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Task Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {isSubmitting ? "Processing..." : editingTask ? "Update Details" : "Track Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
