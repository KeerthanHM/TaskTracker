"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateUserName(name: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.user.update({
        where: { id: session.user.id },
        data: { name }
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
