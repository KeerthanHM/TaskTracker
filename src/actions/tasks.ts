"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Helper: verify user is a member of the workspace that owns this task
async function verifyTaskAccess(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { workspaceId: true }
    })
    if (!task) throw new Error("Task not found")

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: task.workspaceId, userId } }
    })
    if (!membership) throw new Error("Forbidden")

    return task
}

export async function createTask(workspaceId: string, data: { title: string, priority?: string, assigneeId?: string, parentId?: string }) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } }
    })
    if (!membership) throw new Error("Forbidden")

    // Auto-set sortOrder to max+1
    const maxSort = await prisma.task.aggregate({
        where: { workspaceId, parentId: data.parentId || null },
        _max: { sortOrder: true }
    })
    const sortOrder = (maxSort._max?.sortOrder ?? -1) + 1

    const task = await prisma.task.create({
        data: {
            workspaceId,
            title: data.title,
            priority: data.priority,
            assigneeId: data.assigneeId,
            parentId: data.parentId,
            sortOrder,
        }
    })

    revalidatePath("/")
    return task
}

export async function updateTaskStatus(taskId: string, status: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await verifyTaskAccess(taskId, session.user.id)

    await prisma.task.update({
        where: { id: taskId },
        data: { status }
    })

    revalidatePath("/")
}

export async function updateTaskPriority(taskId: string, priority: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await verifyTaskAccess(taskId, session.user.id)

    await prisma.task.update({
        where: { id: taskId },
        data: { priority }
    })

    revalidatePath("/")
}

export async function updateTaskAssignee(taskId: string, assigneeId: string | null) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await verifyTaskAccess(taskId, session.user.id)

    await prisma.task.update({
        where: { id: taskId },
        data: { assigneeId }
    })

    revalidatePath("/")
}

export async function deleteTask(taskId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await verifyTaskAccess(taskId, session.user.id)

    await prisma.task.delete({
        where: { id: taskId }
    })

    revalidatePath("/")
}

export async function updateTaskDescription(taskId: string, description: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await verifyTaskAccess(taskId, session.user.id)

    await prisma.task.update({
        where: { id: taskId },
        data: { description }
    })

    revalidatePath("/")
}

export async function reorderTasks(taskIds: string[]) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Verify access via first task
    if (taskIds.length > 0) {
        await verifyTaskAccess(taskIds[0], session.user.id)
    }

    // Only update tasks that actually changed position
    await prisma.$transaction(
        taskIds.map((id, index) =>
            prisma.task.update({
                where: { id },
                data: { sortOrder: index }
            })
        )
    )

    revalidatePath("/")
}
