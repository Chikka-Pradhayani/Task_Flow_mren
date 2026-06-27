# Project Management Utility (MERN SDLC Tracker)

A robust, full-stack software project tracking application modeled after professional workflow engines like Jira and Trello. It empowers teams to organize and monitor engineering tasks flowing through standard Software Development Life Cycle (SDLC) stages using a real-time Kanban board.

This project was developed as a college software engineering internship assignment, showcasing clean full-stack coding, database state synchronization (supporting both MongoDB/Mongoose and resilient local fallback), and client-side reactive components.

---

## 🎨 Project Overview

Managing priorities and tasks is a core pillar of modern software engineering. This **Project Management Utility** provides a centralized control board to manage contributors (Users) and technical specifications (Tasks). Each task transition is documented in an audit-trail history timeline to retain precise logging of project updates.

---

## 🚀 Core Features

1. **User / Contributor Management (CRUD)**:
   - Add, edit, and delete software contributors.
   - Assign designated SDLC roles (Project Manager, Product Owner, Developer, QA Engineer, DevOps, etc.).
   - Full safety guardrails (auto-unassigns tasks when team members are deleted).

2. **Task Workflow Management (CRUD)**:
   - File requirements, bugs, or user stories with explicit parameters: Title, Description, Status, Priority, and Target Due Date.
   - Dynamic user-allocation dropdowns that populate from active team datasets.

3. **SDLC Kanban Dashboard**:
   - Visualizes tasks grouped into 5 core SDLC columns: **Backlog**, **To Do**, **In Progress**, **Testing**, and **Done**.
   - Immediate task transfer buttons and dropdowns for fast transition mapping across development streams.

4. **Task Audit Trail & History Log**:
   - Automated event listener loggers that track changes to status, title, priority, or ownership.
   - Inspect any task card to display a beautifully rendered vertical timeline of action histories.

5. **Self-Configuring Security Layer**:
   - Backend APIs are locked down with a custom CORS structure and an `x-api-key` validation middleware.
   - The React client dynamically queries the server's public variables on mount to auto-acquire the session key, guaranteeing zero setup configuration for development previews.

6. **Hybrid Fallback Database Engine**:
   - Connects to real **MongoDB Atlas** using **Mongoose Schemas** when `MONGODB_URI` is provided.
   - Seamlessly falls back to a highly reliable, persistent local JSON database (`/data/db.json`) if MongoDB credentials are empty, ensuring 100% interactivity immediately out of the box.

---

## 🛠️ Technologies Used

### Backend (Express Core)
- **Node.js** with **Express.js** as the primary routing engine.
- **Mongoose / MongoDB** for schema definition and cloud storage.
- **tsx / esbuild** for high-speed local compiling and production bundles.
- **dotenv** for configuration of port parameters and key registries.

### Frontend (React SPA)
- **React.js (v19)** using functional components, standard hooks, and reactive states.
- **React Router (v6)** (`HashRouter` fallback for error-free sandboxed iframes).
- **Tailwind CSS (v4)** for modern fluid utility styling and mobile-responsive layout.
- **Lucide React** for professional software development icons.

---

## 📂 Folder Structure

The project has been carefully consolidated to follow a minimalist yet highly professional file architecture that avoids token limits and file clutter:

```text
├── /data                    # Local JSON database folder (active when MONGODB_URI is absent)
│   └── db.json              # Persistent mock-database store
├── /server                  # Backend core files
│   └── db.ts                # Dual Mongoose Schemas & fallback JSON-database access layer
├── /src                     # Frontend application sources
│   ├── /components          # Modular React page components
│   │   ├── HomeView.tsx        # Overview landing dashboard & metrics
│   │   ├── DashboardView.tsx   # Core SDLC Kanban board
│   │   ├── UsersView.tsx       # Team member management list & modals
│   │   ├── TasksView.tsx       # Ticket logs table view & modals
│   │   ├── TaskDetailView.tsx  # Extended task detail card & vertical history timeline
│   │   └── NotFoundView.tsx    # 404 router page fallback
│   ├── api.ts               # Client security-key retrieval and AJAX query wrapper
│   ├── App.tsx              # Main React route coordinator and global state synchronization
│   ├── index.css            # Tailwind CSS configuration with Inter and JetBrains Mono fonts
│   ├── main.tsx             # React engine mount point
│   └── types.ts             # Global TypeScript interface definitions
├── server.ts                # Main Express Entry Point (serves API & mounts Vite / Static Dist)
├── package.json             # NPM project manifest
├── tsconfig.json            # TypeScript build presets
├── vite.config.ts           # Vite asset assembler
└── README.md                # Comprehensive project documentation
```

---

## 🔒 Environment Variables

Configure these settings inside a `.env` file at the root folder:

```env
# MongoDB Atlas Database URI (Optional - fallback to local JSON DB if omitted)
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.example.com/project_db"

# Custom Security Access Key (Optional - uses college-assignment-default-key if omitted)
API_KEY="my-custom-student-access-token"
```

---

## 📡 API Endpoints

All backend endpoints are prefixed with `/api` and require an `x-api-key` header matching the backend `API_KEY` setting.

### Config & Infrastructure
- `GET /api/health` - Check backend system health and active database status.
- `GET /api/config` - Fetches non-sensitive configuration keys for client auth bootstrap.

### Users Management (`/api/users`)
- `GET /api/users` - List all registered developers and team members.
- `GET /api/users/:id` - Fetch single contributor details.
- `POST /api/users` - Add a new team member. (Requires `name`, `email`, `role`).
- `PUT /api/users/:id` - Update details for a contributor.
- `DELETE /api/users/:id` - Delete contributor and safely clear associated tasks assignments.

### Tasks Management (`/api/tasks`)
- `GET /api/tasks` - List all filed project tickets.
- `GET /api/tasks/:id` - Get specific task details, including its complete history timeline.
- `POST /api/tasks` - Create a new project task. (Requires `title`, `status`, `priority`, `dueDate`).
- `PUT /api/tasks/:id` - Edit parameters (triggers automatic event timeline logging).
- `DELETE /api/tasks/:id` - Permanently remove a task.

---

## 🚀 Installation & Local Launch

### Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your workstation.

### Step-by-Step Launch
1. **Clone & Extract**:
   Place the project folder in your workspace.

2. **Install Dependencies**:
   Install backend and frontend library assemblies:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   Start the Express server and Vite bundler in parallel:
   ```bash
   npm run dev
   ```
   *The fullstack application will boot immediately at **`http://localhost:3000`**.*

4. **Production Build & Launch**:
   Compile the code bundle and run the static production express app:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔮 Future Improvements

If extended into a larger corporate project, several enhancements could be filed:
1. **JWT User Authentication & Session Control**: Implement secure signups and logins with token refresh workflows.
2. **WebSockets Collaboration**: Connect Socket.io to stream column changes to other active team dashboards in real-time.
3. **Task Comments & File Upload Attachments**: Support uploading design mockups and documentation specs directly into task profiles.
4. **Sub-tasks & Checklist Items**: Support dividing extensive user stories into smaller, checkbox-driven sub-tasks.
5. **Burndown & Velocity Charts**: Integrate visual D3 diagrams to track software sprint performance.
