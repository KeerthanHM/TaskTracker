import Sidebar from "@/components/Sidebar";
import TaskTableClient from "@/components/TaskTableClient";
import { getWorkspaces } from "@/actions/workspaces";
import { auth } from "@/auth";

export default async function Page({ searchParams }: { searchParams: Promise<{ workspaceId?: string }> }) {
  const session = await auth();
  // Default fallback values
  let workspaces: any[] = [];
  let workspace = null;
  let fallbackId = undefined;

  if (session?.user) {
    workspaces = await getWorkspaces();

    // Wait for searchParams to resolve
    const sp = await searchParams;
    const workspaceId = sp?.workspaceId || workspaces[0]?.id;

    if (workspaceId) {
      // we have a workspace ID, fetch the workspace data
      const { getWorkspace } = await import("@/actions/workspaces");
      workspace = await getWorkspace(workspaceId);
      fallbackId = workspaceId;
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={fallbackId}
        user={session?.user}
      />
      <main className="main-content">
        {workspace ? (
          <TaskTableClient
            workspace={workspace}
            tasks={workspace.tasks}
            members={workspace.members.map((m: any) => m.user)}
            currentUser={session?.user}
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
