import Sidebar from "@/components/Sidebar";
import TaskTableClient from "@/components/TaskTableClient";
import { auth, signIn } from "@/auth";
import prisma from "@/lib/prisma";

export default async function Page({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <div style={{ maxWidth: 400, width: "100%", padding: "clamp(24px, 6vw, 40px)", margin: "16px", backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>Tasks Tracker</h1>
          <p className="text-secondary" style={{ marginBottom: "32px" }}>Stay organized with tasks, your way.</p>

          <form action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}>
            <button type="submit" className="w-full" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "12px", borderRadius: "var(--radius-md)",
              backgroundColor: "white", color: "#1f1f1f",
              fontWeight: 600, cursor: "pointer",
              border: "1px solid #dadce0", fontSize: "0.95rem", transition: "box-shadow 0.2s"
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.2 29.6 1 24 1 14.6 1 6.7 6.6 3 14.4l7 5.4C11.8 13.6 17.4 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z" /><path fill="#FBBC05" d="M10 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.7-4.8L3.2 14C1.2 17.4 0 21.1 0 25c0 3.9 1.2 7.6 3.2 10.8l6.8-7z" /><path fill="#34A853" d="M24 47c5.6 0 10.3-1.8 13.7-5l-7.4-5.7c-1.8 1.2-4 1.9-6.3 1.9-6.6 0-12.2-4.4-14.2-10.4l-7 5.4C6.7 41.4 14.6 47 24 47z" /></svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  const userId = session.user.id!;
  const sp = await searchParams;

  // Fetch user + workspace list + workspace data in ONE parallel batch
  const [dbUser, memberships, workspaceId] = await (async () => {
    const [u, m] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.workspaceMember.findMany({
        where: { userId },
        include: { workspace: true }
      })
    ]);
    const wsId = sp?.workspaceId || m[0]?.workspace?.id;
    return [u, m, wsId] as const;
  })();

  const workspaces = memberships.map(m => m.workspace);

  // Fetch workspace data only if we have an ID — run concurrently with nothing blocking it
  let workspace = null;
  let currentUserRole = "MEMBER";
  if (workspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      include: {
        workspace: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true, availability: true }
                }
              }
            },
            tasks: {
              where: { parentId: null },
              take: 200,
              include: {
                assignee: {
                  select: { id: true, name: true, email: true, image: true }
                },
                subtasks: {
                  include: {
                    assignee: {
                      select: { id: true, name: true, email: true, image: true }
                    }
                  },
                  orderBy: { sortOrder: 'asc' }
                }
              },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
    workspace = membership?.workspace || null;
    currentUserRole = membership?.role || "MEMBER";
  }

  return (
    <div className="app-container">
      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={workspaceId}
        user={dbUser || session.user}
      />
      <main className="main-content">
        {workspace ? (
          <TaskTableClient
            workspace={workspace}
            tasks={workspace.tasks}
            members={workspace.members.map((m: any) => m.user)}
            currentUser={dbUser || session.user}
            currentUserRole={currentUserRole}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-secondary">
            {workspaces.length === 0 ? "Create a workspace to get started." : "Select a workspace."}
          </div>
        )}
      </main>
    </div>
  );
}
