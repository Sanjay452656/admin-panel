'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Trash2, Plus } from 'lucide-react';
import AssignTechnicianModal from './AssignTechnicianModal';

export default function AssignmentsPanel({ machineId }: { machineId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', machineId],
    queryFn: async () => {
      const res = await api.get('/api/admin/assignments?machine_id=' + machineId);
      return res.data.data || [];
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await api.delete('/api/admin/assignments/' + assignmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', machineId] });
    },
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center text-lg">
          <Users className="w-5 h-5 mr-2 text-indigo-500" />
          Assigned Technicians
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Assign
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500 text-center py-4">Loading assignments...</div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
          No technicians assigned to this machine.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <div key={assignment._id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100/50 transition-colors">
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {assignment.technician_id?.name || 'Unknown User'}
                </div>
                <div className="text-xs text-gray-500">
                  {assignment.technician_id?.email || 'No email'}
                </div>
              </div>
              <button
                onClick={() => removeMutation.mutate(assignment._id)}
                disabled={removeMutation.isPending}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Remove Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AssignTechnicianModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        machineId={machineId}
      />
    </div>
  );
}

