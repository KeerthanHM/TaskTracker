"use client";

import { useState, useOptimistic, startTransition, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Folder, LogOut, Plus, Pencil, Check, X, CircleDashed, Circle } from "lucide-react";
import { signOut } from "next-auth/react";
import { createWorkspace } from "@/actions/workspaces";
import { updateUserName, updateUserAvailability } from "@/actions/user";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar({ workspaces, activeWorkspaceId, user }: any) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || "");

    // Optimistic name
    const [optimisticName, setOptimisticName] = useOptimistic(
        user?.name || "",
        (_current: string, newName: string) => newName
    );

    // Optimistic availability
    const [optimisticAvailability, setOptimisticAvailability] = useOptimistic(
        user?.availability || "Available",
        (_current: string, newAv: string) => newAv
    );

    const [isOpen, setIsOpen] = useState(false);
    const [showCreateWs, setShowCreateWs] = useState(false);
    const [newWsName, setNewWsName] = useState("");
    const [loadingWsId, setLoadingWsId] = useState<string | null>(null);
    const router = useRouter();
    const [isPending, startNavTransition] = useTransition();

    const handleCreateWorkspace = async () => {
        const name = newWsName.trim();
        if (!name) return;
        setShowCreateWs(false);
        setNewWsName("");
        try { await createWorkspace(name); }
        catch (e: any) { alert(e.message || "Failed to create workspace"); }
    };

    const handleSaveName = () => {
        const trimmed = editName.trim();
        if (trimmed && trimmed !== user?.name) {
            startTransition(async () => {
                setOptimisticName(trimmed);
                try { await updateUserName(trimmed); }
                catch { /* revert will happen on next server render */ }
            });
        }
        setIsEditing(false);
    };



    const handleAvailabilityChange = (newStatus: string) => {
        if (newStatus === user?.availability) return;
        startTransition(async () => {
            setOptimisticAvailability(newStatus);
            await updateUserAvailability(newStatus);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available": return "var(--accent-success)";
            case "Busy": return "var(--accent-danger)";
            case "AFK": return "var(--badge-medium-text)";
            default: return "var(--text-secondary)";
        }
    };

    const StatusIcon = ({ status, size = 12 }: { status: string, size?: number }) => {
        const color = getStatusColor(status);
        switch (status) {
            case "Available": return <Check size={size} color={color} />;
            case "Busy": return <Circle size={size} color={color} fill={color} />;
            case "AFK": return <CircleDashed size={size} color={color} strokeWidth={3} />;
            default: return <Circle size={size} color={color} />;
        }
    };

    return (
        <>
            <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)} />
            <div className={`sidebar ${isOpen ? "open" : ""}`}>

                {/* Create Workspace Modal */}
                {showCreateWs && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowCreateWs(false)}>
                        <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, padding: "28px", backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>New Workspace</h3>
                                <button onClick={() => setShowCreateWs(false)} style={{ color: "var(--text-secondary)", cursor: "pointer" }}><X size={18} /></button>
                            </div>
                            <input
                                autoFocus placeholder="Enter workspace name…"
                                value={newWsName}
                                onChange={e => setNewWsName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleCreateWorkspace(); if (e.key === "Escape") setShowCreateWs(false); }}
                                style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-dark)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none" }}
                            />
                            <div className="flex items-center gap-2" style={{ marginTop: "16px", justifyContent: "flex-end" }}>
                                <button onClick={() => setShowCreateWs(false)} style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", backgroundColor: "var(--border-color)", color: "var(--text-primary)", fontWeight: 500, cursor: "pointer", fontSize: "0.9rem", border: "none" }}>Cancel</button>
                                <button onClick={handleCreateWorkspace} disabled={!newWsName.trim()} style={{ padding: "10px 20px", borderRadius: "var(--radius-md)", backgroundColor: "var(--accent-color)", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", border: "none", opacity: newWsName.trim() ? 1 : 0.5 }}>Create</button>
                            </div>
                        </div>
                    </div>
                )}
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
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", marginBottom: "4px" }}>{user?.email}</div>

                        {/* Availability Selector */}
                        <div className="flex items-center gap-1" style={{
                            fontSize: "0.75rem",
                            color: getStatusColor(optimisticAvailability),
                            fontWeight: 500,
                            position: "relative"
                        }}>
                            <StatusIcon status={optimisticAvailability} />
                            <select
                                value={optimisticAvailability}
                                onChange={(e) => handleAvailabilityChange(e.target.value)}
                                style={{
                                    appearance: "none",
                                    background: "transparent",
                                    border: "none",
                                    color: "inherit",
                                    fontWeight: "inherit",
                                    cursor: "pointer",
                                    outline: "none",
                                    padding: 0,
                                    margin: 0
                                }}
                            >
                                <option value="Available" style={{ color: "var(--text-primary)" }}>Available</option>
                                <option value="Busy" style={{ color: "var(--text-primary)" }}>Busy</option>
                                <option value="AFK" style={{ color: "var(--text-primary)" }}>AFK</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between" style={{ padding: "0 8px", marginBottom: "16px", color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    <span>Workspaces</span>
                    <button onClick={() => setShowCreateWs(true)} style={{ color: "var(--text-secondary)", cursor: "pointer" }} title="New Workspace">
                        <Plus size={16} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {workspaces.map((ws: any) => {
                        const isActive = ws.id === activeWorkspaceId;
                        const isLoading = loadingWsId === ws.id && isPending;
                        return (
                            <button key={ws.id}
                                onClick={() => {
                                    if (isActive) return;
                                    setLoadingWsId(ws.id);
                                    setIsOpen(false);
                                    startNavTransition(() => {
                                        router.push(`/?workspaceId=${ws.id}`);
                                    });
                                }}
                                className={isLoading ? "ws-loading" : ""}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                                    borderRadius: "var(--radius-md)", marginBottom: "4px", width: "100%",
                                    backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
                                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                    fontWeight: isActive ? 500 : 400,
                                    transition: "background-color var(--transition-fast)",
                                    cursor: isActive ? "default" : "pointer",
                                    position: "relative", overflow: "hidden",
                                    textAlign: "left", border: "none"
                                }}
                            >
                                <Folder size={18} strokeWidth={isActive ? 2.5 : 2} style={{ position: "relative", zIndex: 1 }} />
                                <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", position: "relative", zIndex: 1 }}>{ws.name}</span>
                            </button>
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
                        transition: "background-color var(--transition-fast)", cursor: "pointer",
                        marginBottom: "16px"
                    }} onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <LogOut size={18} />
                        <span>Log out</span>
                    </button>

                    <div style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        Developed by <a href="https://www.linkedin.com/in/keerthan-h-m-592391135/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-color)", textDecoration: "none", fontWeight: 600 }} onMouseOver={e => e.currentTarget.style.textDecoration = "underline"} onMouseOut={e => e.currentTarget.style.textDecoration = "none"}>Keerthan H M</a>
                    </div>
                </div>
            </div>
        </>
    )
}
