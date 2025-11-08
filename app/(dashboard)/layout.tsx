'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/lib/contexts/UserContext';
import { CompanyProvider } from '@/lib/contexts/CompanyContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UserProvider>
        <CompanyProvider>
          <div className="flex h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </CompanyProvider>
      </UserProvider>
    </SessionProvider>
  );
}
