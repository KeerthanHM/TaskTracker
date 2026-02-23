import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Mock Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
            },
            async authorize(credentials) {
                if (!credentials?.email || typeof credentials.email !== "string") return null

                let user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: credentials.email.split('@')[0]
                        }
                    })
                }

                return user
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token?.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    }
})
