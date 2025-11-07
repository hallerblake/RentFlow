'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrentUser } from './UserContext';

interface Company {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isSuperAdmin } = useCurrentUser();
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter companies based on user role
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  useEffect(() => {
    if (!currentUser || companies.length === 0) {
      setFilteredCompanies([]);
      return;
    }

    if (isSuperAdmin) {
      // Super admins see all companies
      setFilteredCompanies(companies);
    } else {
      // Company admins and users see only their assigned companies
      const assignedCompanyIds = currentUser.companyAssignments.map((ca) => ca.companyId);
      const assigned = companies.filter((c) => assignedCompanyIds.includes(c.id));
      setFilteredCompanies(assigned);
    }
  }, [currentUser, companies, isSuperAdmin]);

  // Load selected company from localStorage on mount
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId && filteredCompanies.length > 0) {
      const company = filteredCompanies.find(c => c.id === savedCompanyId);
      if (company) {
        setSelectedCompanyState(company);
      } else if (filteredCompanies.length > 0) {
        // If saved company not found, select first available
        setSelectedCompanyState(filteredCompanies[0]);
      }
    } else if (filteredCompanies.length > 0 && !selectedCompany) {
      // Auto-select first company if none selected
      setSelectedCompanyState(filteredCompanies[0]);
    }
    setIsLoading(false);
  }, [filteredCompanies]);

  const setSelectedCompany = (company: Company | null) => {
    setSelectedCompanyState(company);
    if (company) {
      localStorage.setItem('selectedCompanyId', company.id);
    } else {
      localStorage.removeItem('selectedCompanyId');
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies: filteredCompanies,
        setCompanies,
        isLoading,
        setIsLoading,
      }}
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
