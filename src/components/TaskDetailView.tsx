import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Task, User } from "../types";
import { api } from "../api";
import { ArrowLeft, Calendar, UserCheck, ShieldAlert, Clock, RefreshCw, Trash2, Tag, AlertCircle } from "lucide-react";

interface TaskDetailViewProps {
  users: User[];
  onDeleteTask: (id: string) => Promise<void>;
  onRefreshTasks: () => Promise<void>;
}

export default function TaskDetailView({ users, onDeleteTask, onRefreshTasks }: TaskDetailViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch individual task and history directly from API for absolute real-time accuracy
  const fetchTaskDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getTask(id);
      setTask(data);
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("Task details could not be loaded. It may have been deleted.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  // Handle task deletion
  const handleDelete = async () => {
    if (!task) return;
    const confirmed = window.confirm(`Permanently remove task "${task.title}"?`);
    if (confirmed) {
      try {
        await onDeleteTask(task.id);
        navigate("/tasks");
      } catch (err: any) {
        alert(err.message || "Failed to remove task.");
      }
    }
  };

  // Helper to find Assigned User
  const getAssignedUser = () => {
    if (!task || !task.assignedUser) return null;
    return users.find((u) => u.id === task.assignedUser) || null;
  };

  // Helper to format date strings for display
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="animate-spin text-indigo-500" size={32} />
        <span className="text-sm font-medium text-slate-500">Querying project audit logs...</span>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm">
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Task Log Failure</h2>
          <p className="text-sm text-slate-500 mt-1">{error || "Task not found."}</p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition"
        >
          <ArrowLeft size={16} />
          Back to Tasks
        </Link>
      </div>
    );
  }

  const assignedUserObj = getAssignedUser();

  // Colors for tags
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
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back button link */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={14} />
          Back to Kanban Board
        </Link>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition"
        >
          <Trash2 size={14} />
          Remove Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Core task card details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyles(task.status)}`}>
                {task.status}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${priorityStyles(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
              {task.title}
            </h1>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Specifications / Scope</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || "No explicit technical specifications or descriptions were provided for this item."}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Owner */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <UserCheck size={18} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Resource</span>
                {assignedUserObj ? (
                  <div className="text-sm mt-0.5">
                    <p className="font-semibold text-slate-900">{assignedUserObj.name}</p>
                    <p className="text-xs text-slate-500">{assignedUserObj.role}</p>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-400 italic mt-0.5">Unassigned</p>
                )}
              </div>
            </div>

            {/* Target Timeline */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar size={18} />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Due Date</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{task.dueDate}</p>
                <p className="text-xs text-slate-500">Subject to SDLC updates</p>
              </div>
            </div>
          </div>

          {/* Date info footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-mono">
            <div>Created: {formatDate(task.createdAt)}</div>
            <div>Last Action: {formatDate(task.updatedAt)}</div>
          </div>
        </div>

        {/* Right column: Dynamic Timeline audit history */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock size={16} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Audit Trail History</h2>
          </div>

          <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-6">
            {task.history && task.history.length > 0 ? (
              task.history.map((log, index) => (
                <div key={index} className="relative group">
                  {/* Visual timeline circle indicator */}
                  <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white ring-4 ring-indigo-50/50 group-hover:bg-indigo-600 transition"></div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 transition">
                      {log.action}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No chronological log entries are registered for this task.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
