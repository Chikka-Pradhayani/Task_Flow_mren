import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home, LayoutDashboard } from "lucide-react";

export default function NotFoundView() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
        <AlertCircle size={32} />
      </div>

      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-2">Workplace Not Found</h2>
      
      <p className="text-sm text-slate-500 mt-3 max-w-md leading-relaxed">
        The requested SDLC workspace, task log, or route you are attempting to locate is either unavailable or has been archived.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition"
        >
          <Home size={16} />
          Go to Home
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <LayoutDashboard size={16} />
          Open Kanban
        </Link>
      </div>
    </div>
  );
}
