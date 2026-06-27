import React from "react";
import { Link } from "react-router-dom";
import { User, Task } from "../types";
import { LayoutDashboard, Users, CheckCircle, ClipboardList, Clock, ShieldAlert } from "lucide-react";

interface HomeViewProps {
  users: User[];
  tasks: Task[];
}

export default function HomeView({ users, tasks }: HomeViewProps) {
  // Compute metrics
  const totalUsers = users.length;
  const totalTasks = tasks.length;
  const tasksByStatus = {
    Backlog: tasks.filter((t) => t.status === "Backlog").length,
    "To Do": tasks.filter((t) => t.status === "To Do").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
    Testing: tasks.filter((t) => t.status === "Testing").length,
    Done: tasks.filter((t) => t.status === "Done").length,
  };

  const highPriorityCount = tasks.filter((t) => t.priority === "High").length;
  const donePercent = totalTasks > 0 ? Math.round((tasksByStatus.Done / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full filter blur-3xl -mr-20 -mt-20 opacity-70"></div>
        <div className="relative z-10 max-w-3xl">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Internship Assignment Project
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-4 leading-tight">
            Task flow
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            A software development tracking platform modeled after Jira and Trello.
            Easily manage task workflows, allocate developers, and visualize progress across different
            Software Development Life Cycle (SDLC) stages using an interactive Kanban Dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition duration-200 shadow-sm flex items-center gap-2 text-sm"
            >
              <LayoutDashboard size={18} />
              Open Kanban Board
            </Link>
            <Link
              to="/tasks"
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition duration-200 flex items-center gap-2 text-sm"
            >
              <ClipboardList size={18} />
              View Tasks ({totalTasks})
            </Link>
          </div>
        </div>
      </div>

      {/* Live Stats Bento Grid */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-indigo-500" />
          Real-Time Project Health
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Active Contributors</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">{totalUsers}</span>
              <p className="text-xs text-slate-500 mt-1">Developers & PMs allocated</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total Tracking Tasks</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <ClipboardList size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">{totalTasks}</span>
              <p className="text-xs text-slate-500 mt-1">{tasksByStatus["In Progress"]} currently in progress</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Tasks Completed</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{tasksByStatus.Done}</span>
                <span className="text-sm font-medium text-emerald-600">({donePercent}%)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Successfully deployed or done</p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">High Priority Risks</span>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">{highPriorityCount}</span>
              <p className="text-xs text-slate-500 mt-1">Require immediate attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Board Distribution Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">SDLC Lifecycle Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Backlog ({tasksByStatus.Backlog})</span>
                <span>{totalTasks ? Math.round((tasksByStatus.Backlog / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (tasksByStatus.Backlog / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>To Do ({tasksByStatus["To Do"]})</span>
                <span>{totalTasks ? Math.round((tasksByStatus["To Do"] / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (tasksByStatus["To Do"] / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>In Progress ({tasksByStatus["In Progress"]})</span>
                <span>{totalTasks ? Math.round((tasksByStatus["In Progress"] / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (tasksByStatus["In Progress"] / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Testing ({tasksByStatus.Testing})</span>
                <span>{totalTasks ? Math.round((tasksByStatus.Testing / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (tasksByStatus.Testing / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Done ({tasksByStatus.Done})</span>
                <span>{totalTasks ? Math.round((tasksByStatus.Done / totalTasks) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks ? (tasksByStatus.Done / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Meta Box */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Developer Information</h3>
            <p className="text-xs text-slate-500 mt-1">Submitted as academic evaluation project</p>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-medium">Student Name:</span>
                <span>College Intern</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-medium">Assignment:</span>
                <span>MERN Project Utility</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-medium">Status:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Completed
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400 leading-normal">
            * Fully integrated with Express API routes & reactive state-management. Local-first fallback system is active for sandbox.
          </div>
        </div>
      </div>
    </div>
  );
}
