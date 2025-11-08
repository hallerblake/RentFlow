'use client';

import React, { createContext, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

export type { UserRole };

export interface UserCompany {
  id: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export interface CurrentUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
  isActive: boolean;
  companyAssignments: UserCompany[];
}

interface UserContextType {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // Simplified user object - will be enhanced with database data later
  const currentUser = session?.user ? {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
    role: 'USER' as UserRole, // Default role, will be fetched from DB
    isActive: true, // Default to active
    companyAssignments: [], // Will be fetched from DB
  } : null;

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = currentUser?.role === 'COMPANY_ADMIN' || isSuperAdmin;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        isSuperAdmin,
        isCompanyAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
}
