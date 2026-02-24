# ✅ Tasks Tracker

A collaborative, workspace-based task management app built with **Next.js 16**, **Prisma**, and **NextAuth v5**. Organize work across multiple workspaces, assign tasks to teammates, and track progress — all in a clean dark-mode UI.

---

## Features

### 🔐 Authentication
- Email-based sign-in (no password required — just enter an email)
- New accounts are automatically created on first sign-in
- JWT session strategy via NextAuth v5

### 🗂️ Workspaces
- Create unlimited workspaces from the sidebar
- Each workspace is isolated — tasks and members are scoped per workspace
- Switch between workspaces instantly via the sidebar

### 👥 Team Collaboration
- Invite members to a workspace by email address
- Role-based membership: **Owner**, **Admin**, **Member**
- Only Owners and Admins can invite new members

### ✅ Task Management

| Feature | Details |
|---|---|
| **Create tasks** | Click "+ New" or the inline "New task" button at the bottom of the table |
| **Delete tasks** | Click the 🗑️ trash icon on the right side of any task row |
| **Status** | `Not started` → `In progress` → `Done` (inline dropdown, colour-coded) |
| **Priority** | `Low` / `Medium` / `High` — colour-coded badges (inline dropdown) |
| **Assignee** | Assign any workspace member to a task (inline dropdown) |
| **Description** | Inline editable description field per task |

### 👤 My Tasks View
- Toggle between **All Tasks** and **My Tasks** views
- "My Tasks" filters to only tasks assigned to the currently signed-in user

### 🎨 UI / Design
- Dark-mode first design with CSS custom properties
- Smooth hover & transition effects on all interactive elements
- Responsive table layout with Lucide icons

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database ORM | Prisma 5 |
| Database | SQLite (local dev) |
| Auth | NextAuth v5 (beta) + Prisma Adapter |
| UI Icons | Lucide React |
| Styling | Vanilla CSS (CSS custom properties) |

---

## Data Models

```
User ──< WorkspaceMember >── Workspace ──< Task
                                            │
                                         assignee (User)
```

- **User**: email, name, avatar initial
- **Workspace**: name, creator, members, tasks
- **WorkspaceMember**: links a User to a Workspace with a role
- **Task**: title, description, status, priority, dueDate, assignee

---

## Getting Started (Local Development)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd tasks-tracker
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-random-secret-here"
```

Generate `AUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set Up the Database

```bash
npx prisma migrate dev --name init
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with any email address.

---

## Deploying to Vercel

> ⚠️ **Important**: This app uses SQLite, which is a **local file-based database**. SQLite does **not** work on Vercel's serverless infrastructure because the filesystem is ephemeral. You must switch to a hosted database before deploying.

### Step 1: Switch to a Hosted Database

Choose one of these Vercel-compatible options (all have free tiers):

| Option | Provider | Notes |
|---|---|---|
| **Neon** (recommended) | PostgreSQL | Vercel's native integration |
| **PlanetScale** | MySQL | Branching workflow |
| **Supabase** | PostgreSQL | Full Postgres + extras |
| **Turso** | LibSQL/SQLite-compatible | Works like SQLite, serverless-safe |

**Using Neon (quickest path):**

1. Create a free database at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Update `prisma/schema.prisma`:

```diff
datasource db {
-  provider = "sqlite"
-  url      = env("DATABASE_URL")
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
}
```

4. Run migrations against the new DB:
```bash
DATABASE_URL="<your-neon-url>" npx prisma migrate deploy
```

### Step 2: Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com) for auto-deploys.

### Step 3: Add Environment Variables in Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your hosted DB connection string |
| `AUTH_SECRET` | A secure random string (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://yourapp.vercel.app`) |

### Step 4: Add Prisma postinstall script

Add this to `package.json` so Prisma generates its client on each Vercel build:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Do I need a backend instance?

**No separate backend needed.** Next.js Server Actions and API routes run as Vercel serverless functions automatically. The only external service you need is a hosted database (as described above).

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Root page (auth gate + layout)
│   ├── layout.tsx            # App shell
│   └── api/auth/[...nextauth]/  # NextAuth handler
├── actions/
│   ├── tasks.ts              # Server actions: create, update, delete tasks
│   └── workspaces.ts         # Server actions: create workspace, invite member
├── components/
│   ├── Sidebar.tsx           # Workspace list + user info
│   ├── TaskTable.tsx         # Server component wrapper
│   └── TaskTableClient.tsx   # Interactive task table (client component)
├── auth.ts                   # NextAuth configuration
└── lib/
    └── prisma.ts             # Prisma client singleton
prisma/
└── schema.prisma             # Database schema
```

---

## Roadmap / Possible Improvements

- [ ] Due dates with calendar picker
- [ ] OAuth providers (Google, GitHub)
- [ ] Task comments / activity log
- [ ] Drag-and-drop Kanban view
- [ ] Workspace deletion / member removal
- [ ] Email notifications for assignments
