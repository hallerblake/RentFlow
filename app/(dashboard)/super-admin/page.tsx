'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Shield, UserPlus, KeyRound, Building2 } from 'lucide-react';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  companyAssignments: {
    company: {
      id: string;
      name: string;
    };
  }[];
};

type Company = {
  id: string;
  name: string;
};

export default function SuperAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user);
    setSelectedCompanies(user.companyAssignments.map(ca => ca.company.id));
    setDialogOpen(true);
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Reset password to "password123"?')) return;

    try {
      await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
      });
      alert('Password reset to: password123');
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const handleSaveUser = async () => {
    if (!editUser) return;

    try {
      await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editUser.role,
          companyIds: selectedCompanies,
        }),
      });
      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">
              Super Admin
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage users and system settings ({users.length} users)
          </p>
        </div>
      </div>

      {/* Users Table */}
      <Card className="glass shadow-premium-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-red-500/10 text-red-700 border-red-500/30'
                          : user.role === 'COMPANY_ADMIN'
                          ? 'bg-blue-500/10 text-blue-700 border-blue-500/30'
                          : 'bg-gray-500/10 text-gray-700 border-gray-500/30'
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.companyAssignments.length > 0 ? (
                        user.companyAssignments.map((ca) => (
                          <Badge key={ca.company.id} variant="secondary" className="text-xs">
                            {ca.company.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No companies</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={(checked) => handleToggleActive(user.id, checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Building2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        <KeyRound className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Edit User: {editUser?.email}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Company Access</Label>
                <Card className="p-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {companies.map((company) => (
                      <div key={company.id} className="flex items-center gap-2">
                        <Switch
                          checked={selectedCompanies.includes(company.id)}
                          onCheckedChange={() => toggleCompany(company.id)}
                        />
                        <Label className="cursor-pointer flex-1">
                          {company.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveUser}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
