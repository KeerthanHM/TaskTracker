"use client";

import { useState, useRef, useOptimistic, startTransition as reactStartTransition, Fragment, useCallback } from "react";
import { CheckCircle2, Circle, Plus, User, Star, Trash2, GripVertical, ChevronRight, ChevronDown, BarChart3, CircleDashed, X, AlertCircle } from "lucide-react";
import { createTask, updateTaskStatus, updateTaskPriority, updateTaskAssignee, deleteTask, updateTaskDescription, reorderTasks } from "@/actions/tasks";
import { inviteMember, deleteWorkspace } from "@/actions/workspaces";

// ─── Types ─────────────────────────────────────────────
interface TaskUser {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    availability?: string;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string | null;
    assigneeId: string | null;
    assignee: TaskUser | null;
    subtasks?: Task[];
    parentId: string | null;
    sortOrder: number;
}

interface Workspace {
    id: string;
    name: string;
    tasks: Task[];
    members: { user: TaskUser }[];
}

interface TaskTableProps {
    workspace: any;
    tasks: Task[];
    members: TaskUser[];
    currentUser: any;
    currentUserRole: string;
}

// ─── Toast Notification System ──────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "error" | "success"; onClose: () => void }) {
    return (
        <div className="toast-notification" style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            display: "flex", alignItems: "center", gap: "10px",
            padding: "14px 20px", borderRadius: "var(--radius-md)",
            backgroundColor: type === "error" ? "var(--badge-high-bg)" : "var(--status-done)",
            color: type === "error" ? "var(--badge-high-text)" : "var(--status-done-text)",
            border: `1px solid ${type === "error" ? "var(--accent-danger)" : "var(--accent-success)"}`,
            fontSize: "0.9rem", fontWeight: 500,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            animation: "slideIn 0.3s ease-out"
        }}>
            <AlertCircle size={18} />
            <span>{message}</span>
            <button onClick={onClose} style={{ marginLeft: "8px", cursor: "pointer", opacity: 0.7 }}><X size={14} /></button>
        </div>
    );
}

// ─── Modal Component ────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)"
        }} onClick={onClose}>
            <div className="modal-inner" onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 420, padding: "28px",
                backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-color)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
            }}>
                <div className="flex items-center justify-between" style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{title}</h3>
                    <button onClick={onClose} style={{ color: "var(--text-secondary)", cursor: "pointer" }}><X size={18} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ─── Avatar Helper ──────────────────────────────────────
function UserAvatar({ user, size = 24 }: { user: TaskUser | null; size?: number }) {
    if (user?.image) {
        return <img src={user.image} alt={user.name || ""} referrerPolicy="no-referrer" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
    }
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: "var(--accent-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: size * 0.45 }}>
            {user?.name?.charAt(0).toUpperCase() || "?"}
        </div>
    );
}

