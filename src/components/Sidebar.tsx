"use client";

import Link from "next/link";
import { Folder, LogOut, Plus, Pencil, Check, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { createWorkspace } from "@/actions/workspaces";
import { updateUserName } from "@/actions/user";
import { useState, useOptimistic, startTransition } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ workspaces, activeWorkspaceId, user }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || "");

    // Optimistic name — updates instantly in the sidebar
    const [optimisticName, setOptimisticName] = useOptimistic(
        user?.name || "",
        (_current: string, newName: string) => newName
    );

    const handleCreateWorkspace = async () => {
        const name = prompt("Enter new workspace name:");
        if (name) {
            await createWorkspace(name);
        }
    };

    const handleSaveName = () => {
        const trimmed = editName.trim();
        if (trimmed && trimmed !== user?.name) {
            startTransition(async () => {
                setOptimisticName(trimmed);
                await updateUserName(trimmed);
            });
        }
        setIsEditing(false);
    };

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)} />
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                {/* User Profile Area */}
                <div className="flex items-center gap-3" style={{ marginBottom: "32px", padding: "8px", borderRadius: "var(--radius-md)" }}>
                    {user?.image ? (
                        <img src={user.image} alt={optimisticName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                    ) : (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
                            {optimisticName?.charAt(0).toUpperCase() || "U"}
                        </div>
                    )}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setIsEditing(false); }}
                                    style={{ fontWeight: 600, fontSize: "0.9rem", background: "var(--bg-dark)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "2px 6px", width: "100%", outline: "none" }}
                                />
                                <button onClick={handleSaveName} style={{ color: "var(--accent-success)", flexShrink: 0 }}><Check size={14} /></button>
                                <button onClick={() => setIsEditing(false)} style={{ color: "var(--text-secondary)", flexShrink: 0 }}><X size={14} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1" style={{ cursor: "pointer" }} onClick={() => { setEditName(optimisticName); setIsEditing(true); }}>
                                <div style={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{optimisticName}</div>
                                <Pencil size={12} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                            </div>
                        )}
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
                            <Link key={ws.id} href={`/?workspaceId=${ws.id}`} onClick={() => setIsOpen(false)} style={{
                                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                borderRadius: "var(--radius-md)", marginBottom: "4px",
                                backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
                                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
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

                <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <ThemeToggle />
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
        </>
    )
}
