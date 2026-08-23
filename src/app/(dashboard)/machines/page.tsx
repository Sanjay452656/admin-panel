'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Plus, Search, Server } from 'lucide-react';
import MachineCard from '@/components/machines/MachineCard';
import { useMachineStore } from '@/store/machineStore';
import { useEffect, useState } from 'react';

export default function MachinesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { machines, updateStatus } = useMachineStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await api.get('/api/admin/machines');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data) {
      data.forEach((m: any) => {
        if (!machines.has(m.deviceVID || m._id)) {
          updateStatus(m.deviceVID || m._id, m.status || 'unknown');
        }
      });
    }
  }, [data, machines, updateStatus]);

  const filteredMachines = data?.filter((m: any) => 
    (m.deviceVID || m._id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Machines</h1>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by VID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>
          <Link 
            href="/machines/new"
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Machine
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMachines?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
            <Server className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No machines found</h3>
          <p className="text-gray-500 mt-2 max-w-sm">
            {searchTerm ? "No machines matched your search criteria." : "You haven't provisioned any machines yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMachines?.map((machine: any) => (
            <MachineCard key={machine.deviceVID || machine._id} machine={machine} />
          ))}
        </div>
      )}
    </div>
  );
}