// ─── Dashboard Component ────────────────────────────────
function Dashboard({ allTasks }: { allTasks: Task[] }) {
    const total = allTasks.length;
    const done = allTasks.filter(t => t.status === "Done").length;
    const inProgress = allTasks.filter(t => t.status === "In progress").length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const high = allTasks.filter(t => t.priority === "High").length;
    const medium = allTasks.filter(t => t.priority === "Medium").length;
    const low = allTasks.filter(t => t.priority === "Low").length;

    const cardStyle: React.CSSProperties = {
        flex: 1, padding: "20px", borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--dashboard-card-bg)", border: "1px solid var(--dashboard-card-border)",
        minWidth: 0,
    };
    const labelStyle: React.CSSProperties = { fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" };
    const valueStyle: React.CSSProperties = { fontSize: "1.75rem", fontWeight: 700 };

    if (total === 0) {
        return (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-secondary)" }}>
                <BarChart3 size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>No data yet</h3>
                <p>Create some tasks to see your workspace statistics.</p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={cardStyle}>
                    <div style={labelStyle}>Total Tasks</div>
                    <div style={valueStyle}>{total}</div>
                </div>
                <div style={cardStyle}>
                    <div style={labelStyle}>In Progress</div>
                    <div style={{ ...valueStyle, color: "var(--status-in-progress-text)" }}>{inProgress}</div>
                </div>
                <div style={cardStyle}>
                    <div style={labelStyle}>Completed</div>
                    <div style={{ ...valueStyle, color: "var(--status-done-text)" }}>{done}</div>
                </div>
                <div style={cardStyle}>
                    <div style={labelStyle}>Completion</div>
                    <div style={valueStyle}>{pct}%</div>
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    <span>Progress</span>
                    <span>{done} of {total} tasks done</span>
                </div>
                <div style={{ height: "8px", borderRadius: "var(--radius-full)", backgroundColor: "var(--progress-bar-bg)", overflow: "hidden" }}>
                    {total > 0 && (
                        <div style={{ display: "flex", height: "100%" }}>
                            <div style={{ width: `${(done / total) * 100}%`, backgroundColor: "var(--accent-success)", transition: "width 0.3s" }} />
                            <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: "var(--accent-color)", transition: "width 0.3s" }} />
                        </div>
                    )}
                </div>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--accent-success)" }} /> Done</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--accent-color)" }} /> In Progress</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--progress-bar-bg)" }} /> Not Started</span>
                </div>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 8, height: 32, borderRadius: 4, backgroundColor: "var(--badge-high-text)" }} />
                    <div><div style={labelStyle}>High Priority</div><div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--badge-high-text)" }}>{high}</div></div>
                </div>
                <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 8, height: 32, borderRadius: 4, backgroundColor: "var(--badge-medium-text)" }} />
                    <div><div style={labelStyle}>Medium Priority</div><div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--badge-medium-text)" }}>{medium}</div></div>
                </div>
                <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 8, height: 32, borderRadius: 4, backgroundColor: "var(--badge-low-text)" }} />
                    <div><div style={labelStyle}>Low Priority</div><div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--badge-low-text)" }}>{low}</div></div>
                </div>
            </div>
        </div>
    );
}

// ─── Optimistic Reducer ─────────────────────────────────
type TaskAction =
    | { type: "updateStatus"; taskId: string; status: string }
    | { type: "updatePriority"; taskId: string; priority: string | null }
    | { type: "updateAssignee"; taskId: string; assigneeId: string | null; assignee: TaskUser | null }
    | { type: "updateDescription"; taskId: string; description: string }
    | { type: "delete"; taskId: string }
    | { type: "reorder"; taskIds: string[] }
    | { type: "addTask"; task: Task }
    | { type: "addSubtask"; parentId: string; task: Task };

function applyOptimisticUpdate(tasks: Task[], action: TaskAction): Task[] {
    const updateInTasks = (list: Task[], fn: (t: Task) => Task): Task[] =>
        list.map(t => {
            const updated = fn(t);
            if (updated.subtasks) {
                updated.subtasks = updated.subtasks.map(s => fn(s));
            }
            return updated;
        });

    switch (action.type) {
        case "updateStatus":
            return updateInTasks(tasks, t => t.id === action.taskId ? { ...t, status: action.status } : t);
        case "updatePriority":
            return updateInTasks(tasks, t => t.id === action.taskId ? { ...t, priority: action.priority } : t);
        case "updateAssignee":
            return updateInTasks(tasks, t => t.id === action.taskId ? { ...t, assigneeId: action.assigneeId, assignee: action.assignee } : t);
        case "updateDescription":
            return updateInTasks(tasks, t => t.id === action.taskId ? { ...t, description: action.description } : t);
        case "delete":
            return tasks
                .filter(t => t.id !== action.taskId)
                .map(t => ({
                    ...t,
                    subtasks: t.subtasks ? t.subtasks.filter(s => s.id !== action.taskId) : []
                }));
        case "reorder": {
            const taskMap = new Map(tasks.map(t => [t.id, t]));
            return action.taskIds.map(id => taskMap.get(id)).filter((t): t is Task => !!t);
        }
        case "addTask":
            return [...tasks, action.task];
        case "addSubtask":
            return tasks.map(t =>
                t.id === action.parentId
                    ? { ...t, subtasks: [...(t.subtasks || []), action.task] }
                    : t
            );
        default:
            return tasks;
    }
}

