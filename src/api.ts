import { User, Task } from "./types";

// Base API URL
const BASE_URL = "/api";

// Let's cache the API key retrieved from the server configuration
let cachedApiKey = "";

async function getApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;
  try {
    const res = await fetch(`${BASE_URL}/config`);
    if (res.ok) {
      const data = await res.json();
      cachedApiKey = data.apiKey || "college-assignment-default-key";
      return cachedApiKey;
    }
  } catch (err) {
    console.error("Failed to fetch API security config. Falling back to default.", err);
  }
  return "college-assignment-default-key";
}

// Custom fetch helper that injects the security key automatically
async function secureFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const apiKey = await getApiKey();
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! Status: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Users CRUD
  getUsers: (): Promise<User[]> => secureFetch("/users"),
  getUser: (id: string): Promise<User> => secureFetch(`/users/${id}`),
  createUser: (user: Omit<User, "id">): Promise<User> =>
    secureFetch("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),
  updateUser: (id: string, user: Partial<Omit<User, "id">>): Promise<User> =>
    secureFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),
  deleteUser: (id: string): Promise<{ message: string }> =>
    secureFetch(`/users/${id}`, {
      method: "DELETE",
    }),

  // Tasks CRUD
  getTasks: (): Promise<Task[]> => secureFetch("/tasks"),
  getTask: (id: string): Promise<Task> => secureFetch(`/tasks/${id}`),
  createTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "history">): Promise<Task> =>
    secureFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  updateTask: (id: string, task: Partial<Omit<Task, "id" | "createdAt" | "history">>): Promise<Task> =>
    secureFetch(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    }),
  deleteTask: (id: string): Promise<{ message: string }> =>
    secureFetch(`/tasks/${id}`, {
      method: "DELETE",
    }),
};
