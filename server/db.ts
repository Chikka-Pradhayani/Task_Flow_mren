import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Types
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

// ---------------------------------------------------------
// Option A: Real MongoDB + Mongoose Setup
// ---------------------------------------------------------
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
});

const TaskHistorySchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: String, required: true },
  details: { type: String },
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedUser: { type: String, required: true }, // We'll store the User ID as a string for simpler lookups
  status: {
    type: String,
    enum: ["Backlog", "To Do", "In Progress", "Testing", "Done"],
    default: "Backlog",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  dueDate: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  history: [TaskHistorySchema],
});

let MongooseUserModel: any;
let MongooseTaskModel: any;
let isConnectedToMongo = false;

const MONGO_URI = process.env.MONGODB_URI;

if (MONGO_URI) {
  try {
    mongoose.connect(MONGO_URI);
    MongooseUserModel = mongoose.model("User", UserSchema);
    MongooseTaskModel = mongoose.model("Task", TaskSchema);
    isConnectedToMongo = true;
    console.log("Connected to MongoDB Atlas successfully.");
  } catch (err) {
    console.error("MongoDB Atlas connection failed. Falling back to local JSON DB.", err);
    isConnectedToMongo = false;
  }
} else {
  console.log("No MONGODB_URI found. Utilizing resilient local JSON Database.");
}

// ---------------------------------------------------------
// Option B: Resilient JSON-file Fallback Database
// ---------------------------------------------------------
const JSON_DB_DIR = path.join(process.cwd(), "data");
const JSON_DB_PATH = path.join(JSON_DB_DIR, "db.json");

