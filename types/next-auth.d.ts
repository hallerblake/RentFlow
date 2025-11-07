import { DefaultSession } from 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
      companyAssignments: {
        id: string;
        companyId: string;
        company: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
        };
      }[];
    } & DefaultSession['user'];
  }
}
