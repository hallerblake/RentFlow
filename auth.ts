import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Fetch full user data including role and company assignments
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            companyAssignments: {
              include: {
                company: true,
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
    async signIn({ user, account, profile }) {
      // Check if user exists and is active
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // If user exists but is inactive, deny sign-in
        if (existingUser && !existingUser.isActive) {
          return false;
        }

        // Set SUPER_ADMIN role for specific email
        if (user.email === 'haller.blake@gmail.com' && existingUser && existingUser.role !== 'SUPER_ADMIN') {
          await prisma.user.update({
            where: { email: user.email },
            data: { role: 'SUPER_ADMIN' },
          });
        }
      }
      return true;
    },
  },
});
