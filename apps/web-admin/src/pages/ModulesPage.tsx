import { useState } from 'react';
import { useModules, useCreateModule, useUpdateModule, useDeleteModule } from '../api/modules';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@workspace/ui/components/dialog';
import { ModulesTable } from '../components/modules/ModulesTable';
import { CreateModuleForm } from '../components/forms/CreateModuleForm';
import { EditModuleForm } from '../components/forms/EditModuleForm';
import type { CreateModuleDto, UpdateModuleDto, ModuleQueryDto } from '@workspace/dtos';

export default function ModulesPage() {
  const [courseIdFilter, setCourseIdFilter] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);

  const queryParams: ModuleQueryDto = {
    page: 1,
    limit: 1000, // Load all data for client-side filtering and sorting
    ...(courseIdFilter && { courseId: courseIdFilter }),
  };

  const { data: modulesData, isLoading, error, refetch } = useModules(queryParams);
  const createModule = useCreateModule();
  const updateModule = useUpdateModule();
  const deleteModule = useDeleteModule();

  const modules = modulesData?.data || [];

  const handleCreate = async (moduleData: CreateModuleDto) => {
    try {
      await createModule.mutateAsync(moduleData);
      setShowCreateDialog(false);
      refetch();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdate = async (id: string, moduleData: UpdateModuleDto) => {
    try {
      await updateModule.mutateAsync({ id, module: moduleData });
      setEditingModule(null);
      refetch();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await deleteModule.mutateAsync(id);
      refetch();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = (module: any) => {
    setEditingModule(module);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500 py-8">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">Manage all modules in the system</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>Create Module</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
            </DialogHeader>
            <CreateModuleForm onSubmit={handleCreate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Course ID Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Filter by Course ID"
          value={courseIdFilter}
          onChange={(e) => setCourseIdFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Modules Table */}
      <ModulesTable
        data={modules}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Dialog */}
      {editingModule && (
        <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
            </DialogHeader>
            <EditModuleForm
              module={editingModule}
              onSubmit={(data) => handleUpdate(editingModule.id, data)}
              onCancel={() => setEditingModule(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
