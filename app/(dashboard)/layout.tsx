import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { CompanyProvider } from '@/lib/contexts/CompanyContext';
import { CompanyLoader } from '@/components/company/CompanyLoader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyProvider>
      <CompanyLoader />
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto bg-slate-50">
            <div className="p-8 max-w-[1920px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CompanyProvider>
  );
}
