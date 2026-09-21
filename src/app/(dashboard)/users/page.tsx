'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Plus, Edit2, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Link from 'next/link';
import { useState } from 'react';
import EditUserModal from '@/components/users/EditUserModal';

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <UsersContent />
    </ProtectedRoute>
  );
}

function UsersContent() {
  const [editingUser, setEditingUser] = useState(null);
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link 
          href="/users/new"
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : users?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-6 font-medium">Name</th>
                  <th className="py-3 px-6 font-medium">Email</th>
                  <th className="py-3 px-6 font-medium">Role</th>
                  <th className="py-3 px-6 font-medium">Assigned Machines</th>
                  <th className="py-3 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {users?.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{user.name || 'N/A'}</td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.role === 'TECHNICIAN' ? (
                        <div className="flex flex-wrap gap-1">
                          {user.assigned_machines?.slice(0, 2).map((m: string) => (
                            <span key={m} className="bg-gray-100 px-2 py-0.5 rounded text-xs border">{m}</span>
                          ))}
                          {user.assigned_machines?.length > 2 && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs border">+{user.assigned_machines.length - 2}</span>
                          )}
                          {(!user.assigned_machines || user.assigned_machines.length === 0) && (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">All</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button onClick={() => setEditingUser(user as any)} className="text-gray-400 hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4 inline" />
                        </button>
                      <button 
                          onClick={async () => {
                            if (window.confirm("Are you sure you want to delete this user?")) {
                              try {
                                await api.delete(`/api/admin/users/${(user as any)._id}`);
                                window.location.reload();
                              } catch(e) {
                                alert("Failed to delete user");
                              }
                            }
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onRefresh={() => {
            // we should refetch query here, but we can't easily access queryClient here
            // we will just reload the page for simplicity or rely on react-query auto-refetch
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}
