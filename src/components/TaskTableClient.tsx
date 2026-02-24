"use client";

import { useState, useTransition, useRef } from "react";
import { CheckCircle2, Circle, Plus, User, Star, Trash2 } from "lucide-react";
import { createTask, updateTaskStatus, updateTaskPriority, updateTaskAssignee, deleteTask, updateTaskDescription } from "@/actions/tasks";
import { inviteMember } from "@/actions/workspaces";

export default function TaskTableClient({ workspace, tasks, members, currentUser }: any) {
    const [activeTab, setActiveTab] = useState("All Tasks");
    const [isPending, startTransition] = useTransition();

    const filteredTasks = tasks.filter((t: any) => {
        if (activeTab === "My Tasks") return t.assigneeId === currentUser?.id;
        return true;
    });

    const handleStatusChange = (taskId: string, status: string) => {
        startTransition(() => {
            updateTaskStatus(taskId, status);
        });
    };

    const handlePriorityChange = (taskId: string, priority: string) => {
        startTransition(() => {
            updateTaskPriority(taskId, (priority === "None" ? null : priority) as any);
        });
    };

    const handleAssigneeChange = (taskId: string, assigneeId: string) => {
        startTransition(() => {
            updateTaskAssignee(taskId, assigneeId === "unassigned" ? null : assigneeId);
        });
    };

    const handleDeleteTask = (taskId: string) => {
        if (confirm("Are you sure you want to delete this task?")) {
            startTransition(() => {
                deleteTask(taskId);
            });
        }
    };

    const handleDescriptionChange = (taskId: string, description: string) => {
        startTransition(() => {
            updateTaskDescription(taskId, description);
        });
    };

    const handleNewTask = () => {
        const title = prompt("Enter task title:");
        if (title) {
            startTransition(() => {
                createTask(workspace.id, { title });
            });
        }
    };

    const handleAddMember = () => {
        const email = prompt("Enter member's email address:");
        if (email) {
            startTransition(() => {
                inviteMember(workspace.id, email).catch(e => alert(e.message));
            });
        }
    };

    return (
        <div style={{ paddingBottom: "100px" }}>
            {/* Header section */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ backgroundColor: "var(--accent-success)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2 size={24} color="var(--bg-dark)" strokeWidth={3} />
                    </div>
                    {workspace.name}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Stay organized with tasks, your way.</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", gap: "24px" }}>
                    <button
                        onClick={() => setActiveTab("All Tasks")}
                        style={{ display: "flex", alignItems: "center", gap: "8px", color: activeTab === "All Tasks" ? "white" : "var(--text-secondary)", fontWeight: activeTab === "All Tasks" ? 600 : 400, paddingBottom: "12px", marginBottom: "-13px", borderBottom: activeTab === "All Tasks" ? "2px solid white" : "2px solid transparent", transition: "all var(--transition-fast)" }}
                    >
                        <Star size={16} fill={activeTab === "All Tasks" ? "white" : "none"} /> All Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab("My Tasks")}
                        style={{ display: "flex", alignItems: "center", gap: "8px", color: activeTab === "My Tasks" ? "white" : "var(--text-secondary)", fontWeight: activeTab === "My Tasks" ? 600 : 400, paddingBottom: "12px", marginBottom: "-13px", borderBottom: activeTab === "My Tasks" ? "2px solid white" : "2px solid transparent", transition: "all var(--transition-fast)" }}
                    >
                        <User size={16} fill={activeTab === "My Tasks" ? "white" : "none"} /> My Tasks
                    </button>
                </div>
                <div>
                    <button onClick={handleAddMember} style={{ padding: "8px 16px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.875rem", fontWeight: 500, marginRight: "12px", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--border-subtle)"} onMouseOut={e => e.currentTarget.style.backgroundColor = "var(--border-color)"}>
                        Invite Member
                    </button>
                    <button onClick={handleNewTask} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "var(--accent-color)", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.opacity = "0.9"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>
                        <Plus size={16} /> New
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-color)", borderTopLeftRadius: "var(--radius-md)" }}>
                <table style={{ opacity: isPending ? 0.6 : 1, transition: "opacity var(--transition-fast)" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "25%" }}>Task name</th>
                            <th style={{ width: "25%" }}>Description</th>
                            <th style={{ width: "15%" }}>Status</th>
                            <th style={{ width: "15%" }}>Assignee</th>
                            <th style={{ width: "15%" }}>Priority</th>
                            <th style={{ width: "5%" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTasks.map((t: any) => (
                            <tr key={t.id}>
                                <td style={{ fontWeight: 500 }}>
                                    <div className="flex items-center gap-2">
                                        {t.status === "Done" ? <CheckCircle2 size={18} color="var(--accent-success)" /> : <Circle size={18} color="var(--text-secondary)" />}
                                        {t.title}
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        defaultValue={t.description || ""}
                                        placeholder="Add description…"
                                        onBlur={e => {
                                            if (e.target.value !== (t.description || "")) {
                                                handleDescriptionChange(t.id, e.target.value);
                                            }
                                        }}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            outline: "none",
                                            color: t.description ? "var(--text-primary)" : "var(--text-secondary)",
                                            fontSize: "0.85rem",
                                            width: "100%",
                                            cursor: "text",
                                            padding: "4px 0",
                                        }}
                                        onFocus={e => e.currentTarget.style.color = "var(--text-primary)"}
                                    />
                                </td>
                                <td>
                                    <select
                                        value={t.status}
                                        onChange={e => handleStatusChange(t.id, e.target.value)}
                                        style={{
                                            backgroundColor: "transparent",
                                            color: t.status === "Done" ? "var(--status-done-text)" : t.status === "In progress" ? "var(--status-in-progress-text)" : "var(--status-not-started-text)",
                                            padding: "4px 10px",
                                            borderRadius: "16px",
                                            border: `1px solid ${t.status === "Done" ? "var(--status-done)" : t.status === "In progress" ? "var(--status-in-progress)" : "var(--border-color)"}`,
                                            background: t.status === "Done" ? "var(--status-done)" : t.status === "In progress" ? "var(--status-in-progress)" : "var(--status-not-started)",
                                            outline: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, appearance: "none", backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${t.status === "Done" ? "%2334d399" : t.status === "In progress" ? "%2360a5fa" : "%23a1a1aa"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", paddingRight: "26px"
                                        }}
                                    >
                                        <option value="Not started" style={{ background: "var(--bg-panel)", color: "white" }}>Not started</option>
                                        <option value="In progress" style={{ background: "var(--bg-panel)", color: "white" }}>In progress</option>
                                        <option value="Done" style={{ background: "var(--bg-panel)", color: "white" }}>Done</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={t.assigneeId || "unassigned"}
                                        onChange={e => handleAssigneeChange(t.id, e.target.value)}
                                        style={{ backgroundColor: "transparent", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "16px", border: "1px solid transparent", outline: "none", cursor: "pointer", fontSize: "0.85rem", appearance: "none" }}
                                        onMouseOver={e => e.currentTarget.style.border = "1px solid var(--border-color)"}
                                        onMouseOut={e => e.currentTarget.style.border = "1px solid transparent"}
                                    >
                                        <option value="unassigned" style={{ background: "var(--bg-panel)" }}>Unassigned</option>
                                        {members.map((m: any) => (
                                            <option key={m.id} value={m.id} style={{ background: "var(--bg-panel)" }}>{m.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        value={t.priority || "None"}
                                        onChange={e => handlePriorityChange(t.id, e.target.value)}
                                        style={{
                                            backgroundColor: "transparent",
                                            color: t.priority === "High" ? "var(--badge-high-text)" : t.priority === "Medium" ? "var(--badge-medium-text)" : t.priority === "Low" ? "var(--badge-low-text)" : "var(--text-secondary)",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            border: "none",
                                            background: t.priority === "High" ? "var(--badge-high-bg)" : t.priority === "Medium" ? "var(--badge-medium-bg)" : t.priority === "Low" ? "var(--badge-low-bg)" : "transparent",
                                            outline: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, appearance: "none"
                                        }}
                                    >
                                        <option value="None" style={{ background: "var(--bg-panel)", color: "white" }}>Set priority</option>
                                        <option value="Low" style={{ background: "var(--bg-panel)", color: "white" }}>Low</option>
                                        <option value="Medium" style={{ background: "var(--bg-panel)", color: "white" }}>Medium</option>
                                        <option value="High" style={{ background: "var(--bg-panel)", color: "white" }}>High</option>
                                    </select>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    <button
                                        onClick={() => handleDeleteTask(t.id)}
                                        style={{ color: "var(--text-secondary)", padding: "4px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all var(--transition-fast)" }}
                                        onMouseOver={e => { e.currentTarget.style.color = "var(--accent-danger)"; e.currentTarget.style.backgroundColor = "var(--badge-high-bg)"; }}
                                        onMouseOut={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                                        title="Delete task"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredTasks.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>
                                    No tasks found. Create a new task to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
                    <button onClick={handleNewTask} style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }} onMouseOver={e => e.currentTarget.style.color = "white"} onMouseOut={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                        <Plus size={16} /> New task
                    </button>
                </div>
            </div>
        </div>
    )
}
