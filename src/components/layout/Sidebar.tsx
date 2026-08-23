'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useAlertStore } from '@/store/alertStore';
import { LayoutDashboard, Server, Package, ListTree, ShoppingCart, BarChart3, Users, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { unreadCount } = useAlertStore();

  if (!user) return null;

  const routes = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN'] },
    { name: 'Machines', href: '/machines', icon: Server, roles: ['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN'] },
    { name: 'Products', href: '/products', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Catalog', href: '/catalog', icon: ListTree, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN', 'TECHNICIAN'] },
  ];

  const visibleRoutes = routes.filter(route => route.roles.includes(user.role));

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shrink-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-800">M9Vends</div>
      <nav className="flex-1 py-4 space-y-1">
        {visibleRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname.startsWith(route.href);
          
          return (
            <Link
              key={route.name}
              href={route.href}
              className={clsx(
                "flex items-center px-4 py-3 mx-2 rounded-md transition-colors",
                isActive ? "bg-primary text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {route.name}
              {route.name === 'Dashboard' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 text-sm text-gray-400 truncate">
        <div className="truncate">{user.email}</div>
        <div className="capitalize">{user.role.replace('_', ' ').toLowerCase()}</div>
      </div>
    </aside>
  );
}