// Ensure the local database file exists
function initLocalDB() {
  if (!fs.existsSync(JSON_DB_DIR)) {
    fs.mkdirSync(JSON_DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    const defaultData = {
      users: [
        { id: "u1", name: "Alex Mercer", email: "alex@example.com", role: "Developer" },
        { id: "u2", name: "Sarah Connor", email: "sarah@example.com", role: "Project Manager" },
        { id: "u3", name: "John Doe", email: "john@example.com", role: "QA Engineer" }
      ],
      tasks: [
        {
          id: "t1",
          title: "Setup Express Server Routing",
          description: "Initialize the backend routes and controllers for task tracking.",
          assignedUser: "u1",
          status: "In Progress",
          priority: "High",
          dueDate: "2026-07-10",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            { action: "Task Created", timestamp: new Date().toISOString() },
            { action: "Assigned to Alex Mercer", timestamp: new Date().toISOString() },
            { action: "Status changed to In Progress", timestamp: new Date().toISOString() }
          ]
        },
        {
          id: "t2",
          title: "Create User Interface Design",
          description: "Design mockups and layout for the Kanban dashboard and users list.",
          assignedUser: "u2",
          status: "To Do",
          priority: "Medium",
          dueDate: "2026-07-15",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            { action: "Task Created", timestamp: new Date().toISOString() }
          ]
        },
        {
          id: "t3",
          title: "Write Test Cases for CRUD API",
          description: "Develop automated tests to ensure API stability and proper security checks.",
          assignedUser: "u3",
          status: "Backlog",
          priority: "Low",
          dueDate: "2026-07-20",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: [
            { action: "Task Created", timestamp: new Date().toISOString() }
          ]
        }
      ]
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

initLocalDB();

function readLocalDB(): { users: User[]; tasks: Task[] } {
  try {
    const raw = fs.readFileSync(JSON_DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read local DB file. Returning empty lists.", err);
    return { users: [], tasks: [] };
  }
}

function writeLocalDB(data: { users: User[]; tasks: Task[] }) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to local DB file.", err);
  }
}

// Helper to convert Mongoose document to clean object
function cleanMongooseDoc(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

// ---------------------------------------------------------
// Unified Database Access Layer (Swaps between Mongo and File fallback)
// ---------------------------------------------------------
export const db = {
  // --- USERS CRUD ---
  users: {
    async find(): Promise<User[]> {
      if (isConnectedToMongo) {
        const docs = await MongooseUserModel.find();
        return docs.map(cleanMongooseDoc);
      } else {
        return readLocalDB().users;
      }
    },

    async findById(id: string): Promise<User | null> {
      if (isConnectedToMongo) {
        try {
          const doc = await MongooseUserModel.findById(id);
          return cleanMongooseDoc(doc);
        } catch {
          return null;
        }
      } else {
        const { users } = readLocalDB();
        return users.find((u) => u.id === id) || null;
      }
    },

    async create(userData: Omit<User, "id">): Promise<User> {
      if (isConnectedToMongo) {
        const doc = await MongooseUserModel.create(userData);
        return cleanMongooseDoc(doc);
      } else {
        const localData = readLocalDB();
        const newUser: User = {
          id: "u_" + Math.random().toString(36).substr(2, 9),
          ...userData,
        };
        localData.users.push(newUser);
        writeLocalDB(localData);
        return newUser;
      }
    },

    async update(id: string, updateData: Partial<Omit<User, "id">>): Promise<User | null> {
      if (isConnectedToMongo) {
        try {
          const doc = await MongooseUserModel.findByIdAndUpdate(id, updateData, { new: true });
          return cleanMongooseDoc(doc);
        } catch {
          return null;
        }
      } else {
        const localData = readLocalDB();
        const index = localData.users.findIndex((u) => u.id === id);
        if (index === -1) return null;
        localData.users[index] = { ...localData.users[index], ...updateData };
        writeLocalDB(localData);
        return localData.users[index];
      }
    },

    async delete(id: string): Promise<boolean> {
      if (isConnectedToMongo) {
        try {
          const result = await MongooseUserModel.findByIdAndDelete(id);
          return !!result;
        } catch {
          return false;
        }
      } else {
        const localData = readLocalDB();
        const initialLen = localData.users.length;
        localData.users = localData.users.filter((u) => u.id !== id);
        // Also clean up any assigned tasks to avoid orphan references
        localData.tasks = localData.tasks.map((task) => {
          if (task.assignedUser === id) {
            return {
              ...task,
              assignedUser: "",
              updatedAt: new Date().toISOString(),
              history: [
                ...task.history,
                { action: "User Unassigned (User Deleted)", timestamp: new Date().toISOString() },
              ],
            };
          }
          return task;
        });
        writeLocalDB(localData);
        return localData.users.length < initialLen;
      }
    },
  },

  // --- TASKS CRUD ---
  tasks: {
    async find(): Promise<Task[]> {
      if (isConnectedToMongo) {
        const docs = await MongooseTaskModel.find();
        return docs.map(cleanMongooseDoc);
      } else {
        return readLocalDB().tasks;
      }
    },

    async findById(id: string): Promise<Task | null> {
      if (isConnectedToMongo) {
        try {
          const doc = await MongooseTaskModel.findById(id);
          return cleanMongooseDoc(doc);
        } catch {
          return null;
        }
      } else {
        const { tasks } = readLocalDB();
        return tasks.find((t) => t.id === id) || null;
      }
    },

    async create(taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "history">): Promise<Task> {
      const now = new Date().toISOString();
      const initialHistory: TaskHistory[] = [{ action: "Task Created", timestamp: now }];

      if (isConnectedToMongo) {
        const doc = await MongooseTaskModel.create({
          ...taskData,
          createdAt: now,
          updatedAt: now,
          history: initialHistory,
        });
        return cleanMongooseDoc(doc);
      } else {
        const localData = readLocalDB();
        const newTask: Task = {
          id: "t_" + Math.random().toString(36).substr(2, 9),
          ...taskData,
          createdAt: now,
          updatedAt: now,
          history: initialHistory,
        };
        localData.tasks.push(newTask);
        writeLocalDB(localData);
        return newTask;
      }
    },

    async update(id: string, updateData: Partial<Omit<Task, "id" | "createdAt" | "history">>): Promise<Task | null> {
      const now = new Date().toISOString();
      
      if (isConnectedToMongo) {
        try {
          // In Mongoose, we need to carefully find, log history, and update
          const doc = await MongooseTaskModel.findById(id);
          if (!doc) return null;

          const historyEntries: TaskHistory[] = [];
          
          // Generate history entries based on changes
          if (updateData.status && updateData.status !== doc.status) {
            historyEntries.push({
              action: `Status changed to ${updateData.status}`,
              timestamp: now,
            });
          }
          if (updateData.assignedUser && updateData.assignedUser !== doc.assignedUser) {
            historyEntries.push({
              action: `Task reassigned`,
              timestamp: now,
            });
          }
          if (updateData.priority && updateData.priority !== doc.priority) {
            historyEntries.push({
              action: `Priority updated to ${updateData.priority}`,
              timestamp: now,
            });
          }

          const finalHistory = [...doc.history, ...historyEntries];

          const updatedDoc = await MongooseTaskModel.findByIdAndUpdate(
            id,
            {
              ...updateData,
              updatedAt: now,
              $push: { history: { $each: historyEntries } },
            },
            { new: true }
          );
          return cleanMongooseDoc(updatedDoc);
        } catch {
          return null;
        }
      } else {
        const localData = readLocalDB();
        const index = localData.tasks.findIndex((t) => t.id === id);
        if (index === -1) return null;

        const original = localData.tasks[index];
        const historyEntries: TaskHistory[] = [];

        if (updateData.status && updateData.status !== original.status) {
          historyEntries.push({
            action: `Status changed to ${updateData.status}`,
            timestamp: now,
          });
        }
        if (updateData.assignedUser && updateData.assignedUser !== original.assignedUser) {
          const newUser = localData.users.find(u => u.id === updateData.assignedUser);
          const userName = newUser ? newUser.name : "Unassigned";
          historyEntries.push({
            action: `Assigned to ${userName}`,
            timestamp: now,
          });
        }
        if (updateData.priority && updateData.priority !== original.priority) {
          historyEntries.push({
            action: `Priority updated to ${updateData.priority}`,
            timestamp: now,
          });
        }
        if (updateData.title && updateData.title !== original.title) {
          historyEntries.push({
            action: `Title changed to "${updateData.title}"`,
            timestamp: now,
          });
        }

        localData.tasks[index] = {
          ...original,
          ...updateData,
          updatedAt: now,
          history: [...original.history, ...historyEntries],
        };
        writeLocalDB(localData);
        return localData.tasks[index];
      }
    },

    async delete(id: string): Promise<boolean> {
      if (isConnectedToMongo) {
        try {
          const result = await MongooseTaskModel.findByIdAndDelete(id);
          return !!result;
        } catch {
          return false;
        }
      } else {
        const localData = readLocalDB();
        const initialLen = localData.tasks.length;
        localData.tasks = localData.tasks.filter((t) => t.id !== id);
        writeLocalDB(localData);
        return localData.tasks.length < initialLen;
      }
    },
  },
};
