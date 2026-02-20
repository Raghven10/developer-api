
import { NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

function CustomPrismaAdapter(p: any) {
    return {
        ...p,
        createUser: async (user: any) => {
            const count = await prisma.user.count();
            const role = count === 0 ? "admin" : "user";
            return p.createUser({ ...user, role });
        },
        linkAccount: (account: any) => {
            const data = {
                ...account,
                refresh_expires_in: account["refresh_expires_in"],
                not_before_policy: account["not-before-policy"],
            };
            delete data["not-before-policy"];
            return p.linkAccount(data);
        },
    };
}

export const authOptions: NextAuthOptions = {
    adapter: CustomPrismaAdapter(PrismaAdapter(prisma)),
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID || "",
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
            issuer: process.env.KEYCLOAK_ISSUER,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    debug: true,
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            console.log("DEBUG: signIn callback triggered");
            console.log("DEBUG: User:", JSON.stringify(user, null, 2));
            console.log("DEBUG: Account:", JSON.stringify(account, null, 2));
            console.log("DEBUG: Profile:", JSON.stringify(profile, null, 2));
            return true;
        },
        async session({ session, token }) {
            console.log("DEBUG: session callback triggered");
            if (session.user) {
                session.user.id = token.sub as string
                // Retrieve role from database or token if available
                // For now, let's fetch from DB to be sure or just assume default
                // If we want role in session, we might need to fetch user in jwt callback
                const user = await prisma.user.findUnique({
                    where: { id: token.sub }
                })
                session.user.role = user?.role || "user"
            }
            return session
        },
        async jwt({ token, user, account, profile }) {
            console.log("DEBUG: jwt callback triggered");
            // user object is available only on sign in
            if (user) {
                console.log("DEBUG: jwt callback - user found", user.id);
                token.id = user.id
            }
            if (account) {
                console.log("DEBUG: jwt callback - account found", account.provider);
            }
            return token
        }
    },
}
