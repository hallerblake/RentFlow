'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Company = {
  id: string;
  name: string;
  phone?: string;
};

type CompanyContextType = {
  selectedCompany: Company | null;
  companies: Company[];
  setSelectedCompany: (company: Company) => void;
  isLoading: boolean;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.user && data.user.companies) {
        setCompanies(data.user.companies);

        // Set selected company from session or first company
        if (data.user.selectedCompanyId) {
          const selected = data.user.companies.find(
            (c: Company) => c.id === data.user.selectedCompanyId
          );
          if (selected) {
            setSelectedCompanyState(selected);
          } else if (data.user.companies.length > 0) {
            setSelectedCompanyState(data.user.companies[0]);
          }
        } else if (data.user.companies.length > 0) {
          setSelectedCompanyState(data.user.companies[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedCompany = async (company: Company) => {
    try {
      // Update session on server
      await fetch('/api/auth/switch-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id }),
      });

      // Update local state
      setSelectedCompanyState(company);

      // Refresh the page to reload data with new company filter
      router.refresh();
    } catch (error) {
      console.error('Failed to switch company:', error);
    }
  };

  return (
    <CompanyContext.Provider
      value={{ selectedCompany, companies, setSelectedCompany, isLoading }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
