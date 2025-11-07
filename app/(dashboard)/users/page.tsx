'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users as UsersIcon, Edit, Trash2, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrentUser } from '@/lib/contexts/UserContext';

type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'USER';

type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isActive: boolean;
  companyAssignments: {
    id: string;
    companyId: string;
    company: {
      id: string;
      name: string;
    };
  }[];
};

const roleColors = {
  SUPER_ADMIN: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  COMPANY_ADMIN: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  USER: 'bg-green-500/10 text-green-700 border-green-500/20',
};

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Company Admin',
  USER: 'User',
};

export default function UsersPage() {
  const { isSuperAdmin, isCompanyAdmin } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('API returned non-array data:', data);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Check if user has permission to access this page
  if (!isSuperAdmin && !isCompanyAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to view this page.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="h-6 w-96 bg-white/30 rounded-lg animate-pulse" />
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/50 rounded animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">
            Users
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage user accounts and permissions ({users.length} total)
          </p>
        </div>
        {isSuperAdmin && (
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Empty State */}
      {users.length === 0 ? (
        <Card className="glass shadow-premium-lg border-0">
          <div className="p-16 text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No users yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Get started by adding your first user
            </p>
            {isSuperAdmin && (
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add User
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="glass shadow-premium border-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Companies</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                {(isSuperAdmin || isCompanyAdmin) && (
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-slate-200">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : 'No name'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${roleColors[user.role]} font-semibold`}
                    >
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.role === 'SUPER_ADMIN' ? (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          All Companies
                        </Badge>
                      ) : user.companyAssignments.length > 0 ? (
                        user.companyAssignments.map((assignment) => (
                          <Badge
                            key={assignment.id}
                            variant="outline"
                            className="bg-slate-50 text-slate-700"
                          >
                            <Building2 className="h-3 w-3 mr-1" />
                            {assignment.company.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">No companies</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={user.isActive
                        ? 'bg-green-500/10 text-green-700 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-700 border-gray-500/20'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {(isSuperAdmin || isCompanyAdmin) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-white/50 hover:bg-white/70"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="h-8 bg-white/50 hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
