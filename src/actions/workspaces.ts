"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createWorkspace(name: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const workspace = await prisma.workspace.create({
        data: {
            name,
            creatorId: session.user.id,
            members: {
                create: {
                    userId: session.user.id,
                    role: "OWNER"
                }
            }
        }
    })

    revalidatePath("/")
    return workspace
}

export async function getWorkspaces() {
    const session = await auth()
    if (!session?.user?.id) return []

    const memberships = await prisma.workspaceMember.findMany({
        where: { userId: session.user.id },
        include: { workspace: true }
    })

    return memberships.map((m: any) => m.workspace)
}

export async function getWorkspace(id: string) {
    const session = await auth()
    if (!session?.user?.id) return null

    const membership = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: id,
                userId: session.user.id
            }
        },
        include: {
            workspace: {
                include: {
                    members: { include: { user: true } },
                    tasks: {
                        where: { parentId: null },
                        include: {
                            assignee: true,
                            subtasks: {
                                include: { assignee: true },
                                orderBy: { sortOrder: 'asc' }
                            }
                        },
                        orderBy: { sortOrder: 'asc' }
                    }
                }
            }
        }
    })

    return membership?.workspace || null
}

export async function inviteMember(workspaceId: string, email: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    // Ensure inviter has access
    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } }
    })
    if (!membership || membership.role !== "OWNER" && membership.role !== "ADMIN") {
        throw new Error("Forbidden")
    }

    // Find user by email
    const userToInvite = await prisma.user.findUnique({ where: { email } })
    if (!userToInvite) throw new Error("User not found")

    await prisma.workspaceMember.create({
        data: {
            workspaceId,
            userId: userToInvite.id,
            role: "MEMBER"
        }
    })

    revalidatePath("/")
    revalidatePath(`/?workspaceId=${workspaceId}`)
}
