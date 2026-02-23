import { auth, signIn } from "@/auth"
import Sidebar from "@/components/Sidebar"
import TaskTable from "@/components/TaskTable"
import { getWorkspaces } from "@/actions/workspaces"

export default async function Home(props: { searchParams: Promise<{ workspaceId?: string }> }) {
  const searchParams = await props.searchParams
  const session = await auth()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <div style={{ maxWidth: 400, width: "100%", padding: "40px", backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "8px" }}>Tasks Tracker</h1>
          <p className="text-secondary" style={{ marginBottom: "32px" }}>Stay organized with tasks, your way.</p>
          <form action={async (formData) => {
            "use server"
            await signIn("credentials", formData)
          }}>
            <input name="email" type="email" placeholder="Email address" required className="w-full" style={{ padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", background: "var(--bg-dark)", color: "white", marginBottom: "16px", outline: "none" }} />
            <button type="submit" className="w-full" style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-color)", color: "white", fontWeight: 600, cursor: "pointer", transition: "opacity 0.2s" }}>Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  const workspaces = await getWorkspaces()
  let activeWorkspaceId = searchParams.workspaceId

  if (!activeWorkspaceId && workspaces.length > 0) {
    activeWorkspaceId = workspaces[0].id
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} user={session.user} />
      <main className="flex-1 overflow-auto" style={{ padding: "40px 60px" }}>
        {activeWorkspaceId ? (
          <TaskTable workspaceId={activeWorkspaceId} />
        ) : (
          <div className="flex items-center justify-center h-full text-secondary">
            No workspaces found. Create one to begin tracking tasks.
          </div>
        )}
      </main>
    </div>
  )
}
