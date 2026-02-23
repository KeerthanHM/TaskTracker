import { getWorkspace } from "@/actions/workspaces"
import TaskTableClient from "./TaskTableClient"
import { auth } from "@/auth"

export default async function TaskTable({ workspaceId }: { workspaceId: string }) {
    const workspace = await getWorkspace(workspaceId)
    const session = await auth()

    if (!workspace) {
        return <div style={{ color: "var(--text-secondary)" }}>Workspace not found or access denied.</div>
    }

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <TaskTableClient
                workspace={workspace}
                tasks={workspace.tasks}
                members={workspace.members.map((m: any) => m.user)}
                currentUser={session?.user}
            />
        </div>
    )
}
