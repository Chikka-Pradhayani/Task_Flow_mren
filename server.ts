import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db.ts";

const PORT = 3000;
const API_KEY = process.env.API_KEY || "college-assignment-default-key";

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Basic API Key Security Middleware
  const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const providedKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!providedKey || providedKey !== API_KEY) {
      res.status(401).json({ error: "Unauthorized: Invalid or missing x-api-key header" });
      return;
    }
    next();
  };

  // --- API ROUTES ---

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString(), authConfigured: !!process.env.MONGODB_URI });
  });

  // Get current API config details for frontend convenience
  app.get("/api/config", (req, res) => {
    res.json({ apiKey: API_KEY });
  });

  // --- Users API ---
  app.get("/api/users", requireApiKey, async (req, res) => {
    try {
      const usersList = await db.users.find();
      res.json(usersList);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch users: " + err.message });
    }
  });

  app.get("/api/users/:id", requireApiKey, async (req, res) => {
    try {
      const user = await db.users.findById(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch user: " + err.message });
    }
  });

  app.post("/api/users", requireApiKey, async (req, res) => {
    try {
      const { name, email, role } = req.body;
      if (!name || !email || !role) {
        res.status(400).json({ error: "Name, email and role are required fields" });
        return;
      }
      // Simple duplicate check if list isn't massive
      const existing = await db.users.find();
      if (existing.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        res.status(400).json({ error: "A user with this email address already exists" });
        return;
      }
      const newUser = await db.users.create({ name, email, role });
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create user: " + err.message });
    }
  });

  app.put("/api/users/:id", requireApiKey, async (req, res) => {
    try {
      const { name, email, role } = req.body;
      const updated = await db.users.update(req.params.id, { name, email, role });
      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update user: " + err.message });
    }
  });

  app.delete("/api/users/:id", requireApiKey, async (req, res) => {
    try {
      const deleted = await db.users.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "User not found or already deleted" });
        return;
      }
      res.json({ message: "User deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete user: " + err.message });
    }
  });

  // --- Tasks API ---
  app.get("/api/tasks", requireApiKey, async (req, res) => {
    try {
      const tasksList = await db.tasks.find();
      res.json(tasksList);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch tasks: " + err.message });
    }
  });

  app.get("/api/tasks/:id", requireApiKey, async (req, res) => {
    try {
      const task = await db.tasks.findById(req.params.id);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(task);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch task: " + err.message });
    }
  });

  app.post("/api/tasks", requireApiKey, async (req, res) => {
    try {
      const { title, description, assignedUser, status, priority, dueDate } = req.body;
      if (!title || !status || !priority || !dueDate) {
        res.status(400).json({ error: "Title, status, priority and due date are required" });
        return;
      }
      const newTask = await db.tasks.create({
        title,
        description: description || "",
        assignedUser: assignedUser || "",
        status,
        priority,
        dueDate,
      });
      res.status(201).json(newTask);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create task: " + err.message });
    }
  });

  app.put("/api/tasks/:id", requireApiKey, async (req, res) => {
    try {
      const { title, description, assignedUser, status, priority, dueDate } = req.body;
      const updated = await db.tasks.update(req.params.id, {
        title,
        description,
        assignedUser,
        status,
        priority,
        dueDate,
      });
      if (!updated) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update task: " + err.message });
    }
  });

  app.delete("/api/tasks/:id", requireApiKey, async (req, res) => {
    try {
      const deleted = await db.tasks.delete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Task not found or already deleted" });
        return;
      }
      res.json({ message: "Task deleted successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete task: " + err.message });
    }
  });

  // --- VITE DEV MIDDLEWARE OR STATIC PRODUCTION FILES SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to 0.0.0.0 and PORT 3000 as required by host ingress routing
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} [NODE_ENV=${process.env.NODE_ENV || "development"}]`);
  });
}

startServer().catch((err) => {
  console.error("Critical server crash:", err);
});
