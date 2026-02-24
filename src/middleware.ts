import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
    const isRootPath = req.nextUrl.pathname === "/"

    // Allow auth routes and root path (login page) to pass through always
    if (isAuthRoute || isRootPath) return NextResponse.next()

    // Redirect unauthenticated users to root (which shows login)
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
}
