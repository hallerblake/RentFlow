'use client';

import { useEffect } from 'react';
import { useCompany } from '@/lib/contexts/CompanyContext';

export function CompanyLoader() {
  const { setCompanies, setIsLoading } = useCompany();

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        } else {
          console.error('Failed to fetch companies');
          setCompanies([]);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, [setCompanies, setIsLoading]);

  return null; // This component doesn't render anything
}