// ─── Main Component ─────────────────────────────────────
export default function TaskTableClient({ workspace, tasks: serverTasks, members, currentUser, currentUserRole }: TaskTableProps) {
    const [activeTab, setActiveTab] = useState("All Tasks");
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const dragItem = useRef<string | null>(null);
    const dragOverItem = useRef<string | null>(null);

    // Modal states
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskParentId, setNewTaskParentId] = useState<string | undefined>(undefined);
    const [inviteEmail, setInviteEmail] = useState("");

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }, []);

    const [showDeleteWsConfirm, setShowDeleteWsConfirm] = useState(false);

    const handleDeleteWorkspace = async () => {
        try {
            await deleteWorkspace(workspace.id);
            setShowDeleteWsConfirm(false);
            showToast("Workspace deleted successfully.", "success");
        } catch (e: any) {
            showToast(e.message || "Failed to delete workspace.", "error");
            setShowDeleteWsConfirm(false);
        }
    };

    // Optimistic state
    const [optimisticTasks, addOptimistic] = useOptimistic(serverTasks, applyOptimisticUpdate);

    // Flatten for dashboard
    const allTasksFlat = optimisticTasks.flatMap(t => [t, ...(t.subtasks || [])]);

    const filteredTasks = optimisticTasks.filter(t => {
        if (activeTab === "My Tasks") return t.assigneeId === currentUser?.id;
        return true;
    });

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) next.delete(taskId);
            else next.add(taskId);
            return next;
        });
    };

    // ─── Action Handlers (with error handling) ──────────
    const handleStatusChange = (taskId: string, status: string) => {
        reactStartTransition(async () => {
            addOptimistic({ type: "updateStatus", taskId, status });
            try { await updateTaskStatus(taskId, status); }
            catch (e: any) { showToast(e.message || "Failed to update status"); }
        });
    };

    const handlePriorityChange = (taskId: string, priority: string) => {
        const val = priority === "None" ? null : priority;
        reactStartTransition(async () => {
            addOptimistic({ type: "updatePriority", taskId, priority: val });
            try { await updateTaskPriority(taskId, (val ?? null) as any); }
            catch (e: any) { showToast(e.message || "Failed to update priority"); }
        });
    };

    const handleAssigneeChange = (taskId: string, assigneeId: string) => {
        const id = assigneeId === "unassigned" ? null : assigneeId;
        const assignee = id ? members.find(m => m.id === id) || null : null;
        reactStartTransition(async () => {
            addOptimistic({ type: "updateAssignee", taskId, assigneeId: id, assignee });
            try { await updateTaskAssignee(taskId, id); }
            catch (e: any) { showToast(e.message || "Failed to update assignee"); }
        });
    };

    const handleDeleteTask = (taskId: string) => {
        setShowDeleteConfirm(null);
        reactStartTransition(async () => {
            addOptimistic({ type: "delete", taskId });
            try { await deleteTask(taskId); showToast("Task deleted", "success"); }
            catch (e: any) { showToast(e.message || "Failed to delete task"); }
        });
    };

    const handleDescriptionChange = (taskId: string, description: string) => {
        reactStartTransition(async () => {
            addOptimistic({ type: "updateDescription", taskId, description });
            try { await updateTaskDescription(taskId, description); }
            catch (e: any) { showToast(e.message || "Failed to update description"); }
        });
    };

    const handleNewTask = (parentId?: string) => {
        setNewTaskParentId(parentId);
        setNewTaskTitle("");
        setShowNewTaskModal(true);
    };

    const submitNewTask = () => {
        const title = newTaskTitle.trim();
        if (!title) return;
        setShowNewTaskModal(false);

        const tempTask: Task = {
            id: `temp-${Date.now()}`,
            title,
            description: null,
            status: "Not started",
            priority: null,
            assigneeId: null,
            assignee: null,
            subtasks: [],
            parentId: newTaskParentId || null,
            sortOrder: 9999,
        };
        reactStartTransition(async () => {
            if (newTaskParentId) {
                addOptimistic({ type: "addSubtask", parentId: newTaskParentId, task: tempTask });
                setExpandedTasks(prev => new Set(prev).add(newTaskParentId));
            } else {
                addOptimistic({ type: "addTask", task: tempTask });
            }
            try { await createTask(workspace.id, { title, parentId: newTaskParentId }); }
            catch (e: any) { showToast(e.message || "Failed to create task"); }
        });
    };

    const handleInviteMember = () => {
        const email = inviteEmail.trim();
        if (!email) return;
        setShowInviteModal(false);
        setInviteEmail("");

        reactStartTransition(async () => {
            try {
                await inviteMember(workspace.id, email);
                showToast(`Invited ${email} successfully!`, "success");
            } catch (e: any) {
                showToast(e.message || "Failed to invite member");
            }
        });
    };

    // Drag handlers
    const handleDragStart = (taskId: string) => { dragItem.current = taskId; };
    const handleDragOver = (e: React.DragEvent, taskId: string) => { e.preventDefault(); dragOverItem.current = taskId; };
    const handleDrop = () => {
        if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) return;
        const currentOrder = filteredTasks.map(t => t.id);
        const dragIdx = currentOrder.indexOf(dragItem.current);
        const dropIdx = currentOrder.indexOf(dragOverItem.current);
        if (dragIdx < 0 || dropIdx < 0) return;
        currentOrder.splice(dragIdx, 1);
        currentOrder.splice(dropIdx, 0, dragItem.current);
        reactStartTransition(async () => {
            addOptimistic({ type: "reorder", taskIds: currentOrder });
            try { await reorderTasks(currentOrder); }
            catch (e: any) { showToast(e.message || "Failed to reorder tasks"); }
        });
        dragItem.current = null;
        dragOverItem.current = null;
    };

    // ─── Style Helpers ──────────────────────────────────
    const statusStyle = (status: string): React.CSSProperties => ({
        backgroundColor: "transparent",
        color: status === "Done" ? "var(--status-done-text)" : status === "In progress" ? "var(--status-in-progress-text)" : "var(--status-not-started-text)",
        padding: "4px 10px", borderRadius: "16px",
        border: `1px solid ${status === "Done" ? "var(--status-done)" : status === "In progress" ? "var(--status-in-progress)" : "var(--border-color)"}`,
        background: status === "Done" ? "var(--status-done)" : status === "In progress" ? "var(--status-in-progress)" : "var(--status-not-started)",
        outline: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, appearance: "none" as const,
    });

    const priorityStyle = (priority: string | null): React.CSSProperties => ({
        backgroundColor: "transparent",
        color: priority === "High" ? "var(--badge-high-text)" : priority === "Medium" ? "var(--badge-medium-text)" : priority === "Low" ? "var(--badge-low-text)" : "var(--text-secondary)",
        padding: "4px 10px", borderRadius: "6px", border: "none",
        background: priority === "High" ? "var(--badge-high-bg)" : priority === "Medium" ? "var(--badge-medium-bg)" : priority === "Low" ? "var(--badge-low-bg)" : "transparent",
        outline: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, appearance: "none" as const,
    });

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)", backgroundColor: "var(--bg-dark)",
        color: "var(--text-primary)", fontSize: "0.95rem", outline: "none",
    };

    const btnPrimary: React.CSSProperties = {
        padding: "10px 20px", borderRadius: "var(--radius-md)",
        backgroundColor: "var(--accent-color)", color: "white",
        fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", border: "none"
    };

    const btnSecondary: React.CSSProperties = {
        padding: "10px 20px", borderRadius: "var(--radius-md)",
        backgroundColor: "var(--border-color)", color: "var(--text-primary)",
        fontWeight: 500, cursor: "pointer", fontSize: "0.9rem", border: "none"
    };

    // ─── Render Task Row ────────────────────────────────
    const renderTaskRow = (t: Task, isSubtask = false) => {
        const hasSubtasks = t.subtasks && t.subtasks.length > 0;
        const isExpanded = expandedTasks.has(t.id);
        const subtasksDone = hasSubtasks ? t.subtasks!.filter(s => s.status === "Done").length : 0;

        return (
            <tr
                key={t.id}
                className={isSubtask ? "subtask-row" : ""}
                draggable={!isSubtask}
                onDragStart={() => !isSubtask && handleDragStart(t.id)}
                onDragOver={(e) => !isSubtask && handleDragOver(e, t.id)}
                onDrop={() => !isSubtask && handleDrop()}
            >
                <td data-label="Task" style={{ fontWeight: 500, paddingLeft: isSubtask ? "48px" : undefined }}>
                    <div className="flex items-center gap-2 w-full">
                        {!isSubtask && (
                            <span style={{ cursor: "grab", color: "var(--text-secondary)", display: "flex", flexShrink: 0 }}>
                                <GripVertical size={16} />
                            </span>
                        )}
                        {hasSubtasks && !isSubtask ? (
                            <button onClick={() => toggleExpand(t.id)} style={{ display: "flex", color: "var(--text-secondary)", flexShrink: 0 }}>
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <span style={{ width: isSubtask ? 0 : 16, flexShrink: 0 }} />
                        )}
                        <span style={{ flexShrink: 0, display: 'flex' }}>
                            {t.status === "Done" ? <CheckCircle2 size={18} color="var(--accent-success)" /> : <Circle size={18} color="var(--text-secondary)" />}
                        </span>
                        <span className="truncate" style={{ flex: 1 }}>{t.title}</span>
                        {hasSubtasks && !isSubtask && (
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", backgroundColor: "var(--bg-hover)", padding: "2px 6px", borderRadius: "var(--radius-full)", marginLeft: "4px", flexShrink: 0 }}>
                                {subtasksDone}/{t.subtasks!.length}
                            </span>
                        )}
                    </div>
                </td>
                <td data-label="Description">
                    <textarea
                        defaultValue={t.description || ""} placeholder="Add description…"
                        rows={1}
                        onBlur={e => {
                            e.currentTarget.rows = 1;
                            e.currentTarget.style.color = t.description ? "var(--text-primary)" : "var(--text-secondary)";
                            if (e.target.value !== (t.description || "")) handleDescriptionChange(t.id, e.target.value);
                        }}
                        onFocus={e => {
                            e.currentTarget.rows = 4;
                            e.currentTarget.style.color = "var(--text-primary)";
                        }}
                        style={{ background: "transparent", border: "none", outline: "none", color: t.description ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "0.85rem", width: "100%", cursor: "text", padding: "4px 0", resize: "none", fontFamily: "inherit", lineHeight: 1.5, overflow: "hidden" }}
                    />
                </td>
                <td data-label="Status">
                    <select value={t.status} onChange={e => handleStatusChange(t.id, e.target.value)} style={statusStyle(t.status)}>
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Done">Done</option>
                    </select>
                </td>
                <td data-label="Assignee">
                    <div className="flex items-center gap-2">
                        {t.assignee && <UserAvatar user={t.assignee} size={22} />}
                        <select
                            value={t.assigneeId || "unassigned"}
                            onChange={e => handleAssigneeChange(t.id, e.target.value)}
                            style={{ backgroundColor: "transparent", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "16px", border: "1px solid transparent", outline: "none", cursor: "pointer", fontSize: "0.85rem", appearance: "none" as const }}
                            onMouseOver={e => e.currentTarget.style.border = "1px solid var(--border-color)"}
                            onMouseOut={e => e.currentTarget.style.border = "1px solid transparent"}
                        >
                            <option value="unassigned">Unassigned</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </td>
                <td data-label="Priority">
                    <select value={t.priority || "None"} onChange={e => handlePriorityChange(t.id, e.target.value)} style={priorityStyle(t.priority)}>
                        <option value="None">Set priority</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </td>
                <td data-label="Actions" style={{ textAlign: "right" }}>
                    <div className="flex items-center gap-1" style={{ justifyContent: "flex-end" }}>
                        {!isSubtask && (
                            <button
                                onClick={() => handleNewTask(t.id)}
                                style={{ color: "var(--text-secondary)", padding: "4px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all var(--transition-fast)" }}
                                onMouseOver={e => { e.currentTarget.style.color = "var(--accent-color)"; e.currentTarget.style.backgroundColor = "var(--status-in-progress)"; }}
                                onMouseOut={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                                title="Add subtask"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteConfirm(t.id)}
                            style={{ color: "var(--text-secondary)", padding: "4px", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "all var(--transition-fast)" }}
                            onMouseOver={e => { e.currentTarget.style.color = "var(--accent-danger)"; e.currentTarget.style.backgroundColor = "var(--badge-high-bg)"; }}
                            onMouseOut={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.backgroundColor = "transparent"; }}
                            title="Delete task"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    const tabs = [
        { name: "All Tasks", icon: Star },
        { name: "My Tasks", icon: User },
        { name: "Dashboard", icon: BarChart3 },
        { name: "Availability", icon: CircleDashed },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Available": return "var(--accent-success)";
            case "Busy": return "var(--accent-danger)";
            case "AFK": return "var(--badge-medium-text)";
            default: return "var(--text-secondary)";
        }
    };

    // ─── Render ─────────────────────────────────────────
    return (
        <div style={{ paddingBottom: "100px" }}>
            {/* Toast notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* New Task Modal */}
            {showNewTaskModal && (
                <Modal title={newTaskParentId ? "New Subtask" : "New Task"} onClose={() => setShowNewTaskModal(false)}>
                    <input
                        autoFocus
                        placeholder={newTaskParentId ? "Enter subtask title…" : "Enter task title…"}
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") submitNewTask(); if (e.key === "Escape") setShowNewTaskModal(false); }}
                        style={inputStyle}
                    />
                    <div className="flex items-center gap-2" style={{ marginTop: "16px", justifyContent: "flex-end" }}>
                        <button onClick={() => setShowNewTaskModal(false)} style={btnSecondary}>Cancel</button>
                        <button onClick={submitNewTask} disabled={!newTaskTitle.trim()} style={{ ...btnPrimary, opacity: newTaskTitle.trim() ? 1 : 0.5 }}>Create</button>
                    </div>
                </Modal>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <Modal title="Invite Member" onClose={() => setShowInviteModal(false)}>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>Enter the email of a registered user to invite them to this workspace.</p>
                    <input
                        autoFocus type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleInviteMember(); if (e.key === "Escape") setShowInviteModal(false); }}
                        style={inputStyle}
                    />
                    <div className="flex items-center gap-2" style={{ marginTop: "16px", justifyContent: "flex-end" }}>
                        <button onClick={() => setShowInviteModal(false)} style={btnSecondary}>Cancel</button>
                        <button onClick={handleInviteMember} disabled={!inviteEmail.trim()} style={{ ...btnPrimary, opacity: inviteEmail.trim() ? 1 : 0.5 }}>Invite</button>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <Modal title="Delete Task" onClose={() => setShowDeleteConfirm(null)}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Are you sure you want to delete this task? This action cannot be undone.</p>
                    <div className="flex items-center gap-2" style={{ justifyContent: "flex-end" }}>
                        <button onClick={() => setShowDeleteConfirm(null)} style={btnSecondary}>Cancel</button>
                        <button onClick={() => handleDeleteTask(showDeleteConfirm)} style={{ ...btnPrimary, backgroundColor: "var(--accent-danger)" }}>Delete</button>
                    </div>
                </Modal>
            )}

            {/* Delete Workspace Confirmation Modal */}
            {showDeleteWsConfirm && (
                <Modal title="Delete Workspace" onClose={() => setShowDeleteWsConfirm(false)}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Are you sure you want to delete the workspace <strong>{workspace.name}</strong>? This will permanently delete all tasks, subtasks, and member associations. This action cannot be undone.</p>
                    <div className="flex items-center gap-2" style={{ justifyContent: "flex-end" }}>
                        <button onClick={() => setShowDeleteWsConfirm(false)} style={btnSecondary}>Cancel</button>
                        <button onClick={handleDeleteWorkspace} style={{ ...btnPrimary, backgroundColor: "var(--accent-danger)" }}>Delete Workspace</button>
                    </div>
                </Modal>
            )}

            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 700, display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ backgroundColor: "var(--accent-success)", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2 size={24} color="var(--bg-dark)" strokeWidth={3} />
                    </div>
                    {workspace.name}
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Stay organized with tasks, your way.</p>
            </div>

            {/* Tabs */}
            <div className="header-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", gap: "24px", overflowX: "auto", paddingBottom: "2px" }}>
                    {tabs.map(tab => {
                        const isActive = activeTab === tab.name;
                        const Icon = tab.icon;
                        return (
                            <button key={tab.name} onClick={() => setActiveTab(tab.name)} style={{
                                display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap",
                                flexShrink: 0,
                                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                                fontWeight: isActive ? 600 : 400, paddingBottom: "12px", marginBottom: "-13px",
                                borderBottom: isActive ? "2px solid var(--text-primary)" : "2px solid transparent",
                                transition: "all var(--transition-fast)"
                            }}>
                                <Icon size={16} fill={isActive ? "currentColor" : "none"} /> {tab.name}
                            </button>
                        );
                    })}
                </div>
                {(activeTab === "All Tasks" || activeTab === "My Tasks") && (
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {currentUserRole === "OWNER" && (
                            <button onClick={() => setShowDeleteWsConfirm(true)} style={{ padding: "8px 16px", backgroundColor: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }} onMouseOver={e => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }} onMouseOut={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                                Delete Workspace
                            </button>
                        )}
                        <button onClick={() => setShowInviteModal(true)} style={{ padding: "8px 16px", backgroundColor: "var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }} onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--border-subtle)"} onMouseOut={e => e.currentTarget.style.backgroundColor = "var(--border-color)"}>
                            Invite Member
                        </button>
                        <button onClick={() => handleNewTask()} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "var(--accent-color)", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }} onMouseOver={e => e.currentTarget.style.opacity = "0.9"} onMouseOut={e => e.currentTarget.style.opacity = "1"}>
                            <Plus size={16} /> New
                        </button>
                    </div>
                )}
            </div>

            {/* Dashboard Tab */}
            {activeTab === "Dashboard" && <Dashboard allTasks={allTasksFlat} />}

            {/* Availability Tab */}
            {activeTab === "Availability" && (
                <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Team Availability</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>See who&apos;s online and available right now.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", padding: "24px" }}>
                        {members.map(m => {
                            const statusColor = getStatusColor(m.availability || "Available");
                            return (
                                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", backgroundColor: "var(--bg-dark)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                                    <div style={{ position: "relative" }}>
                                        <UserAvatar user={m} size={40} />
                                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", backgroundColor: statusColor, border: "2.5px solid var(--bg-dark)" }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: statusColor, fontWeight: 500 }}>{m.availability || "Available"}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Task Table */}
            {(activeTab === "All Tasks" || activeTab === "My Tasks") && (
                <div className="task-table-container" style={{ backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "28%" }}>Task name</th>
                                <th style={{ width: "15%" }}>Description</th>
                                <th style={{ width: "14%" }}>Status</th>
                                <th style={{ width: "18%" }}>Assignee</th>
                                <th style={{ width: "14%" }}>Priority</th>
                                <th style={{ width: "11%", minWidth: "80px" }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map(t => (
                                <Fragment key={t.id}>{renderTaskRow(t)}{expandedTasks.has(t.id) && t.subtasks?.map(sub => renderTaskRow(sub, true))}{expandedTasks.has(t.id) && (
                                    <tr key={`add-sub-${t.id}`}>
                                        <td colSpan={6} style={{ paddingLeft: "48px" }}>
                                            <button onClick={() => handleNewTask(t.id)} style={{ color: "var(--text-secondary)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }} onMouseOver={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                                                <Plus size={14} /> Add subtask
                                            </button>
                                        </td>
                                    </tr>
                                )}</Fragment>
                            ))}
                            {filteredTasks.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>No tasks found. Create a new task to get started!</td></tr>
                            )}
                        </tbody>
                    </table>
                    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-color)" }}>
                        <button onClick={() => handleNewTask()} style={{ color: "var(--text-secondary)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }} onMouseOver={e => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={e => e.currentTarget.style.color = "var(--text-secondary)"}>
                            <Plus size={16} /> New task
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
