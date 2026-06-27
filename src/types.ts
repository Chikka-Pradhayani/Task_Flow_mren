export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TaskHistory {
  action: string;
  timestamp: string;
  details?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedUser: string; // User ID
  status: "Backlog" | "To Do" | "In Progress" | "Testing" | "Done";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  history: TaskHistory[];
}
