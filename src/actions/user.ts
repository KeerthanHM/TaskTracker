"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateUserName(name: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const trimmed = name.trim()
    if (!trimmed || trimmed.length > 100) {
        throw new Error("Name must be between 1 and 100 characters")
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name: trimmed }
    })

    revalidatePath("/")
}

export async function updateUserAvailability(availability: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    if (!["Available", "Busy", "AFK"].includes(availability)) {
        throw new Error("Invalid availability status")
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { availability }
    })

    revalidatePath("/")
}
