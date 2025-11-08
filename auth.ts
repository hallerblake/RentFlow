import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  // Use JWT strategy to avoid database calls in middleware
  session: {
    strategy: 'jwt',
  },
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
    async jwt({ token, user, account }) {
      // On sign in, add user info to token
      if (user) {
        // Fetch or create user in database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            companyAssignments: {
              include: {
                company: true,
              },
            },
          },
        });

        // If user doesn't exist, create them
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: user.email === 'haller.blake@gmail.com' ? 'SUPER_ADMIN' : 'USER',
              isActive: true,
            },
            include: {
              companyAssignments: {
                include: {
                  company: true,
                },
              },
            },
          });
        } else {
          // Set SUPER_ADMIN for Blake
          if (user.email === 'haller.blake@gmail.com' && dbUser.role !== 'SUPER_ADMIN') {
            dbUser = await prisma.user.update({
              where: { email: user.email },
              data: { role: 'SUPER_ADMIN' },
              include: {
                companyAssignments: {
                  include: {
                    company: true,
                  },
                },
              },
            });
          }

          // Check if user is active
          if (!dbUser.isActive) {
            throw new Error('User account is inactive');
          }
        }

        // Add user data to JWT token
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.isActive = dbUser.isActive;
        token.companyAssignments = dbUser.companyAssignments;
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.isActive = token.isActive as boolean;
        session.user.companyAssignments = token.companyAssignments as any;
      }
      return session;
    },
  },
});
