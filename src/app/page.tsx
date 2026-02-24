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

          {/* Google Sign In */}
          <form action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}>
            <button type="submit" className="w-full" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "12px", borderRadius: "var(--radius-md)",
              backgroundColor: "white", color: "#1f1f1f",
              fontWeight: 600, cursor: "pointer", marginBottom: "20px",
              border: "1px solid #dadce0", fontSize: "0.95rem", transition: "box-shadow 0.2s"
            }}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.1 0 5.8 1.1 8 2.9l6-6C34.5 3.2 29.6 1 24 1 14.6 1 6.7 6.6 3 14.4l7 5.4C11.8 13.6 17.4 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z" /><path fill="#FBBC05" d="M10 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.7-4.8L3.2 14C1.2 17.4 0 21.1 0 25c0 3.9 1.2 7.6 3.2 10.8l6.8-7z" /><path fill="#34A853" d="M24 47c5.6 0 10.3-1.8 13.7-5l-7.4-5.7c-1.8 1.2-4 1.9-6.3 1.9-6.6 0-12.2-4.4-14.2-10.4l-7 5.4C6.7 41.4 14.6 47 24 47z" /></svg>
              Sign in with Google
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>or continue with email</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)" }} />
          </div>

          {/* Email Sign In */}
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
