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
    async signIn({ user, account, profile }) {
      // Check if this is the first time the user is signing in
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      // If user doesn't exist yet, create them with appropriate role
      if (!existingUser && user.email) {
        // Blake Haller gets Super Admin role
        const role = user.email === 'haller.blake@gmail.com' ? 'SUPER_ADMIN' : 'USER';

        await prisma.user.update({
          where: { email: user.email },
          data: {
            role,
            firstName: profile?.given_name,
            lastName: profile?.family_name,
            name: user.name,
          },
        });
      }

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
