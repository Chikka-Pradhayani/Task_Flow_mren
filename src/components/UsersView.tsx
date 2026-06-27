import React, { useState } from "react";
import { User } from "../types";
import { UserPlus, Edit2, Trash2, Mail, Briefcase, X, Check, Search, AlertCircle } from "lucide-react";

interface UsersViewProps {
  users: User[];
  onAddUser: (user: Omit<User, "id">) => Promise<void>;
  onEditUser: (id: string, user: Partial<Omit<User, "id">>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
}

export default function UsersView({ users, onAddUser, onEditUser, onDeleteUser }: UsersViewProps) {
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "Developer" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  // Open modal for adding
  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Developer" });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit User form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please fill in the user's name.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please provide an email address.");
      return;
    }
    // Simple Email verification
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await onEditUser(editingUser.id, formData);
        setSuccess("User details updated successfully!");
        setTimeout(() => setIsModalOpen(false), 800);
      } else {
        // Double check duplicate locally to alert user
        if (users.some((u) => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
          setError("A user with this email address already exists.");
          setIsSubmitting(false);
          return;
        }
        await onAddUser(formData);
        setSuccess("New user added successfully!");
        setFormData({ name: "", email: "", role: "Developer" });
        setTimeout(() => setIsModalOpen(false), 800);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and delete user
  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name}? This will also unassign them from any tasks.`);
    if (confirmed) {
      try {
        await onDeleteUser(id);
      } catch (err: any) {
        alert(err.message || "Failed to delete user.");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h1>
          <p className="text-sm text-slate-500 mt-1">Manage team members and assign development roles.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
          Showing {filteredUsers.length} of {users.length} team members
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-base">
                    {user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1">
                      <Briefcase size={12} />
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                  title="Edit details"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 font-medium">No team members match your search criteria.</p>
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-indigo-600 font-semibold mt-1 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Add / Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser ? "Modify Member Details" : "Add New Team Member"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Alert Feedback Messages */}
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3 rounded-lg flex items-start gap-2 animate-pulse">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Input Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Mercer"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Input Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. alex@example.com"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Dropdown Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">SDLC Role / Allocation</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="Project Manager">Project Manager</option>
                  <option value="Product Owner">Product Owner</option>
                  <option value="Developer">Developer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="DevOps Specialist">DevOps Specialist</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                </select>
              </div>

              {/* Submit panel */}
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
                  {isSubmitting ? "Saving..." : editingUser ? "Save Updates" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
