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
    async signIn({ user }) {
      // Check if user exists and is active
      // Note: On first sign-in, user won't exist yet (PrismaAdapter creates them after this callback)
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // Only check isActive if user already exists
        // If user doesn't exist, allow sign-in (they'll be created by PrismaAdapter)
        if (existingUser) {
          // Deny sign-in if user exists but is inactive
          if (!existingUser.isActive) {
            console.log(`Sign-in denied for inactive user: ${user.email}`);
            return false;
          }

          // Set SUPER_ADMIN role for specific email on subsequent sign-ins
          if (user.email === 'haller.blake@gmail.com' && existingUser.role !== 'SUPER_ADMIN') {
            await prisma.user.update({
              where: { email: user.email },
              data: { role: 'SUPER_ADMIN' },
            });
          }
        } else {
          // User doesn't exist yet - will be created by PrismaAdapter
          console.log(`New user signing in: ${user.email}`);
        }
      }
      return true;
    },
  },
});
