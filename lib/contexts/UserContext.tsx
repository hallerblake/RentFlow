'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';

export interface UserCompany {
  id: string;
  userId: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
}

export interface CurrentUser {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isActive: boolean;
  companyAssignments: UserCompany[];
}

interface UserContextType {
  currentUser: CurrentUser | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    if (!clerkUser) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/users/me');

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      } else if (response.status === 404) {
        // User not found in database - create them
        const createResponse = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
          }),
        });

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          setCurrentUser(newUser);
        } else {
          console.error('Failed to create user in database');
          setCurrentUser(null);
        }
      } else {
        console.error('Failed to fetch user');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClerkLoaded) {
      fetchUser();
    }
  }, [isClerkLoaded, clerkUser?.id]);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isCompanyAdmin = currentUser?.role === 'COMPANY_ADMIN' || isSuperAdmin;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        isSuperAdmin,
        isCompanyAdmin,
        refreshUser: fetchUser,
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
