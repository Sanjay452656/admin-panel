'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, UserPlus } from 'lucide-react';
import clsx from 'clsx';

export default function AssignTechnicianModal({
  isOpen,
  onClose,
  machineId,
}: {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
}) {
  const queryClient = useQueryClient();
  const [selectedTech, setSelectedTech] = useState<string>('');

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      return res.data.data;
    },
    enabled: isOpen,
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments', machineId],
    queryFn: async () => {
      const res = await api.get('/api/admin/assignments?machine_id=' + machineId);
      return res.data.data || [];
    },
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: async (technician_id: string) => {
      await api.post('/api/admin/assignments', { machine_id: machineId, technician_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', machineId] });
      onClose();
      setSelectedTech('');
    },
  });

  if (!isOpen) return null;

  // Filter users to only show TECHNICIANs who are NOT already assigned to this machine
  const assignedIds = new Set((assignments || []).map((a: any) => a.technician_id?._id));
  const availableTechs = (users || []).filter(
    (u: any) => u.role === 'TECHNICIAN' && !assignedIds.has(u._id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Assign Technician
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Technician</label>
            {loadingUsers || loadingAssignments ? (
              <div className="text-sm text-gray-500 py-2">Loading...</div>
            ) : availableTechs.length === 0 ? (
              <div className="text-sm text-gray-500 py-2 border rounded-lg px-3 bg-gray-50">
                No available technicians found.
              </div>
            ) : (
              <select
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary p-2.5 border"
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
              >
                <option value="">-- Choose a technician --</option>
                {availableTechs.map((tech: any) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} ({tech.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={assignMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={() => assignMutation.mutate(selectedTech)}
            disabled={!selectedTech || assignMutation.isPending}
            className={clsx(
              "px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm flex items-center gap-2",
              (!selectedTech || assignMutation.isPending) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            )}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

