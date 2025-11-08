'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

type ExpenseCategory = {
  id: string;
  name: string;
  isDefault: boolean;
};

export default function SettingsPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expense-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (response.ok) {
        toast.success('Category added successfully');
        setNewCategoryName('');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editingName.trim() || editingName === categories.find(c => c.id === id)?.name) {
      setEditingId(null);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/expense-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        toast.success('Category updated successfully');
        setEditingId(null);
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      const response = await fetch(`/api/expense-categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm('This will add 18 default expense categories. Continue?')) return;

    setInitializing(true);
    try {
      const response = await fetch('/api/expense-categories/init-defaults', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.count} default categories added successfully`);
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to initialize default categories');
      }
    } catch (error) {
      console.error('Failed to initialize defaults:', error);
      toast.error('Failed to initialize default categories');
    } finally {
      setInitializing(false);
    }
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
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">Settings</h1>
        </div>
        <p className="text-lg text-muted-foreground">Manage your company settings and preferences</p>
      </div>

      {/* Expense Categories Section */}
      <Card className="glass shadow-premium-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            <CardTitle>Expense Categories</CardTitle>
          </div>
          <CardDescription>
            Manage the expense categories for your company. These categories will be available when creating expenses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Category Form */}
          <div className="space-y-3">
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter new category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  disabled={saving}
                />
              </div>
              <Button type="submit" disabled={saving || !newCategoryName.trim()} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </form>

            {categories.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">No categories yet?</p>
                  <p className="text-xs text-blue-700">Initialize 18 common property expense categories</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleInitializeDefaults}
                  disabled={initializing}
                  className="border-blue-300 hover:bg-blue-100"
                >
                  {initializing ? 'Initializing...' : 'Add Defaults'}
                </Button>
              </div>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Your Categories ({categories.length})</Label>
            {categories.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-300 rounded-lg">
                <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No categories yet. Add your first category above.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                  >
                    {editingId === category.id ? (
                      <>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleEditCategory(category.id);
                            }
                            if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          autoFocus
                          disabled={saving}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleEditCategory(category.id)}
                          disabled={saving}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Tag className="h-4 w-4 text-blue-600" />
                        <span className="flex-1 font-medium">{category.name}</span>
                        {category.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(category.id);
                              setEditingName(category.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
