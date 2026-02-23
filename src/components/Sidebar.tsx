"use client";

import Link from "next/link";
import { Folder, LogOut, Plus, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { createWorkspace } from "@/actions/workspaces";

export default function Sidebar({ workspaces, activeWorkspaceId, user }: any) {

    const handleCreateWorkspace = async () => {
        const name = prompt("Enter new workspace name:");
        if (name) {
            await createWorkspace(name);
        }
    };

    return (
        <div style={{ width: "260px", backgroundColor: "var(--bg-sidebar)", borderRight: "1px solid var(--border-color)", padding: "24px 16px", display: "flex", flexDirection: "column" }}>

            {/* User Profile Area */}
            <div className="flex items-center gap-3" style={{ marginBottom: "32px", padding: "8px", borderRadius: "var(--radius-md)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600 }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user?.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user?.email}</div>
                </div>
            </div>

            <div className="flex items-center justify-between" style={{ padding: "0 8px", marginBottom: "16px", color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                <span>Workspaces</span>
                <button onClick={handleCreateWorkspace} style={{ color: "var(--text-secondary)", cursor: "pointer" }} title="New Workspace">
                    <Plus size={16} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
                {workspaces.map((ws: any) => {
                    const isActive = ws.id === activeWorkspaceId;
                    return (
                        <Link key={ws.id} href={`/?workspaceId=${ws.id}`} style={{
                            display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                            borderRadius: "var(--radius-md)", marginBottom: "4px",
                            backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
                            color: isActive ? "white" : "var(--text-secondary)",
                            fontWeight: isActive ? 500 : 400,
                            transition: "background-color var(--transition-fast)"
                        }}>
                            <Folder size={18} strokeWidth={isActive ? 2.5 : 2} />
                            <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{ws.name}</span>
                        </Link>
                    )
                })}
                {workspaces.length === 0 && (
                    <div style={{ padding: "10px 12px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        No workspaces yet.
                    </div>
                )}
            </div>

            <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                <button onClick={() => signOut()} style={{
                    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                    borderRadius: "var(--radius-md)", width: "100%", color: "var(--text-secondary)",
                    transition: "background-color var(--transition-fast)", cursor: "pointer"
                }} onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                    <LogOut size={18} />
                    <span>Log out</span>
                </button>
            </div>

        </div>
    )
}
