import React from "react";
import { Link } from "react-router-dom";
import { Task, User } from "../types";
import { ChevronLeft, ChevronRight, Calendar, UserCheck, MessageSquare, AlertCircle } from "lucide-react";

interface DashboardViewProps {
  tasks: Task[];
  users: User[];
  onUpdateTaskStatus: (id: string, newStatus: Task["status"]) => Promise<void>;
}

export default function DashboardView({ tasks, users, onUpdateTaskStatus }: DashboardViewProps) {
  const stages: Task["status"][] = ["Backlog", "To Do", "In Progress", "Testing", "Done"];

  // Helper to get Assigned User name
  const getUserName = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : "Unassigned";
  };

  // Helper to get developer's initials
  const getUserInitials = (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return "??";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Move a task left or right in the workflow
  const moveTask = async (task: Task, direction: "left" | "right") => {
    const currentIndex = stages.indexOf(task.status);
    let targetIndex = currentIndex;

    if (direction === "left" && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === "right" && currentIndex < stages.length - 1) {
      targetIndex = currentIndex + 1;
    }

    if (targetIndex !== currentIndex) {
      try {
        await onUpdateTaskStatus(task.id, stages[targetIndex]);
      } catch (err: any) {
        alert(err.message || "Failed to transfer task between columns");
      }
    }
  };

  // Direct dropdown transition update
  const handleDropdownStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await onUpdateTaskStatus(taskId, newStatus);
    } catch (err: any) {
      alert(err.message || "Failed to update task status");
    }
  };

  // Styles for priority dot
  const priorityDotStyle = (p: Task["priority"]) => {
    switch (p) {
      case "High":
        return "bg-rose-500";
      case "Medium":
        return "bg-amber-500";
      case "Low":
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Meta Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SDLC Kanban Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor requirements flowing through the development phases in real-time.
        </p>
      </div>

      {/* Kanban Board Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
        {stages.map((stage) => {
          const stageTasks = tasks.filter((t) => t.status === stage);

          // Header border/bg colors based on stages
          const getStageColor = (s: typeof stage) => {
            switch (s) {
              case "Backlog":
                return "border-slate-300 text-slate-700 bg-slate-50";
              case "To Do":
                return "border-blue-300 text-blue-700 bg-blue-50/40";
              case "In Progress":
                return "border-indigo-300 text-indigo-700 bg-indigo-50/30";
              case "Testing":
                return "border-amber-300 text-amber-700 bg-amber-50/40";
              case "Done":
                return "border-emerald-300 text-emerald-700 bg-emerald-50/40";
            }
          };

          return (
            <div
              key={stage}
              className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col min-w-[260px] max-h-[80vh]"
            >
              {/* Column Title */}
              <div className={`flex items-center justify-between border-b px-2 py-1.5 rounded-lg mb-4 ${getStageColor(stage)}`}>
                <span className="font-bold text-xs tracking-wide uppercase">{stage}</span>
                <span className="text-[11px] font-bold bg-white/90 border px-2 py-0.5 rounded-full shadow-sm text-slate-600">
                  {stageTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[150px]">
                {stageTasks.length > 0 ? (
                  stageTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Task priority, title and details link */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <span className={`w-2 h-2 rounded-full ${priorityDotStyle(task.priority)}`}></span>
                            {task.priority} Priority
                          </span>
                          
                          {/* Navigation indicator linking to history */}
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-xs text-indigo-600 hover:underline font-semibold flex items-center"
                            title="Inspect History"
                          >
                            Details
                          </Link>
                        </div>

                        <h3 className="font-semibold text-slate-900 text-sm mt-2 leading-tight group-hover:text-indigo-600 transition">
                          <Link to={`/tasks/${task.id}`}>{task.title}</Link>
                        </h3>

                        {task.description && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Footer: User initials and due-date */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>

                        {/* Developer initials balloon */}
                        {task.assignedUser ? (
                          <div
                            className="w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-[9px] border border-slate-200"
                            title={`Assigned to: ${getUserName(task.assignedUser)}`}
                          >
                            {getUserInitials(task.assignedUser)}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                        )}
                      </div>

                      {/* Action controllers row */}
                      <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between gap-1">
                        {/* Move column left arrow */}
                        <button
                          disabled={stage === "Backlog"}
                          onClick={() => moveTask(task, "left")}
                          className="p-1 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
                          title="Move to previous phase"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        {/* Column dropdown selector */}
                        <select
                          value={task.status}
                          onChange={(e) => handleDropdownStatusChange(task.id, e.target.value as Task["status"])}
                          className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
                        >
                          {stages.map((stg) => (
                            <option key={stg} value={stg}>
                              {stg}
                            </option>
                          ))}
                        </select>

                        {/* Move column right arrow */}
                        <button
                          disabled={stage === "Done"}
                          onClick={() => moveTask(task, "right")}
                          className="p-1 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
                          title="Move to next phase"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-28 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-3">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">No tasks</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
