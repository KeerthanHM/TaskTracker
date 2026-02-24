"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

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
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1

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

    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new Error("Not found")

    await prisma.task.update({
        where: { id: taskId },
        data: { status }
    })

    revalidatePath("/")
}

export async function updateTaskPriority(taskId: string, priority: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.task.update({
        where: { id: taskId },
        data: { priority }
    })

    revalidatePath("/")
}

export async function updateTaskAssignee(taskId: string, assigneeId: string | null) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.task.update({
        where: { id: taskId },
        data: { assigneeId }
    })

    revalidatePath("/")
}

export async function deleteTask(taskId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.task.delete({
        where: { id: taskId }
    })

    revalidatePath("/")
}

export async function updateTaskDescription(taskId: string, description: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.task.update({
        where: { id: taskId },
        data: { description }
    })

    revalidatePath("/")
}

export async function reorderTasks(taskIds: string[]) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Update sortOrder for each task in sequence
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
