import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom user data to the session
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            companyAssignments: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.isActive = dbUser.isActive;
          session.user.companyAssignments = dbUser.companyAssignments;
        }
      }
      return session;
    },
    async signIn({ user, profile }) {
      // Allow sign in
      return true;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'database',
  },
});
